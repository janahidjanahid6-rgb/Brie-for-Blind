import React, { useState, useEffect, useRef } from 'react';
import {
  AssistantMode,
  AppSettings,
  SmartHomeState,
  PlayApp,
  Contact,
  WhatsAppMessage,
  CallState,
  AutonomousActionLog,
  VoiceSpeakerType,
  BrieReasoningLog,
  PendingMoneyTransfer,
} from './types';
import {
  INITIAL_APPS,
  INITIAL_CONTACTS,
  INITIAL_MESSAGES,
  INITIAL_SMART_HOME,
} from './data/mockData';
import { speech } from './services/speech';
import { sounds } from './services/soundEffects';
import { haptics } from './services/haptics';
import { parseVoiceCommand } from './services/intentParser';
import { OnboardingModal } from './components/OnboardingModal';
import { GesturePad } from './components/GesturePad';
import { AutonomousTakeoverVisualizer } from './components/AutonomousTakeoverVisualizer';
import { GhostTakeoverPanel } from './components/GhostTakeoverPanel';
import { OriginalSiriOverlay } from './components/OriginalSiriOverlay';
import { SmartHomePanel } from './components/SmartHomePanel';
import { PhoneSimulatorPanel } from './components/PhoneSimulatorPanel';
import { MagnifierLoupe } from './components/MagnifierLoupe';
import { SettingsModal } from './components/SettingsModal';
import { WakeWordTrainer } from './components/WakeWordTrainer';
import { SmartHomeSetupWizard } from './components/SmartHomeSetupWizard';
import { SiriScreenEdgeGlow } from './components/SiriScreenEdgeGlow';
import { SiriFloatingHUD } from './components/SiriFloatingHUD';
import { SiriOrb } from './components/SiriOrb';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import {
  DrawableManagerModal,
  DrawableAssets,
  DEFAULT_ACTIVE_XML,
  DEFAULT_SLEEP_XML,
} from './components/DrawableManagerModal';
import { VoiceActivationStatusHUD } from './components/VoiceActivationStatusHUD';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sliders,
  Home,
  Smartphone,
  Eye,
  EyeOff,
  Car,
  RotateCcw,
  Zap,
  Battery,
  Clock,
  Sparkles,
  HelpCircle,
  HelpCircle as HelpIcon,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Brain,
  ChevronDown,
  ChevronUp,
  Ghost,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';

