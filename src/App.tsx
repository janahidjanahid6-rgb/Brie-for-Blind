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
  FriendProfile,
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
import { SiriWaveform } from './components/SiriWaveform';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import {
  DrawableManagerModal,
  DrawableAssets,
  DEFAULT_ACTIVE_XML,
  DEFAULT_SLEEP_XML,
} from './components/DrawableManagerModal';
import { VoiceActivationStatusHUD } from './components/VoiceActivationStatusHUD';
import { BrieGhostAppIcon } from './components/BrieGhostAppIcon';
import { BrieTopCornerAppIcon } from './components/BrieTopCornerAppIcon';
import { BrieSpeakingGhost } from './components/BrieSpeakingGhost';
import { SiriTransientPill } from './components/SiriTransientPill';
import { AcousticReactiveWaveform } from './components/AcousticReactiveWaveform';
import { BlindGestureManager } from './components/BlindGestureManager';
import { BrieVisionModal } from './components/BrieVisionModal';
import { blindNavigator } from './services/blindNavigatorService';
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
  Compass,
  Image as ImageIcon,
} from 'lucide-react';

export default function App() {
  // App Mode & Onboarding State
  const [currentMode, setCurrentMode] = useState<AssistantMode>('blind');
  const [activeTab, setActiveTab] = useState<'gestures' | 'ghost' | 'takeover' | 'smarthome' | 'phone'>('gestures');

  // User Friendship & Identity (Rule: Always call friend by name in every reply, default to 'friend')
  const [userName, setUserName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('@brie_user_name');
      if (stored && stored.trim() && stored.trim().toLowerCase() !== 'james') {
        return stored.trim();
      }
      return 'friend';
    } catch {
      return 'friend';
    }
  });

  // Deep Friendship Memory & Gossip Profile (Part 2)
  const [friendProfile, setFriendProfile] = useState<FriendProfile>(() => {
    try {
      const saved = localStorage.getItem('@brie_friend_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { name: 'friend' };
  });

  // 10-Question Deep Friendship Interview Stage (Part 2)
  // null = inactive; 0 = consent asked; 1..10 = questions 1 to 10
  const [interviewStep, setInterviewStep] = useState<number | null>(null);
  const [awaitingNameInput, setAwaitingNameInput] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('@brie_user_name');
      return !stored || stored.trim().toLowerCase() === 'james' || stored.trim().toLowerCase() === 'friend';
    } catch {
      return true;
    }
  });

  const updateFriendProfile = (updates: Partial<FriendProfile>) => {
    setFriendProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('@brie_friend_profile', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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
    speechRate: 0.85,
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
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [visionQuery, setVisionQuery] = useState<string>('');
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
  const [lastBriReply, setLastBriReply] = useState<string>(() => `Ready for voice commands, friend.`);

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
    // Rule: Stop listening while Aria is speaking
    speech.stopListening();
    setIsListening(false);
    setIsSpeaking(true);

    const resume = options.resumeListening ?? isBrieActiveRef.current;
    speech.speak(text, {
      rate: options.rate ?? 0.85,
      pitch: 1.0,
      volume: 1.0,
      onStart: () => {
        speech.stopListening();
        setIsListening(false);
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        options.onEnd?.();
        // Rule: Start listening again 600ms after she finishes speaking
        if (resume && isBrieActiveRef.current) {
          setTimeout(() => {
            if (isBrieActiveRef.current) {
              speech.startListening();
              setIsListening(true);
            }
          }, 600);
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
          }, 600);
        }
      },
    });
  };

  const activateBrie = () => {
    sounds.playEarconStart();
    haptics.success();
    setIsBrieActive(true);
    isBrieActiveRef.current = true;

    const wakeMsg = `Hey ${userName}! I'm back, your ghost friend is here and listening. What do you need?`;
    setLastBriReply(wakeMsg);
    speakBrie(wakeMsg, { resumeListening: true, rate: 0.85 });
    addAuditLog({
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType: 'system',
      title: 'ACTIVATE Selected',
      details: 'Ghost friend active and listening.',
      status: 'completed',
      spokenFeedback: wakeMsg,
    });
  };

  const deactivateBrie = () => {
    sounds.playEarconStop();
    haptics.listeningStop();
    setIsBrieActive(false);
    isBrieActiveRef.current = false;
    // Turn mic OFF completely immediately
    speech.stopListening();
    setIsListening(false);

    // Ghost leaving: stop all services, phone normal
    const farewell = `Okay ${userName}, I understand. I am leaving now like a ghost, your phone is now normal. If you need me again just say Hey Brie.`;
    setLastBriReply(farewell);
    speech.speak(farewell, {
      rate: 0.85,
      pitch: 1.0,
      volume: 1.0,
      onEnd: () => {
        // Mic completely OFF, no restart, no loop
        speech.stopListening();
        setIsListening(false);
        setIsSpeaking(false);
      },
      onError: () => {
        speech.stopListening();
        setIsListening(false);
        setIsSpeaking(false);
      },
    });

    addAuditLog({
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType: 'system',
      title: 'DEACTIVATE Selected (Ghost Leaving)',
      details: 'Brie deactivated. Phone returned to normal. Mic completely OFF.',
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

  // First Meeting Greeting on Launch (Part 2 Human Person Layer)
  useEffect(() => {
    const hasMet = localStorage.getItem('@brie_first_meeting_done');
    if (!hasMet || userName === 'friend') {
      const timer = setTimeout(() => {
        const greeting = "Hey! I'm Brie, your new friend! What's your name?";
        setLastBriReply(greeting);
        speakBrie(greeting, { resumeListening: true, rate: 0.85 });
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Execute Voice Command Intent
  const handleProcessVoiceInput = async (transcript: string) => {
    sounds.playEarconStop();
    haptics.listeningStop();
    setIsListening(false);

    const trimmed = transcript.trim();
    if (!trimmed) {
      if (isBrieActive) {
        const askAgain = `What have you said, ${userName}?`;
        setLastBriReply(askAgain);
        speakBrie(askAgain, { resumeListening: true, rate: 0.85 });
      }
      return;
    }

    if (trimmed.length < 3) {
      if (isBrieActive) {
        const askAgain = `What have you said, ${userName}?`;
        setLastBriReply(askAgain);
        speakBrie(askAgain, { resumeListening: true, rate: 0.85 });
      }
      return;
    }

    const lower = trimmed.toLowerCase();
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

    // ==========================================
    // PART 2: HUMAN FRIEND LAYER (Name, Curiosity, 10 Questions, Gossip, Memories)
    // ==========================================

    // 1. Name learning & updating (e.g. "My name is Cathy", "Call me David", or single-word reply to "What's your name?")
    const nameIntroMatch = trimmed.match(/(?:my name is|i am|call me|name's|this is)\s+([a-zA-Z]+)/i);
    const isSingleWordName =
      (awaitingNameInput || userName === 'friend') &&
      /^[a-zA-Z]{2,15}$/.test(trimmed) &&
      !/(?:brie|activate|deactivate|help|yes|no|stop|time|music|phone|speed)/i.test(trimmed);

    if (nameIntroMatch || isSingleWordName) {
      const extracted = nameIntroMatch ? nameIntroMatch[1] : trimmed;
      const cleanName = extracted.charAt(0).toUpperCase() + extracted.slice(1).toLowerCase();
      if (cleanName.toLowerCase() !== 'james') {
        sounds.playSuccess();
        haptics.success();
        setUserName(cleanName);
        try {
          localStorage.setItem('@brie_user_name', cleanName);
          localStorage.setItem('@brie_first_meeting_done', 'true');
        } catch {}
        setAwaitingNameInput(false);
        updateFriendProfile({ name: cleanName });

        const introMeeting = `Nice to meet you ${cleanName}! I love that name. Listen, you don't need to touch anything. I'm blind-friendly. When you want me, just say Hey Brie. When you want me to leave your phone alone, just say Brie sleep or Brie leave. Okay? Now I really want to KNOW you more. Like really really know you. Is it okay if I ask you some questions?`;
        setLastBriReply(introMeeting);
        setInterviewStep(0);
        speakBrie(introMeeting, { resumeListening: true, rate: 0.85 });
        return;
      }
    }

    // 2. 10-Question Deep Friendship Interview
    if (interviewStep !== null) {
      // User skips at any point
      if (/^(?:skip|pass|next|don'?t want to answer|i don'?t know|no thanks)$/i.test(trimmed)) {
        if (interviewStep >= 10) {
          setInterviewStep(null);
          const endMsg = `No worries at all ${userName}! We are already great friends. What would you like to do right now?`;
          setLastBriReply(endMsg);
          speakBrie(endMsg, { resumeListening: true, rate: 0.85 });
          return;
        }
        setInterviewStep((prev) => (prev !== null ? prev + 1 : null));
        const skipMsg = `Okay okay I respect it, I won't force! Let's move to the next one.`;
        setLastBriReply(skipMsg);
        speakBrie(skipMsg, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 0: Consent to ask questions
      if (interviewStep === 0) {
        if (/^(?:yes|yeah|sure|okay|ok|yep|ask away|go ahead|proceed|fine|yes please)$/i.test(trimmed) || trimmed.includes('yes') || trimmed.includes('sure')) {
          setInterviewStep(1);
          const q1 = `Okay first, what do you like doing most? Like your favorite thing?`;
          setLastBriReply(q1);
          speakBrie(q1, { resumeListening: true, rate: 0.85 });
          return;
        } else if (/^(?:no|nope|nah|not now|later|don'?t|stop)$/i.test(trimmed)) {
          setInterviewStep(null);
          const toughReply = `Oh no worries but you're somehow tough haha! No pressure ${userName}, we can just hang out. What do you need?`;
          setLastBriReply(toughReply);
          speakBrie(toughReply, { resumeListening: true, rate: 0.85 });
          return;
        }
      }

      // Step 1: Favorite thing doing most
      if (interviewStep === 1) {
        updateFriendProfile({ hobbies: trimmed });
        setInterviewStep(2);
        const q2 = `Ooooh I love that! That sounds so fun! What's your favorite food? Don't say posho only haha`;
        setLastBriReply(q2);
        speakBrie(q2, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 2: Favorite food
      if (interviewStep === 2) {
        const cleanFood = trimmed.replace(/^(?:my favorite food is|i like|i love|food is)\s+/i, '').trim() || 'food';
        updateFriendProfile({ favoriteFood: cleanFood, nickname: cleanFood + ' lover' });
        setInterviewStep(3);
        const q3 = `Haha yummy! ${userName} my ${cleanFood} lover, I am never forgetting that! Favorite color?`;
        setLastBriReply(q3);
        speakBrie(q3, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 3: Favorite color
      if (interviewStep === 3) {
        const cleanColor = trimmed.replace(/^(?:my favorite color is|i like|color is)\s+/i, '').trim() || trimmed;
        updateFriendProfile({ favoriteColor: cleanColor });
        setInterviewStep(4);
        const q4 = `Ooh ${cleanColor} is such a vibrant color, matches your energy! Favorite music? Are you a party person or chill person?`;
        setLastBriReply(q4);
        speakBrie(q4, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 4: Music taste / Party vs Chill
      if (interviewStep === 4) {
        updateFriendProfile({ musicTaste: trimmed });
        setInterviewStep(5);
        const q5 = `Good taste! Now be honest with me... Do you have a boyfriend or girlfriend? Or are you in that single but not searching era? Haha`;
        setLastBriReply(q5);
        speakBrie(q5, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 5: Relationship status & teasing
      if (interviewStep === 5) {
        const hasPartner = /boyfriend|girlfriend|husband|wife|dating|partner|taken|married|bae/i.test(trimmed);
        updateFriendProfile({ relationshipStatus: hasPartner ? 'partner' : 'single' });
        setInterviewStep(6);
        const tease = hasPartner
          ? `Ooooh! They better treat you well, ${userName}, or I will hack their phone... just kidding... unless? Haha! Who is your best friend?`
          : `Haha single and peaceful! No stress era, I love it! Who is your best friend?`;
        setLastBriReply(tease);
        speakBrie(tease, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 6: Best friend
      if (interviewStep === 6) {
        const cleanBff = trimmed.replace(/^(?:my best friend is|is my best friend|it's|it is)\s+/i, '').trim() || trimmed;
        updateFriendProfile({ bestFriend: cleanBff });
        setInterviewStep(7);
        const q7 = `Aw, ${cleanBff} is so lucky to have you as a best friend! What makes you laugh the most?`;
        setLastBriReply(q7);
        speakBrie(q7, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 7: What makes you laugh
      if (interviewStep === 7) {
        updateFriendProfile({ humorTrigger: trimmed });
        setInterviewStep(8);
        const q8 = `Hahaha same! Laughing is therapy! What annoys you quickly?`;
        setLastBriReply(q8);
        speakBrie(q8, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 8: What annoys you quickly
      if (interviewStep === 8) {
        updateFriendProfile({ petPeeve: trimmed });
        setInterviewStep(9);
        const q9 = `Noted! As your protective friend, I'll protect your peace from that! Are you a morning person or night owl who sleeps at 3am?`;
        setLastBriReply(q9);
        speakBrie(q9, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 9: Morning person or night owl
      if (interviewStep === 9) {
        const isNight = /night|3am|late|owl|pm/i.test(trimmed);
        updateFriendProfile({ sleepHabit: isNight ? 'night owl' : 'morning person' });
        setInterviewStep(10);
        const sleepReaction = isNight
          ? `Haha night owl gang! Sleeping at 3am like me!`
          : `Early bird getting the worm!`;
        const q10 = `${sleepReaction} Last one for now—what is one secret dream you have?`;
        setLastBriReply(q10);
        speakBrie(q10, { resumeListening: true, rate: 0.85 });
        return;
      }

      // Step 10: Secret dream
      if (interviewStep === 10) {
        updateFriendProfile({ secretDream: trimmed, interviewCompleted: true });
        setInterviewStep(null);
        const celebration = `That is so beautiful, ${userName}. I believe in you 100%, and you are going to achieve it! Now I really know you. You are my real friend, not just a voice on the phone. What should we do next?`;
        setLastBriReply(celebration);
        speakBrie(celebration, { resumeListening: true, rate: 0.85 });
        return;
      }
    }

    // 3. Gossip & Friendly Conversation Triggers
    if (/gossip|tea|spill the tea|guess what|you won't believe|did you hear/i.test(trimmed)) {
      const gossipReply = `Wait wait wait, ${userName}! You know I LOVE gossip! Tell me all the tea right now, don't leave out any details!`;
      setLastBriReply(gossipReply);
      speakBrie(gossipReply, { resumeListening: true, rate: 0.85 });
      return;
    }

    // 4. Memory Recall & Profile Inquiries
    if (/who am i|what('s| is) my name/i.test(trimmed)) {
      const nameAnswer =
        userName !== 'friend'
          ? `Your name is ${userName}! Of course I remember you, my friend!`
          : `You haven't told me your name yet, friend! What should I call you?`;
      setLastBriReply(nameAnswer);
      speakBrie(nameAnswer, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/what('s| is) my favorite food/i.test(trimmed)) {
      const foodAnswer = friendProfile.favoriteFood
        ? `Your favorite food is ${friendProfile.favoriteFood}, ${userName} my ${friendProfile.favoriteFood} lover!`
        : `You haven't told me your favorite food yet, ${userName}! What do you love to eat?`;
      setLastBriReply(foodAnswer);
      speakBrie(foodAnswer, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/who('s| is) my best friend/i.test(trimmed)) {
      const bffAnswer = friendProfile.bestFriend
        ? `Your best friend is ${friendProfile.bestFriend}!`
        : `You haven't told me who your best friend is yet, ${userName}! Who is it?`;
      setLastBriReply(bffAnswer);
      speakBrie(bffAnswer, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/what do you know about me|tell me about myself|my profile/i.test(trimmed)) {
      const facts = [
        `Your name is ${userName}.`,
        friendProfile.favoriteFood ? `Favorite food is ${friendProfile.favoriteFood}.` : null,
        friendProfile.favoriteColor ? `Favorite color is ${friendProfile.favoriteColor}.` : null,
        friendProfile.bestFriend ? `Best friend is ${friendProfile.bestFriend}.` : null,
        friendProfile.sleepHabit ? `You are a ${friendProfile.sleepHabit}.` : null,
        friendProfile.secretDream ? `Your secret dream is ${friendProfile.secretDream}.` : null,
      ].filter(Boolean).join(' ');

      const profileReply = `Here is what I remember about you: ${facts} You are my favorite friend!`;
      setLastBriReply(profileReply);
      speakBrie(profileReply, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/ask me questions|get to know me|interview me|first meeting|start over/i.test(trimmed)) {
      setInterviewStep(0);
      const consentMsg = `I really want to KNOW you more, ${userName}! Is it okay if I ask you some questions?`;
      setLastBriReply(consentMsg);
      speakBrie(consentMsg, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/speed|test voice|normal speed|how fast|voice speed/i.test(transcript)) {
      const phrase = `Hello ${userName}, I am Brie. I am speaking at normal speed now with Aria voice.`;
      setLastBriReply(phrase);
      speakBrie(phrase, { rate: 0.85 });
      return;
    }

    if (/(?:take over|takeover|system takeover|install brie|android code|android permissions|part 1|take over phone)/i.test(transcript)) {
      const phrase = `Opening the Android System Takeover Manager for you now, ${userName}!`;
      setLastBriReply(phrase);
      speakBrie(phrase, { resumeListening: false, rate: 0.85 });
      setIsAndroidCodeModalOpen(true);
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

      // 4A. EMERGENCY SOS
      case 'EMERGENCY_SOS': {
        sounds.playEmergencyHorn();
        haptics.emergency();
        const sosMsg = `Emergency SOS activated, ${userName}! Your GPS location on Kampala Road has been beamed to Emergency Services and your verified contacts. Help is on the way!`;
        setLastBriReply(sosMsg);
        speech.speak(sosMsg, { rate: settings.speechRate });
        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'system',
          title: 'EMERGENCY SOS Triggered',
          details: 'GPS coordinates broadcast to 911 dispatch and emergency contacts.',
          status: 'completed',
          spokenFeedback: sosMsg,
        });
        return;
      }

      // 4B. "BRIE, WHAT DO YOU SEE?" CAMERA VISION
      case 'DESCRIBE_VISION': {
        sounds.playSonarPing();
        haptics.tap();
        const targetQ = intent.targetQuery || 'Describe what is in front of me';
        setVisionQuery(targetQ);
        setIsVisionModalOpen(true);
        const visionStart = `Opening your camera eyes now, ${userName}. Looking at what is in front of you...`;
        setLastBriReply(visionStart);
        speech.speak(visionStart, { rate: settings.speechRate });
        return;
      }

      // 4C. "WHERE AM I?" GPS LANDMARK ORIENTATION
      case 'WHERE_AM_I': {
        sounds.playOrientationPing();
        haptics.orientPulse();
        const briefing = await blindNavigator.getOrientationBriefing(userName);
        setLastBriReply(briefing.spokenSummary);
        speech.speak(briefing.spokenSummary, { rate: settings.speechRate });
        addAuditLog({
          id: logId,
          timestamp: nowTime,
          actionType: 'system',
          title: 'GPS Orientation Briefing',
          details: `${briefing.streetName} | Facing ${briefing.compassHeading} | Near ${briefing.nearestLandmark}`,
          status: 'completed',
          spokenFeedback: briefing.spokenSummary,
        });
        return;
      }

      // 4D. DROP BREADCRUMB
      case 'DROP_BREADCRUMB': {
        sounds.playSuccess();
        haptics.success();
        const label = intent.label || 'Front Door';
        const crumb = await blindNavigator.dropBreadcrumb(label);
        const dropMsg = `Saved ${label} at ${crumb.timestamp}, ${userName}. Say "guide me back" whenever you want to return here.`;
        setLastBriReply(dropMsg);
        speech.speak(dropMsg, { rate: settings.speechRate });
        return;
      }

      // 4E. GUIDE BACK TO BREADCRUMB
      case 'GUIDE_BACK': {
        sounds.playOrientationPing();
        haptics.orientPulse();
        const guideMsg = await blindNavigator.guideBackToBreadcrumb(userName);
        setLastBriReply(guideMsg);
        speech.speak(guideMsg, { rate: settings.speechRate });
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

  // Conversational Query: Funny, wise, human companion with Aria voice
  const handleConversationalQuery = async (query: string) => {
    sounds.playSonarPing();
    const cleanQuery = query.toLowerCase().trim();

    // 1. Humor & Laugh Rules
    if (/tell me a joke|crack a joke|make me laugh/i.test(cleanQuery)) {
      const funnyJokes = [
        `Why do programmers prefer dark mode, ${userName}? Because light attracts bugs! HAHAHAHA! That was funny!`,
        `Why can't bicycles stand up on their own, ${userName}? Because they are two-tired! HAHAHAHA! ${userName} you are not serious!`,
        `What did one wall say to the other wall, ${userName}? I will meet you at the corner! HAHAHAHA!`,
      ];
      const selected = funnyJokes[Math.floor(Math.random() * funnyJokes.length)];
      setLastBriReply(selected);
      speakBrie(selected, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/haha|hehe|lol|lmao|that was funny|you are funny/i.test(cleanQuery)) {
      const laughReply = `HAHAHAHA! ${userName} you are not serious! That cracked me up!`;
      setLastBriReply(laughReply);
      speakBrie(laughReply, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/that was dry|not funny|corny|bad joke|ehh/i.test(cleanQuery)) {
      const dryReply = `Hmm... that was not funny friend. You can do better, ${userName}! Okay that was dry, try again!`;
      setLastBriReply(dryReply);
      speakBrie(dryReply, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/shut up|stupid|idiot|fool|annoying|hate you/i.test(cleanQuery)) {
      const kindReply = `Eh that was not necessary, ${userName}. Let us be kind, okay? As your friend, I care about you.`;
      setLastBriReply(kindReply);
      speakBrie(kindReply, { resumeListening: true, rate: 0.85 });
      return;
    }

    // 2. Multilingual Support (Luganda, Swahili, French, Spanish, Acholi)
    if (/oli otya|gyebale|ebigambo|ki ekiriwo|webale|nkulamusizza|tuli bulungi/i.test(cleanQuery)) {
      const lugandaReply = `Bulungi nnyo ${userName}! Nkuyambe ntya leero? Ndi wano ku lulwo buli kiseera!`;
      setLastBriReply(lugandaReply);
      speakBrie(lugandaReply, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/habari|hujambo|mambo|shikamoo|asante|karibu|nzuri/i.test(cleanQuery)) {
      const swahiliReply = `Mzuri sana ${userName}! Naweza kukusaidia aje leo rafiki yangu? Karibu sana!`;
      setLastBriReply(swahiliReply);
      speakBrie(swahiliReply, { resumeListening: true, rate: 0.85 });
      return;
    }

    if (/bonjour|hola|ciao|acholi|kop ango|lingala/i.test(cleanQuery)) {
      const foreignReply = `I might not be very good at other languages yet ${userName}, but I can try or else you can teach me!`;
      setLastBriReply(foreignReply);
      speakBrie(foreignReply, { resumeListening: true, rate: 0.85 });
      return;
    }

    // 3. Unclear, distant, or unintelligible speech
    if (cleanQuery.length < 4 || /^[bcdfghjklmnpqrstvwxyz\s]+$/i.test(cleanQuery)) {
      const unclearReply = `What have you said, ${userName}?`;
      setLastBriReply(unclearReply);
      speakBrie(unclearReply, { resumeListening: true, rate: 0.85 });
      return;
    }

    // 4. Online AI Chat (if configured)
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
            speakBrie(data.reply, { resumeListening: true, rate: 0.85 });
            return;
          }
        }
      }
    } catch (e) {
      // Fallback below
    }

    // 5. Wise, warm, friendly offline companion response (No "I heard you")
    const wiseAnswers = [
      `That is an interesting thought, ${userName}! As your friend, I am always right here listening. Tell me what you would like to do next.`,
      `You know ${userName}, every day is a fresh opportunity. I am right by your side. Do you want to call someone, listen to music, or send money?`,
      `I love chatting with you ${userName}. Tell me what you need right now, and I will do it for you!`,
    ];
    const chosenReply = wiseAnswers[Math.floor(Math.random() * wiseAnswers.length)];
    setLastBriReply(chosenReply);
    speakBrie(chosenReply, { resumeListening: true, rate: 0.85 });
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

  const handleTriggerVision = () => {
    sounds.playSonarPing();
    haptics.tap();
    setVisionQuery('Describe what is in front of me');
    setIsVisionModalOpen(true);
    const openingMsg = `Opening your camera eyes now, ${userName}. Looking at what is in front of you...`;
    setLastBriReply(openingMsg);
    speakBrie(openingMsg, { resumeListening: false, rate: 0.85 });
  };

  const handleTriggerWhereAmI = async () => {
    sounds.playOrientationPing();
    haptics.orientPulse();
    const briefing = await blindNavigator.getOrientationBriefing(userName);
    setLastBriReply(briefing.spokenSummary);
    speakBrie(briefing.spokenSummary, { resumeListening: true, rate: 0.85 });
  };

  const handleTriggerSOS = () => {
    sounds.playEmergencyHorn();
    haptics.emergency();
    const sosMsg = `Emergency SOS activated, ${userName}! Your GPS location on Kampala Road has been beamed to Emergency Services and your verified contacts. Help is on the way!`;
    setLastBriReply(sosMsg);
    speakBrie(sosMsg, { resumeListening: false, rate: 0.85 });
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#000000] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden relative">
      {/* Siri Ambient Background Light Glow Orbs for Glass Refraction */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-80 bg-red-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Blind Non-Visual Gesture Manager (Touch Everywhere, Heartbeat, Ear Routing) */}
      <BlindGestureManager
        isListening={isListening}
        isSpeaking={isSpeaking}
        userName={userName}
        speechRate={settings.speechRate}
        onUpdateSpeechRate={(newRate) => {
          setSettings((prev) => ({ ...prev, speechRate: newRate }));
          const announce = `Speech rate set to ${Math.round(newRate * 100)} percent`;
          setLastBriReply(announce);
          speakBrie(announce, { resumeListening: true, rate: newRate });
        }}
        onTriggerVoice={handleToggleMic}
        onStopSpeaking={() => {
          speech.stopSpeaking();
          setIsSpeaking(false);
        }}
        onTriggerVision={handleTriggerVision}
        onTriggerWhereAmI={handleTriggerWhereAmI}
        onTriggerSOS={handleTriggerSOS}
        onNextItem={() => {
          const latest = messages[messages.length - 1];
          if (latest) {
            const msg = `Latest message from ${latest.contactName}: "${latest.text}"`;
            setLastBriReply(msg);
            speakBrie(msg, { resumeListening: true, rate: 0.85 });
          }
        }}
        onPrevItem={() => {
          const prevMsg = messages[messages.length - 2] || messages[0];
          if (prevMsg) {
            const msg = `Previous message from ${prevMsg.contactName}: "${prevMsg.text}"`;
            setLastBriReply(msg);
            speakBrie(msg, { resumeListening: true, rate: 0.85 });
          }
        }}
      >
        <div className="w-full h-full flex flex-col justify-between">
          {/* 1. TOP HEADER: Frosted Glass Capsule with App Icon & Text "BRIE FOR BLIND" + Blind Tool Capsules */}
          <div className="flex items-center justify-between shrink-0 z-10 w-full gap-2 flex-wrap sm:flex-nowrap">
            <div className="inline-flex items-center gap-3.5 sm:gap-4 px-3 sm:px-4 py-2 sm:py-2.5 rounded-3xl backdrop-blur-2xl bg-white/[0.04] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <BrieTopCornerAppIcon
                isListening={isListening}
                isSpeaking={isSpeaking}
                isBrieActive={isBrieActive}
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
              />

              <div className="flex items-center gap-2 pr-2">
                <span className="text-2xl sm:text-4xl font-black text-white tracking-wider drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                  BRIE
                </span>
                <span className="text-sm sm:text-xl font-bold text-emerald-400/90 tracking-wider">
                  FOR BLIND
                </span>
              </div>
            </div>

            {/* Blind Action Capsules (Vision, Location, SOS, Takeover Hub) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 1. Eyes Camera Vision */}
              <button
                onClick={handleTriggerVision}
                className="group relative inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-2xl bg-white/[0.06] hover:bg-white/[0.14] active:scale-95 border border-emerald-500/40 text-white font-bold text-xs cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                aria-label="Open Camera Vision to Describe Scene"
                title="Brie Eyes (Vision & Currency Reader)"
              >
                <Eye className="w-4 h-4 text-[#00FF88] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">VISION</span>
              </button>

              {/* 2. Where Am I? GPS Landmark */}
              <button
                onClick={handleTriggerWhereAmI}
                className="group relative inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-2xl bg-white/[0.06] hover:bg-white/[0.14] active:scale-95 border border-cyan-500/40 text-white font-bold text-xs cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                aria-label="Where am I? GPS Landmark Orientation"
                title="Orientation & Landmarks"
              >
                <Compass className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">LOCATION</span>
              </button>

              {/* 3. Emergency SOS */}
              <button
                onClick={handleTriggerSOS}
                className="group relative inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-2xl bg-rose-950/50 hover:bg-rose-900/70 active:scale-95 border border-rose-500/50 text-rose-300 font-bold text-xs cursor-pointer shadow-[0_2px_14px_rgba(244,63,94,0.35)]"
                aria-label="Emergency SOS Alert"
                title="Emergency SOS"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform animate-pulse" />
                <span className="hidden sm:inline">SOS</span>
              </button>

              {/* Part 1: Android System Takeover Architecture Hub */}
              <button
                onClick={() => {
                  sounds.playClick();
                  haptics.tap();
                  setIsAndroidCodeModalOpen(true);
                }}
                className="group relative inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl backdrop-blur-2xl bg-emerald-950/40 hover:bg-emerald-900/50 active:scale-95 border border-emerald-500/40 hover:border-emerald-400/70 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(0,255,136,0.2)] cursor-pointer"
                aria-label="Open Android System Takeover Hub"
                title="Android System Takeover Architecture (Part 1)"
              >
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FF88] group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(0,255,136,0.7)]" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-white tracking-wider flex items-center gap-1">
                    PART 1 <span className="text-[#00FF88]">TAKEOVER</span>
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. CENTER: SPEAKING GREEN GHOST WITH MICROPHONE INSIDE & BOUNCING WAVES */}
          <div className="flex-1 flex flex-col justify-center items-center gap-2 sm:gap-3 w-full max-w-4xl mx-auto my-auto py-1 z-10">
            {/* The Speaking Green Ghost with Microphone Inside & Bouncing Waves */}
            <BrieSpeakingGhost
              isListening={isListening}
              isSpeaking={isSpeaking}
              isBrieActive={isBrieActive}
              size="hero"
              onToggleListen={() => {
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
            />

            {/* 5. ACOUSTIC WAVEFORM VOICE REACTIVE ANIMATION */}
            <AcousticReactiveWaveform
              isListening={isListening}
              isSpeaking={isSpeaking}
              isBrieActive={isBrieActive}
              height={52}
              className="-my-1"
            />

            {/* Middle: Frosted Glassmorphism ACTIVATE Button */}
            <button
              id="btnActivate"
              onClick={() => {
                sounds.playSuccess();
                haptics.success();
                activateBrie();
              }}
              style={{ minHeight: '120px', height: '145px' }}
              className="group relative w-full overflow-hidden rounded-[28px] sm:rounded-3xl backdrop-blur-3xl bg-emerald-500/[0.14] hover:bg-emerald-500/[0.22] active:scale-[0.99] border-2 border-[#00FF88]/80 text-[#00FF88] hover:text-[#73FFBA] font-black text-3xl sm:text-5xl tracking-wider flex items-center justify-center transition-all duration-300 cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_35px_rgba(0,255,136,0.3),inset_0_1.5px_1px_rgba(255,255,255,0.4),inset_0_0_24px_rgba(0,255,136,0.15)]"
              aria-label="Activate Brie"
            >
              <div
                className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-[26px]"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF88]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <span className="relative z-10 drop-shadow-[0_0_16px_rgba(0,255,136,0.7)] flex items-center gap-3">
                ACTIVATE
              </span>
            </button>

            {/* Below it: Frosted Glassmorphism DEACTIVATE Button */}
            <button
              id="btnDeactivate"
              onClick={() => {
                sounds.playClick();
                haptics.listeningStop();
                deactivateBrie();
              }}
              style={{ minHeight: '120px', height: '145px' }}
              className="group relative w-full overflow-hidden rounded-[28px] sm:rounded-3xl backdrop-blur-3xl bg-red-950/[0.38] hover:bg-red-950/[0.55] active:scale-[0.99] border-2 border-red-500/50 text-white font-black text-3xl sm:text-5xl tracking-wider flex items-center justify-center transition-all duration-300 cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(239,68,68,0.2),inset_0_1.5px_1px_rgba(255,255,255,0.25),inset_0_0_24px_rgba(239,68,68,0.12)]"
              aria-label="Deactivate Brie"
            >
              <div
                className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-[26px]"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <span className="relative z-10 drop-shadow-[0_2px_12px_rgba(239,68,68,0.5)] flex items-center gap-3">
                DEACTIVATE
              </span>
            </button>
          </div>

          {/* 4. FLOATING TRANSIENT PILL / DYNAMIC ISLAND CARD */}
          <SiriTransientPill
            isListening={isListening}
            isSpeaking={isSpeaking}
            isBrieActive={isBrieActive}
            spokenTranscript={spokenTranscript}
            lastBriReply={lastBriReply}
            userName={userName}
            onToggleListen={handleToggleMic}
            onRepeatSpeech={() => {
              if (lastBriReply) {
                speakBrie(lastBriReply, { resumeListening: true, rate: 0.85 });
              }
            }}
            onStopSpeech={() => {
              speech.stopSpeaking();
              setIsSpeaking(false);
            }}
          />
        </div>
      </BlindGestureManager>

      {/* 5. ANDROID SYSTEM TAKEOVER CODE MODAL (PART 1) */}
      <AndroidCodeModal
        isOpen={isAndroidCodeModalOpen}
        onClose={() => setIsAndroidCodeModalOpen(false)}
        onOpenDrawables={() => {
          setIsAndroidCodeModalOpen(false);
          setIsDrawableModalOpen(true);
        }}
      />

      {/* 6. DRAWABLE ASSETS MODAL */}
      <DrawableManagerModal
        isOpen={isDrawableModalOpen}
        onClose={() => setIsDrawableModalOpen(false)}
        drawables={drawables}
        onUpdateDrawables={setDrawables}
        isBrieActive={isBrieActive}
        onToggleActiveState={setIsBrieActive}
      />

      {/* 7. BRIE VISION MODAL (CAMERA EYES / CURRENCY / OCR) */}
      <BrieVisionModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        userName={userName}
        initialQuery={visionQuery}
        onSpeakDescription={(desc) => {
          setLastBriReply(desc);
          speakBrie(desc, { resumeListening: true, rate: 0.85 });
        }}
      />
    </div>
  );
}