export default function App() {
  // App Mode & Onboarding State
  const [currentMode, setCurrentMode] = useState<AssistantMode>('blind');
  const [activeTab, setActiveTab] = useState<'gestures' | 'ghost' | 'takeover' | 'smarthome' | 'phone'>('gestures');

  // User Friendship & Identity (Rule: Always call friend by name in every reply!)
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('@brie_user_name') || 'James';
    } catch {
      return 'James';
    }
  });

  // Permission Guard: Contacts Permission (Must ask first!)
  const [hasContactsPermission, setHasContactsPermission] = useState<boolean>(() => {
    try {
      return localStorage.getItem('@brie_contacts_permission') === 'true';
    } catch {
      return false;
    }
  });
  const [awaitingContactsPermission, setAwaitingContactsPermission] = useState<boolean>(false);

  // Money Rule: 2-Step Confirmation Flow
  const [pendingMoneyTransfer, setPendingMoneyTransfer] = useState<PendingMoneyTransfer | null>(null);

  // Emotional Support & Motivational Friend Mode
  const [activeEmotion, setActiveEmotion] = useState<string | null>(null);

  // Music Choice State
  const [awaitingMusicSong, setAwaitingMusicSong] = useState<boolean>(false);

  // Brie Voice Fullscreen Overlay
  const [isSiriOverlayOpen, setIsSiriOverlayOpen] = useState<boolean>(false);

  // Accessibility Settings
  const [settings, setSettings] = useState<AppSettings>({
    wakeWord: 'hey brie',
    trainedWakeWords: [],
    speechRate: 1.15,
    speechPitch: 1.0,
    selectedVoiceURI: '',
    hapticsEnabled: true,
    soundEffectsEnabled: true,
    autoListenWakeWord: true,
    fontScale: 105,
    highContrastTheme: 'yellow-black',
    magnifierEnabled: false,
    offlineOnly: true,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMagnifierOpen, setIsMagnifierOpen] = useState(false);
  const [isWakeWordTrainerOpen, setIsWakeWordTrainerOpen] = useState(false);
  const [isSmartHomeWizardOpen, setIsSmartHomeWizardOpen] = useState(false);
  const [isAndroidCodeModalOpen, setIsAndroidCodeModalOpen] = useState(false);
  const [isDrawableModalOpen, setIsDrawableModalOpen] = useState(false);
  const [isBrieActive, setIsBrieActive] = useState(true);
  const [drawables, setDrawables] = useState<DrawableAssets>(() => {
    try {
      const saved = localStorage.getItem('@brie_drawables');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      activeUrl: null,
      activeXml: DEFAULT_ACTIVE_XML,
      sleepUrl: null,
      sleepXml: DEFAULT_SLEEP_XML,
    };
  });

  // Assistant Voice & Listening State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [lastBriReply, setLastBriReply] = useState<string>(() => `Ready for voice commands, James.`);

  // Voice Security: Owner vs Stranger (> 85% -> OWNER, < 85% -> STRANGER Guest Mode)
  const [voiceSimilarity, setVoiceSimilarity] = useState<number>(94);
  const [currentSpeaker, setCurrentSpeaker] = useState<VoiceSpeakerType>('owner');
  const [latestReasoning, setLatestReasoning] = useState<BrieReasoningLog | null>({
    id: 'reason-init',
    timestamp: 'Just now',
    userInput: 'System Standby',
    speaker: 'owner',
    voiceSimilarity: 94,
    isOwner: true,
    step1_intent: 'Context established: Blind accessibility assistance active.',
    step2_security: 'Voice Biometric Match: 94% (Threshold: >85%). OWNER verified (Sarah).',
    step3_safety: 'Safety check: All systems verified and authorized for autonomous execution.',
    step4_action: 'Descriptive speech active: Ready to assist owner without requiring screen viewing.',
  });
  const [isReasoningDrawerOpen, setIsReasoningDrawerOpen] = useState(false);

  // Phone Simulation State
  const [apps, setApps] = useState<PlayApp[]>(INITIAL_APPS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [messages, setMessages] = useState<WhatsAppMessage[]>(INITIAL_MESSAGES);
  const [smartHome, setSmartHome] = useState<SmartHomeState>(INITIAL_SMART_HOME);
  const [flashlightOn, setFlashlightOn] = useState(false);

  // Phone Call State
  const [currentCall, setCurrentCall] = useState<CallState>({
    isActive: false,
    isRinging: false,
    contactName: '',
    phoneNumber: '',
    durationSeconds: 0,
    isSpeakerOn: true,
    isMuted: false,
  });

  // Autonomous Task Queue & Progress
  const [activeTask, setActiveTask] = useState<AutonomousActionLog | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ appName: string; percent: number } | null>(null);
  const [actionLogs, setActionLogs] = useState<AutonomousActionLog[]>([
    {
      id: 'log-init',
      timestamp: 'Just now',
      actionType: 'system',
      title: 'Brie Ready & Standing By',
      details: 'Full phone takeover ready. Voice recognition and tactile gestures armed.',
      status: 'completed',
      spokenFeedback: "Hey there! I'm right here whenever you need me.",
    },
  ]);

  // Ringing audio tracker
  const ringAudioRef = useRef<{ stop: () => void } | null>(null);
  const callIntervalRef = useRef<any>(null);

  // Check saved preferences on launch (@user_app_mode)
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('@user_app_mode') as AssistantMode | null;
      if (savedMode) {
        setCurrentMode(savedMode);
      }
    } catch {
      // storage unavailable
    }
  }, []);

  // System Triggers: Incoming Call Protocol (Blind vs Sighted Companion)
  const handleSimulateIncomingCall = (caller = { name: 'John Doe', phoneNumber: '+1 (555) 019-2831' }) => {
    sounds.playEarconStart();
    haptics.callPulse();
    const ringAudio = sounds.playPhoneRingPulse();
    ringAudioRef.current = ringAudio;

    if (currentMode === 'blind') {
      // BLIND MODE: Auto-announces and auto-answers in 3 seconds on speakerphone
      setCurrentCall({
        isActive: true,
        isRinging: true,
        isIncoming: true,
        contactName: caller.name,
        phoneNumber: caller.phoneNumber,
        durationSeconds: 0,
        isSpeakerOn: true,
        isMuted: false,
        autoAnswerCountdown: 3,
      });

      speech.speak(
        `Incoming call from ${caller.name}. I will answer it automatically for you in 3 seconds.`,
        {
          rate: settings.speechRate,
          onEnd: () => {
            let countdown = 3;
            const timer = setInterval(() => {
              countdown--;
              if (countdown <= 0) {
                clearInterval(timer);
                if (ringAudioRef.current) ringAudioRef.current.stop();
                sounds.playSuccess();
                haptics.success();
                setCurrentCall((prev) => ({
                  ...prev,
                  isRinging: false,
                  autoAnswerCountdown: null,
                }));
                speech.speak('Call connected on speakerphone.', { rate: settings.speechRate });
              } else {
                setCurrentCall((prev) => ({ ...prev, autoAnswerCountdown: countdown }));
              }
            }, 1000);
          },
        }
      );
    } else {
      // SIGHTED / COMPANION MODE: Ask permission first before pronouncing caller name
      setCurrentCall({
        isActive: true,
        isRinging: true,
        isIncoming: true,
        contactName: caller.name,
        phoneNumber: caller.phoneNumber,
        durationSeconds: 0,
        isSpeakerOn: true,
        isMuted: false,
        permissionPending: true,
      });

      speech.speak(
        'Your phone is calling. Should I pronounce the name? Just say Yes or No. I am listening.',
        {
          rate: settings.speechRate,
          onEnd: () => {
            speech.startListening();
            setIsListening(true);
          },
        }
      );
    }
  };

  const handlePronounceDecision = (shouldPronounce: boolean) => {
    if (shouldPronounce) {
      sounds.playSonarPing();
      speech.speak(`The caller name is ${currentCall.contactName || 'John Doe'}.`, {
        rate: settings.speechRate,
      });
    } else {
      sounds.playEarconStop();
      speech.speak('Call announcement bypassed.', { rate: settings.speechRate });
    }
    setCurrentCall((prev) => ({ ...prev, permissionPending: false }));
  };

  // Battery Warning Protocol
  const handleSimulateBatteryLow = () => {
    sounds.playError();
    haptics.emergency();
    speech.speak('Put me to a charger. Put me to a charger. Battery is running low.', {
      rate: settings.speechRate,
    });
    setLastBriReply('Put me to a charger. Put me to a charger. Battery is running low.');
  };

  const handleClearPreferences = () => {
    try {
      localStorage.removeItem('@user_app_mode');
    } catch {}
    setCurrentMode('onboarding');
    sounds.playSonarPing();
  };

  // Sync services with settings
  useEffect(() => {
    sounds.setEnabled(settings.soundEffectsEnabled);
    haptics.setEnabled(settings.hapticsEnabled);
    speech.setWakeWords([settings.wakeWord, 'hey brie', 'brie', 'hello brie', 'hey bri', 'bri']);
  }, [settings]);

  // Handle active call duration timer
  useEffect(() => {
    if (currentCall.isActive && !currentCall.isRinging) {
      callIntervalRef.current = setInterval(() => {
        setCurrentCall((prev) => ({
          ...prev,
          durationSeconds: prev.durationSeconds + 1,
        }));
      }, 1000);
    } else {
      clearInterval(callIntervalRef.current);
    }
    return () => clearInterval(callIntervalRef.current);
  }, [currentCall.isActive, currentCall.isRinging]);

  // Initialize Speech Recognition callbacks
  useEffect(() => {
    speech.setCallbacks(
      () => {
        // Wake Word Detected!
        sounds.playEarconStart();
        haptics.listeningStart();
        setIsListening(true);
      },
      (text: string, isFinal: boolean) => {
        setSpokenTranscript(text);
        if (isFinal) {
          handleProcessVoiceInput(text);
        }
      },
      (err: string) => {
        setIsListening(false);
      }
    );
  }, [settings.wakeWord, smartHome, apps, contacts, messages, currentMode]);

  const isBrieActiveRef = useRef(isBrieActive);
  useEffect(() => {
    isBrieActiveRef.current = isBrieActive;
  }, [isBrieActive]);

  // Central voice speech output that keeps hands-free continuous listening loop alive
  const speakBrie = (
    text: string,
    options: { rate?: number; onEnd?: () => void; resumeListening?: boolean } = {}
  ) => {
    setIsSpeaking(true);
    const resume = options.resumeListening ?? isBrieActiveRef.current;
    speech.speak(text, {
      rate: options.rate ?? settings.speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        options.onEnd?.();
        if (resume && isBrieActiveRef.current) {
          setTimeout(() => {
            if (isBrieActiveRef.current) {
              speech.startListening();
              setIsListening(true);
            }
          }, 350);
        }
      },
      onError: () => {
        setIsSpeaking(false);
        if (resume && isBrieActiveRef.current) {
          setTimeout(() => {
            if (isBrieActiveRef.current) {
              speech.startListening();
              setIsListening(true);
            }
          }, 350);
        }
      },
    });
  };

  const activateBrie = () => {
    sounds.playEarconStart();
    haptics.success();
    setIsBrieActive(true);
    isBrieActiveRef.current = true;
    const wakeMsg = `I'm here ${userName}! I woke up and I am following your orders. What do you need?`;
    setLastBriReply(wakeMsg);
    speakBrie(wakeMsg, { resumeListening: true });
    addAuditLog({
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType: 'system',
      title: 'ACTIVATE Selected',
      details: 'Brie woke up into ACTIVATE state. Continuous hands-free listening enabled.',
      status: 'completed',
      spokenFeedback: wakeMsg,
    });
  };

  const deactivateBrie = () => {
    sounds.playEarconStop();
    haptics.listeningStop();
    setIsBrieActive(false);
    isBrieActiveRef.current = false;
    const farewell = `Okay ${userName}, I am leaving now like a ghost. Your phone is normal. Just say ACTIVATE or Hey Brie when you need me again.`;
    setLastBriReply(farewell);
    speech.speak(farewell, {
      rate: settings.speechRate,
      onEnd: () => {
        speech.stopListening();
        setIsListening(false);
        setIsSpeaking(false);
      },
    });
    addAuditLog({
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType: 'system',
      title: 'DEACTIVATE Selected (Ghost Left)',
      details: 'Brie entered sleep mode. Services stopped. Phone returned to normal.',
      status: 'completed',
      spokenFeedback: farewell,
    });
  };

  // Continuous hands-free listening auto-start when active
  useEffect(() => {
    if (currentMode !== 'onboarding' && isBrieActive) {
      const timer = setTimeout(() => {
        try {
          speech.startListening();
          setIsListening(true);
        } catch {}
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentMode, isBrieActive]);

  // Execute Voice Command Intent
  const handleProcessVoiceInput = async (transcript: string) => {
    sounds.playEarconStop();
    haptics.listeningStop();
    setIsListening(false);

    if (!transcript.trim()) return;

    const lower = transcript.toLowerCase();
    const magicActivate = ['activate', 'hey brie', 'brie wake up', 'wake up brie', 'brie are you there', 'brie activate'];
    const magicDeactivate = ['deactivate', 'brie sleep', 'brie go to sleep', 'brie leave', 'brie deactivate', 'brie go away', 'leave my phone', 'brie i am tired'];

    if (magicActivate.some((w) => lower.includes(w))) {
      activateBrie();
      return;
    }

    if (magicDeactivate.some((w) => lower.includes(w))) {
      deactivateBrie();
      return;
    }

    if (!isBrieActive) {
      return;
    }

    // Check if waiting for permission decision on incoming call
    if (currentCall.permissionPending) {
      if (/yes|pronounce|say|sure|yeah|yep|okay|tell me/i.test(transcript)) {
        handlePronounceDecision(true);
        return;
      }
      if (/no|don't|quiet|nope|cancel|bypass|silent/i.test(transcript)) {
        handlePronounceDecision(false);
        return;
      }
    }

    // Parse command offline first
    const intent = parseVoiceCommand(transcript, [settings.wakeWord, 'hey brie', 'brie', 'hello brie', 'hey bri', 'bri']);

    // Log the voice interaction
    const logId = 'log-' + Date.now();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step-by-Step Human Reasoning Engine (Rule 1: Think First)
    // 1. Intent & Context
    let intentMeaning = `Understood command: "${transcript}". Intent mapped to ${intent.type}.`;
    if (intent.type === 'READ_AND_REPLY') {
      intentMeaning = `Compound Command: Read latest WhatsApp message from contact and autonomously reply with: "${intent.replyText}". Context: Busy/Hands-free efficiency.`;
    } else if (intent.type === 'WHATSAPP_MESSAGE') {
      intentMeaning = `Autonomous WhatsApp message to ${intent.contact}: "${intent.messageText}". Context: Independent communication.`;
    } else if (intent.type === 'CALL_PHONE') {
      intentMeaning = `Cellular call request for ${intent.contactOrNumber}. Context: Hands-free calling.`;
    } else if (intent.type === 'DOWNLOAD_APP') {
      intentMeaning = `Play Store autonomous download & installation request for ${intent.appName}.`;
    } else if (intent.type === 'OPEN_APP') {
      intentMeaning = `Direct application launch request for ${intent.appName}.`;
    } else if (intent.type === 'READ_MESSAGES') {
      intentMeaning = `Querying unread messages and speaking content non-visually.`;
    }

    // 2. Voice Security Check (Threshold: >85% OWNER, <85% STRANGER)
    const isOwner = voiceSimilarity >= 85;
    const computedSpeaker: VoiceSpeakerType = isOwner ? 'owner' : 'stranger';

    const securityCheck = isOwner
      ? `Voice Similarity: ${voiceSimilarity}% (Threshold: ≥85%). OWNER verified (Sarah). Full device control authorized.`
      : `Voice Similarity: ${voiceSimilarity}% (Threshold: <85%). STRANGER detected (voice_id != OWNER). Protective Guest Mode triggered.`;

    // 3. Safety & Privacy Guard (Rule 3 & 4)
    const isEmergencyCall =
      intent.type === 'CALL_PHONE' &&
      /emergency|sos|911|ambulance|police|help/i.test(intent.contactOrNumber);
    const isAllowedForStranger = intent.type === 'PHONE_TIME' || isEmergencyCall || intent.type === 'STOP_TALKING';

    const safetyCheck = isOwner
      ? 'Safety check passed: Biometric match ≥85% threshold. Safe for autonomous execution.'
      : isAllowedForStranger
      ? 'Safety check passed: Permitted basic emergency/utility command for guest.'
      : 'BLOCKED (Rule 3 & 4): Voice similarity <85%. Stranger cannot access private messages, photos, apps, phone controls, or smart home locks.';

    // 4. Non-visual Descriptive Action (Rule 2)
    const actionPlan = !isOwner && !isAllowedForStranger
      ? 'Speak standard stranger refusal phrase clearly.'
      : 'Execute autonomous task and deliver descriptive non-visual spoken feedback (no visual-only instructions).';

    const newReasoningLog: BrieReasoningLog = {
      id: 'reason-' + Date.now(),
      timestamp: nowTime,
      userInput: transcript,
      speaker: computedSpeaker,
      voiceSimilarity: voiceSimilarity,
      isOwner: isOwner,
      step1_intent: intentMeaning,
      step2_security: securityCheck,
      step3_safety: safetyCheck,
      step4_action: actionPlan,
    };
    setLatestReasoning(newReasoningLog);

    // Rule 3 & 4 Enforcement: Refuse strangers for private operations
    if (!isOwner && !isAllowedForStranger) {
      sounds.playError();
      haptics.emergency();
      const strangerRefusal = "I hear a different voice. I can only do basic things like time and calling emergency. For private things, I need my owner.";
      setLastBriReply(strangerRefusal);
      speech.speak(strangerRefusal, { rate: settings.speechRate });

      addAuditLog({
        id: logId,
        timestamp: nowTime,
        actionType: 'system',
        title: 'Stranger Voice Blocked (Guest Mode)',
        details: `Refused command "${transcript}" from unauthorized voice. Owner privacy protected.`,
        status: 'failed',
        spokenFeedback: strangerRefusal,
      });
      return;
    }

    // Dialog State Interception: Pending Money 2-Step Confirmation
    if (pendingMoneyTransfer) {
      if (intent.type === 'CONFIRM_YES' || /yes|proceed|sure|okay|confirm|open/i.test(transcript)) {
        if (pendingMoneyTransfer.step === 'confirm_details') {
          // STEP 2: Last check before opening app for manual PIN entry
          sounds.playSonarPing();
          haptics.tap();
          const step2Msg = `Last check friend - I'm going to open ${pendingMoneyTransfer.provider} with that amount. You will need to enter your PIN yourself. Should I open it now?`;
          setPendingMoneyTransfer((prev) => (prev ? { ...prev, step: 'confirm_open_app' } : null));
          setLastBriReply(step2Msg);
          speech.speak(step2Msg, { rate: settings.speechRate });
          addAuditLog({
            id: logId,
            timestamp: nowTime,
            actionType: 'system',
            title: 'Money Rule: Step 1 Confirmed',
            details: `User confirmed sending ${pendingMoneyTransfer.amount} to ${pendingMoneyTransfer.recipient}. Moving to Step 2.`,
            status: 'running',
            spokenFeedback: step2Msg,
          });
          return;
        } else if (pendingMoneyTransfer.step === 'confirm_open_app') {
          // STEP 3: Hand off to app. NEVER enter PIN, NEVER ask for PIN.
          sounds.playSuccess();
          haptics.success();
          const handoffMsg = `Opening ${pendingMoneyTransfer.provider} now, ${userName}. Please enter your PIN yourself.`;
          const completedTransfer = { ...pendingMoneyTransfer };
          setPendingMoneyTransfer(null);
          setLastBriReply(handoffMsg);
          speech.speak(handoffMsg, { rate: settings.speechRate });
          addAuditLog({
            id: logId,
            timestamp: nowTime,
            actionType: 'system',
            title: `Opened ${completedTransfer.provider}`,
            details: `Safe hand-off: ${completedTransfer.amount} to ${completedTransfer.recipient}. Awaiting manual PIN.`,
            status: 'completed',
            spokenFeedback: handoffMsg,
          });
          return;
        }
      } else if (intent.type === 'CONFIRM_NO' || /no|cancel|stop|don't|abort/i.test(transcript)) {
        sounds.playEarconStop();
        haptics.listeningStop();
        const cancelMsg = `Cancelled transaction, ${userName}. Your money stays completely safe with you.`;
        setPendingMoneyTransfer(null);
        setLastBriReply(cancelMsg);
        speech.speak(cancelMsg, { rate: settings.speechRate });
        return;
      }
    }

    // Dialog State Interception: Awaiting Contacts Permission
    if (awaitingContactsPermission) {
      if (intent.type === 'CONFIRM_YES' || /yes|sure|okay|proceed|allow|grant/i.test(transcript)) {
        sounds.playSuccess();
        haptics.success();
        setHasContactsPermission(true);
        setAwaitingContactsPermission(false);
        try {
          localStorage.setItem('@brie_contacts_permission', 'true');
        } catch {}
        const grantedMsg = `Thank you ${userName}, contacts permission granted! Who would you like me to call or message?`;
        setLastBriReply(grantedMsg);
        speech.speak(grantedMsg, { rate: settings.speechRate });
        return;
      } else if (intent.type === 'CONFIRM_NO' || /no|never|cancel|don't/i.test(transcript)) {
        sounds.playEarconStop();
        setAwaitingContactsPermission(false);
        const deniedMsg = `Understood ${userName}, I won't touch your contacts without your permission.`;
        setLastBriReply(deniedMsg);
        speech.speak(deniedMsg, { rate: settings.speechRate });
        return;
      }
    }

    // Dialog State Interception: Awaiting Music Song Choice
    if (awaitingMusicSong) {
      setAwaitingMusicSong(false);
      const chosenSong = transcript.replace(/^(play|listen to|song|music)\s+/i, '').trim() || 'Acoustic Sunrise';
      sounds.playSuccess();
      haptics.success();
      setSmartHome((prev) => ({
        ...prev,
        speaker: {
          ...prev.speaker,
          isPlaying: true,
          currentTrack: chosenSong,
          artist: 'Brie Music Player',
        },
      }));
      const playMsg = `Playing ${chosenSong} for you right now, ${userName}!`;
      setLastBriReply(playMsg);
      speech.speak(playMsg, { rate: settings.speechRate });
      return;
    }

    // If Brie is deactivated and not receiving an activation command, inform user eyes-free
    if (!isBrieActive && intent.type !== 'ACTIVATE_BRIE') {
      const sleepReminder = `Brie is currently deactivated, ${userName}. Say ACTIVATE or Hey Brie to wake me up.`;
      setLastBriReply(sleepReminder);
      speech.speak(sleepReminder, {
        rate: settings.speechRate,
        onEnd: () => {
          speech.stopListening();
          setIsListening(false);
        },
      });
      return;
    }

    // Handle intents with natural, human-like voice responses:
    switch (intent.type) {
      // 0. VOICE ACTIVATION & GHOST DEACTIVATION (Blind Ghost Engine)
      case 'DEACTIVATE_BRIE': {
        deactivateBrie();
        return;
      }

      case 'ACTIVATE_BRIE': {
        activateBrie();
        return;
      }

      // 1. UNSAFE COMMANDS (Protection Rule: Say NO kindly)
      case 'UNSAFE_COMMAND': {
        sounds.playError();
        haptics.emergency();
        let saferAlternative = 'Let us check your account balance or send a safe specified amount instead.';
        if (intent.action === 'delete_all') {
          saferAlternative = 'Let us backup your messages and favorite contacts instead.';
        } else if (intent.action === 'pin_query') {
          saferAlternative = 'Your PIN must stay safe in your own mind for your protection.';
        } else if (intent.action === 'stranger_send') {
          saferAlternative = 'Let us only send money to verified friends in your contacts.';
        }
        const refusal = `Sorry ${userName}, I can't do that because it's not safe. As your friend, I have to protect you. ${saferAlternative}`;
        setLastBriReply(refusal);
        speech.speak(refusal, { rate: settings.speechRate });
        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'system',
          title: 'Unsafe Command Refused',
          details: `Kindly refused dangerous request: "${transcript}". Friend protection active.`,
          status: 'failed',
          spokenFeedback: refusal,
        });
        return;
      }

      // 2. MONEY RULE (Step 1: Always 2 Confirmations)
      case 'SEND_MONEY': {
        sounds.playSonarPing();
        haptics.tap();
        const provider = intent.provider || 'MTN MoMo';
        const step1Msg = `Okay ${userName}, you want to send ${intent.amount} to ${intent.recipient}. Is that correct? Say YES to continue.`;
        setPendingMoneyTransfer({
          step: 'confirm_details',
          amount: intent.amount,
          recipient: intent.recipient,
          provider,
          initiatedAt: nowTime,
        });
        setLastBriReply(step1Msg);
        speech.speak(step1Msg, { rate: settings.speechRate });
        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'system',
          title: `Money Transfer Initiated (${provider})`,
          details: `Requested ${intent.amount} to ${intent.recipient}. Awaiting Step 1 confirmation.`,
          status: 'running',
          spokenFeedback: step1Msg,
        });
        return;
      }

      // 3. EMOTIONAL SUPPORT / MOTIVATIONAL FRIEND
      case 'EMOTIONAL_SUPPORT': {
        sounds.playEarconStart();
        haptics.tap();
        setActiveEmotion(intent.emotion);
        const motivationalMsg = `Hey ${userName}, I'm right here with you. What annoyed you today? Tell me everything—you've got the strength to get through this, and your friend Brie has your back!`;
        setLastBriReply(motivationalMsg);
        speech.speak(motivationalMsg, { rate: settings.speechRate });
        return;
      }

      // 4. FIND PHONE / LOCATE
      case 'FIND_PHONE': {
        sounds.playPhoneRingPulse();
        haptics.emergency();
        const findMsg = `I'm right here in your hands, ${userName}! Beeping loudly now.`;
        setLastBriReply(findMsg);
        speech.speak(findMsg, { rate: settings.speechRate });
        return;
      }

      // 5. PLAY MUSIC
      case 'PLAY_MUSIC': {
        if (!intent.song) {
          sounds.playSonarPing();
          const askSong = `Okay ${userName}, which song?`;
          setAwaitingMusicSong(true);
          setLastBriReply(askSong);
          speech.speak(askSong, { rate: settings.speechRate });
          return;
        } else {
          sounds.playSuccess();
          haptics.success();
          setSmartHome((prev) => ({
            ...prev,
            speaker: {
              ...prev.speaker,
              isPlaying: true,
              currentTrack: intent.song || 'Acoustic Sunrise',
              artist: 'Brie Music Player',
            },
          }));
          const playMsg = `Playing ${intent.song} for you right now, ${userName}!`;
          setLastBriReply(playMsg);
          speech.speak(playMsg, { rate: settings.speechRate });
          return;
        }
      }

      // 6. STOP / SILENCE
      case 'STOP_TALKING': {
        sounds.playEarconStop();
        speech.stopSpeaking();
        setIsSpeaking(false);
        setLastBriReply(`No problem ${userName}, quiet now.`);
        return;
      }

      // 7. SWITCH MODE
      case 'SWITCH_MODE': {
        sounds.playSuccess();
        haptics.success();
        setCurrentMode(intent.targetMode);
        const reply =
          intent.targetMode === 'low-vision'
            ? `Okay ${userName}, switched to Seeing Impaired mode! High contrast and larger text are ready for you.`
            : intent.targetMode === 'blind'
            ? `Okay ${userName}, switched to Blind mode. Full voice guidance and tactile gestures are on.`
            : `Okay ${userName}, switched to Hands-Free mode for easy multitasking.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });
        return;
      }

      // 8. PHONE CALLS (Contacts Permission Guard Rule 1)
      case 'CALL_PHONE': {
        sounds.playEarconStart();
        haptics.tap();
        const contactQuery = intent.contactOrNumber.toLowerCase();

        // Check contacts permission unless it is an emergency SOS number
        const isEmergency = /911|emergency|sos|police|ambulance/i.test(contactQuery);
        if (!hasContactsPermission && !isEmergency) {
          const permMsg = `${userName}, I need permission to see your contacts to do that. Can I ask for permission?`;
          setAwaitingContactsPermission(true);
          setLastBriReply(permMsg);
          speech.speak(permMsg, { rate: settings.speechRate });
          return;
        }

        const matched = contacts.find(
          (c) =>
            c.name.toLowerCase().includes(contactQuery) ||
            c.relationship.toLowerCase().includes(contactQuery)
        ) || {
          id: 'custom-' + Date.now(),
          name: intent.contactOrNumber,
          phoneNumber: intent.contactOrNumber,
          relationship: 'Direct Dial',
          avatarColor: '#10b981',
        };

        triggerAutonomousCall(matched);
        return;
      }

      case 'END_CALL': {
        handleEndCall();
        return;
      }

      case 'DOWNLOAD_APP': {
        triggerAutonomousDownload(intent.appName);
        return;
      }

      case 'OPEN_APP': {
        sounds.playSuccess();
        haptics.success();
        const matchedApp = apps.find((a) => a.name.toLowerCase().includes(intent.appName.toLowerCase()));
        const targetAppName = matchedApp ? matchedApp.name : intent.appName;
        const reply = `Okay ${userName}, I have opened ${targetAppName} for you.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });

        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'system',
          title: `Opened ${targetAppName}`,
          details: 'Application launched autonomously.',
          status: 'completed',
          spokenFeedback: reply,
        });
        return;
      }

      // 9. WHATSAPP MESSAGING (Contacts Permission Guard Rule 1)
      case 'WHATSAPP_MESSAGE': {
        if (!hasContactsPermission) {
          const permMsg = `${userName}, I need permission to see your contacts to do that. Can I ask for permission?`;
          setAwaitingContactsPermission(true);
          setLastBriReply(permMsg);
          speech.speak(permMsg, { rate: settings.speechRate });
          return;
        }
        triggerAutonomousWhatsApp(intent.contact, intent.messageText);
        return;
      }

      case 'READ_MESSAGES': {
        if (!hasContactsPermission) {
          const permMsg = `${userName}, I need permission to see your contacts to do that. Can I ask for permission?`;
          setAwaitingContactsPermission(true);
          setLastBriReply(permMsg);
          speech.speak(permMsg, { rate: settings.speechRate });
          return;
        }
        sounds.playSonarPing();
        haptics.tap();
        const latest = messages[messages.length - 1];
        const reply = `Okay ${userName}, you have new messages. The latest is from ${latest.contactName} saying: "${latest.text}". Would you like to send a reply back?`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });

        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'whatsapp',
          title: 'Read WhatsApp Messages',
          details: `Read latest message from ${latest.contactName}`,
          status: 'completed',
          spokenFeedback: reply,
        });
        return;
      }

      case 'READ_AND_REPLY': {
        if (!hasContactsPermission) {
          const permMsg = `${userName}, I need permission to see your contacts to do that. Can I ask for permission?`;
          setAwaitingContactsPermission(true);
          setLastBriReply(permMsg);
          speech.speak(permMsg, { rate: settings.speechRate });
          return;
        }
        sounds.playSonarPing();
        haptics.tap();
        const latest = messages[messages.length - 1] || {
          contactName: 'Sarah',
          text: 'Hey! Are you still coming over for dinner?',
        };
        const replyText = intent.replyText;

        const newMsg: WhatsAppMessage = {
          id: 'msg-' + Date.now(),
          contactId: 'wa-reply-' + Date.now(),
          contactName: latest.contactName,
          sender: 'user',
          text: replyText,
          timestamp: nowTime,
          status: 'sent',
        };
        setMessages((prev) => [...prev, newMsg]);

        const spokenMsg = `Okay ${userName}, your last message was from ${latest.contactName} saying: "${latest.text}". I have sent your reply saying: "${replyText}".`;
        setLastBriReply(spokenMsg);
        speech.speak(spokenMsg, { rate: settings.speechRate });

        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'whatsapp',
          title: `Read & Replied to ${latest.contactName}`,
          details: `Received: "${latest.text}" | Replied: "${replyText}"`,
          status: 'completed',
          spokenFeedback: spokenMsg,
        });
        return;
      }

      // 10. SMART HOME CONTROLS
      case 'SMART_LIGHT': {
        sounds.playClick();
        haptics.tap();
        const roomQuery = intent.roomOrLight.toLowerCase();
        let targetLight = smartHome.lights.find((l) =>
          l.name.toLowerCase().includes(roomQuery) || l.room.toLowerCase().includes(roomQuery)
        );

        if (!targetLight) {
          targetLight = smartHome.lights[0];
        }

        const nextIsOn = intent.action === 'on' ? true : intent.action === 'off' ? false : true;
        const nextBrightness = intent.action === 'dim' && typeof intent.value === 'number' ? intent.value : targetLight.brightness;

        setSmartHome((prev) => ({
          ...prev,
          lights: prev.lights.map((l) =>
            l.id === targetLight?.id ? { ...l, isOn: nextIsOn, brightness: nextBrightness } : l
          ),
        }));

        const reply = `Okay ${userName}, ${targetLight.name} is now ${nextIsOn ? 'on' : 'off'}${intent.action === 'dim' ? ` set to ${nextBrightness}%` : ''}.`;
        sounds.playSuccess();
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });

        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'smarthome',
          title: `${targetLight.name}`,
          details: `Turned ${nextIsOn ? 'ON' : 'OFF'}`,
          status: 'completed',
          spokenFeedback: reply,
        });
        return;
      }

      case 'SMART_THERMOSTAT': {
        sounds.playSuccess();
        haptics.success();
        const newTemp = Math.max(60, Math.min(85, intent.targetTemp));
        setSmartHome((prev) => ({
          ...prev,
          thermostat: { ...prev.thermostat, targetTemp: newTemp },
        }));
        const reply = `Okay ${userName}, turned your thermostat to ${newTemp} degrees.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });

        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'smarthome',
          title: 'Thermostat',
          details: `Set to ${newTemp}°F`,
          status: 'completed',
          spokenFeedback: reply,
        });
        return;
      }

      case 'SMART_LOCK': {
        sounds.playSuccess();
        haptics.success();
        const shouldLock = intent.action === 'lock';
        setSmartHome((prev) => ({
          ...prev,
          locks: prev.locks.map((lk) => ({ ...lk, isLocked: shouldLock })),
        }));
        const reply = shouldLock
          ? `Okay ${userName}, all doors are locked up nice and safe!`
          : `Okay ${userName}, unlocked the doors for you.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });

        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'smarthome',
          title: 'Door Locks',
          details: shouldLock ? 'Securely Locked' : 'Unlocked',
          status: 'completed',
          spokenFeedback: reply,
        });
        return;
      }

      case 'SMART_VACUUM': {
        sounds.playClick();
        haptics.tap();
        const isStart = intent.action === 'start';
        setSmartHome((prev) => ({
          ...prev,
          vacuum: {
            ...prev.vacuum,
            status: isStart ? 'cleaning' : 'returning',
            currentRoom: isStart ? 'Living Room' : 'Dock Station',
          },
        }));
        const reply = isStart
          ? `Okay ${userName}, starting up the vacuum for you.`
          : `Okay ${userName}, sending the vacuum back to its dock.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });
        return;
      }

      case 'SMART_BLINDS': {
        sounds.playClick();
        haptics.tap();
        const isOpen = intent.action === 'open';
        setSmartHome((prev) => ({
          ...prev,
          blinds: prev.blinds.map((b) => ({ ...b, openPercentage: isOpen ? 100 : 0 })),
        }));
        const reply = isOpen
          ? `Okay ${userName}, opening the window blinds for you.`
          : `Okay ${userName}, closing the blinds for privacy.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });
        return;
      }

      // 11. PHONE HARDWARE (FLASHLIGHT, BATTERY, TIME, SCREEN)
      case 'PHONE_FLASHLIGHT': {
        sounds.playClick();
        haptics.tap();
        const nextFlash = intent.action === 'toggle' ? !flashlightOn : intent.action === 'on';
        setFlashlightOn(nextFlash);
        const reply = nextFlash ? `Okay ${userName}, turned on your flashlight.` : `Okay ${userName}, turned off the flashlight.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });
        return;
      }

      case 'PHONE_BATTERY': {
        sounds.playSonarPing();
        const reply = `Okay ${userName}, your battery is at 92%.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });
        return;
      }

      case 'PHONE_TIME': {
        sounds.playSonarPing();
        const now = new Date();
        const reply = `Okay ${userName}, it's ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });
        return;
      }

      case 'READ_SCREEN': {
        sounds.playSonarPing();
        haptics.tap();
        const activeSummary = `Okay ${userName}, you are in the ${activeTab} section. You have ${smartHome.lights.filter((l) => l.isOn).length} lights on and battery is at 92%.`;
        setLastBriReply(activeSummary);
        speech.speak(activeSummary, { rate: settings.speechRate });
        return;
      }

      case 'HELP': {
        sounds.playSonarPing();
        const reply = `Okay ${userName}, you can ask me to send money safely, call Mom, text Sarah, play music, or check your battery.`;
        setLastBriReply(reply);
        speech.speak(reply, { rate: settings.speechRate });
        return;
      }

      case 'CONVERSATIONAL': {
        handleConversationalQuery(intent.query);
        return;
      }
    }
  };

  // Conversational Query (Online via Gemini proxy or offline fallback)
  const handleConversationalQuery = async (query: string) => {
    sounds.playSonarPing();
    const loadingReply = 'Checking that for you...';
    setLastBriReply(loadingReply);

    try {
      if (!settings.offlineOnly) {
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            mode: currentMode,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.reply) {
            setLastBriReply(data.reply);
            speech.speak(data.reply, { rate: settings.speechRate });
            return;
          }
        }
      }
    } catch (e) {
      // Offline fallback
    }

    // High quality offline fallback responses
    const offlineReply = `I heard you ask: "${query}". Since I am keeping everything completely private and offline on your device, you can ask me to call your contacts, send WhatsApp messages, download apps, or control your smart home!`;
    setLastBriReply(offlineReply);
    speech.speak(offlineReply, { rate: settings.speechRate });
  };

  // Trigger Autonomous Call Pipeline
  const triggerAutonomousCall = (contact: Contact) => {
    sounds.playEarconStart();
    haptics.callPulse();

    const taskLog: AutonomousActionLog = {
      id: 'call-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType: 'call',
      title: `Calling ${contact.name}`,
      details: `Number: ${contact.phoneNumber}. Speakerphone engaged.`,
      status: 'running',
      spokenFeedback: `Calling ${contact.name} on speaker for you right now.`,
    };
    setActiveTask(taskLog);
    addAuditLog(taskLog);

    speech.speak(`Calling ${contact.name} on speaker for you right now.`, {
      rate: settings.speechRate,
      onEnd: () => {
        // Start simulated phone ringing
        const ringAudio = sounds.playPhoneRingPulse();
        ringAudioRef.current = ringAudio;

        setCurrentCall({
          isActive: true,
          isRinging: true,
          contactName: contact.name,
          phoneNumber: contact.phoneNumber,
          durationSeconds: 0,
          isSpeakerOn: true,
          isMuted: false,
        });

        // Answer after 3 seconds of ringing
        setTimeout(() => {
          ringAudio.stop();
          sounds.playSuccess();
          haptics.success();
          setCurrentCall((prev) => ({ ...prev, isRinging: false }));
          setActiveTask(null);
          speech.speak(`You're now connected with ${contact.name}!`, { rate: settings.speechRate });
        }, 3000);
      },
    });
  };

  const handleEndCall = () => {
    if (ringAudioRef.current) {
      ringAudioRef.current.stop();
    }
    sounds.playEarconStop();
    haptics.listeningStop();
    setCurrentCall({
      isActive: false,
      isRinging: false,
      contactName: '',
      phoneNumber: '',
      durationSeconds: 0,
      isSpeakerOn: true,
      isMuted: false,
    });
    const reply = 'Call ended. Talk to you soon!';
    setLastBriReply(reply);
    speech.speak(reply, { rate: settings.speechRate });
  };

  // Trigger Autonomous Play Store Download Pipeline
  const triggerAutonomousDownload = (appName: string) => {
    sounds.playEarconStart();
    haptics.listeningStart();

    const existingApp = apps.find((a) => a.name.toLowerCase().includes(appName.toLowerCase()));
    const finalAppName = existingApp ? existingApp.name : appName.charAt(0).toUpperCase() + appName.slice(1);

    const taskLog: AutonomousActionLog = {
      id: 'dl-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType: 'playstore',
      title: `Downloading ${finalAppName}`,
      details: 'Google Play Store autonomous download & installation.',
      status: 'running',
      spokenFeedback: `On it! Downloading ${finalAppName} from the Play Store for you now.`,
    };
    setActiveTask(taskLog);
    addAuditLog(taskLog);

    speech.speak(`On it! Downloading ${finalAppName} from the Play Store for you now.`, {
      rate: settings.speechRate,
    });

    setDownloadProgress({ appName: finalAppName, percent: 10 });

    let currentPct = 10;
    const progressInterval = setInterval(() => {
      currentPct += 20;
      if (currentPct >= 100) {
        clearInterval(progressInterval);
        setDownloadProgress({ appName: finalAppName, percent: 100 });

        setTimeout(() => {
          sounds.playSuccess();
          haptics.success();
          setDownloadProgress(null);
          setActiveTask(null);

          // Mark app as installed
          setApps((prev) =>
            prev.map((a) => (a.name.toLowerCase() === finalAppName.toLowerCase() ? { ...a, isInstalled: true } : a))
          );

          const doneReply = `${finalAppName} is all downloaded and ready to open whenever you want!`;
          setLastBriReply(doneReply);
          speech.speak(doneReply, { rate: settings.speechRate });

          addAuditLog({
            id: 'dl-done-' + Date.now(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'playstore',
            title: `Installed ${finalAppName}`,
            details: 'Ready to open from apps list.',
            status: 'completed',
            spokenFeedback: doneReply,
          });
        }, 600);
      } else {
        setDownloadProgress({ appName: finalAppName, percent: currentPct });
      }
    }, 450);
  };

  // Trigger Autonomous WhatsApp Message Pipeline
  const triggerAutonomousWhatsApp = (contactQuery: string, messageText: string) => {
    sounds.playEarconStart();
    haptics.tap();

    const matchedContact = contacts.find((c) => c.name.toLowerCase().includes(contactQuery.toLowerCase())) || {
      id: 'wa-' + Date.now(),
      name: contactQuery.charAt(0).toUpperCase() + contactQuery.slice(1),
      phoneNumber: '+1 (555) 000-0000',
      relationship: 'Contact',
      avatarColor: '#10b981',
    };

    const taskLog: AutonomousActionLog = {
      id: 'wa-msg-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType: 'whatsapp',
      title: `WhatsApp to ${matchedContact.name}`,
      details: `"${messageText}"`,
      status: 'running',
      spokenFeedback: `Sending that message to ${matchedContact.name} on WhatsApp right now.`,
    };
    setActiveTask(taskLog);
    addAuditLog(taskLog);

    speech.speak(`Sending that message to ${matchedContact.name} on WhatsApp right now.`, {
      rate: settings.speechRate,
      onEnd: () => {
        sounds.playSuccess();
        haptics.success();
        setActiveTask(null);

        // Add message to chat list
        const newMsg: WhatsAppMessage = {
          id: 'msg-' + Date.now(),
          contactId: matchedContact.id,
          contactName: matchedContact.name,
          sender: 'user',
          text: messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
        };
        setMessages((prev) => [...prev, newMsg]);

        const confirmation = `All done! Delivered to ${matchedContact.name}.`;
        setLastBriReply(confirmation);
        speech.speak(confirmation, { rate: settings.speechRate });
      },
    });
  };

  const addAuditLog = (log: AutonomousActionLog) => {
    setActionLogs((prev) => [log, ...prev]);
  };

  // Manual Trigger Mic
  const handleToggleMic = () => {
    if (isListening) {
      sounds.playEarconStop();
      haptics.listeningStop();
      speech.stopListening();
      setIsListening(false);
    } else {
      sounds.playEarconStart();
      haptics.listeningStart();
      speech.startListening();
      setIsListening(true);
      setSpokenTranscript('Listening for your voice...');
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#000000] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* 1. TOP LEFT: Small circle [TAP TO SPEAK] + Text "BRIE FOR BLIND" in white */}
      <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
        <button
          id="btnTapToSpeak"
          onClick={() => {
            sounds.playClick();
            haptics.tap();
            if (isListening) {
              speech.stopListening();
              setIsListening(false);
            } else {
              speech.startListening();
              setIsListening(true);
            }
          }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all active:scale-95 border-2 ${
            isListening
              ? 'bg-[#00FF88] text-black border-white animate-pulse'
              : isBrieActive
              ? 'bg-zinc-900 text-[#00FF88] border-[#00FF88]/70 hover:bg-zinc-800'
              : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800'
          }`}
          title="TAP TO SPEAK"
          aria-label="TAP TO SPEAK"
        >
          <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-4xl font-black text-white tracking-wider">
            BRIE
          </span>
          <span className="text-base sm:text-2xl font-bold text-white tracking-wider">
            FOR BLIND
          </span>
        </div>
      </div>

      {/* 2 & 3. MIDDLE & BELOW: ONE HUGE GREEN BUTTON (ACTIVATE) AND ONE HUGE DARK RED BUTTON (DEACTIVATE) */}
      <div className="flex-1 flex flex-col justify-center gap-6 w-full max-w-4xl mx-auto my-auto">
        {/* Middle: ONE HUGE GREEN button, full width, text "ACTIVATE" in black, 180px tall */}
        <button
          id="btnActivate"
          onClick={() => {
            sounds.playSuccess();
            haptics.success();
            activateBrie();
          }}
          style={{ height: '180px' }}
          className="w-full bg-[#00FF88] hover:bg-[#00e67a] active:scale-[0.99] text-black font-black text-4xl sm:text-6xl tracking-wider rounded-3xl shadow-2xl flex items-center justify-center transition-all cursor-pointer border-none"
          aria-label="Activate Brie"
        >
          ACTIVATE
        </button>

        {/* Below it: ONE HUGE DARK RED button, full width, text "DEACTIVATE" in white, 180px tall */}
        <button
          id="btnDeactivate"
          onClick={() => {
            sounds.playClick();
            haptics.listeningStop();
            deactivateBrie();
          }}
          style={{ height: '180px' }}
          className="w-full bg-[#330000] hover:bg-[#4a0000] active:scale-[0.99] text-white font-black text-4xl sm:text-6xl tracking-wider rounded-3xl shadow-2xl flex items-center justify-center border-2 border-red-950/60 transition-all cursor-pointer"
          aria-label="Deactivate Brie"
        >
          DEACTIVATE
        </button>
      </div>
    </div>
  );
}
