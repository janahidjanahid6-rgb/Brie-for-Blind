import React, { useEffect, useState } from 'react';
import { AssistantMode } from '../types';
import { speech } from '../services/speech';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';
import { Volume2, Power, Moon, Sparkles, Mic } from 'lucide-react';

interface OnboardingModalProps {
  onSelectMode: (mode: AssistantMode) => void;
  speechRate: number;
  userName: string;
  onSetUserName: (name: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onSelectMode,
  speechRate,
  userName,
  onSetUserName,
}) => {
  const [speechActive, setSpeechActive] = useState(false);
  const [step, setStep] = useState<'ask_name' | 'show_choices'>('ask_name');
  const [recognizedSpeech, setRecognizedSpeech] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');

  const firstLaunchGreeting = "Hey! I'm Brie, your new friend! What's your name?";

  const speakGreeting = () => {
    sounds.playEarconStart();
    haptics.listeningStart();
    setSpeechActive(true);
    speech.speak(firstLaunchGreeting, {
      rate: 1.0,
      onEnd: () => {
        setSpeechActive(false);
        // Start listening immediately so the user can speak their name eyes-free
        startNameListening();
      },
    });
  };

  const startNameListening = () => {
    speech.setCallbacks(
      () => {},
      (text: string, isFinal: boolean) => {
        setRecognizedSpeech(text);
        if (text.trim()) {
          const cleanedName = text
            .replace(/my name is|i am|call me|this is|am/gi, '')
            .trim();
          if (cleanedName.length > 0 && isFinal) {
            handleNameReceived(cleanedName);
          }
        }
      },
      () => {}
    );
    speech.startListening();
  };

  const handleNameReceived = (name: string) => {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    sounds.playSuccess();
    haptics.success();
    speech.stopListening();
    onSetUserName(capitalized);
    try {
      localStorage.setItem('@brie_user_name', capitalized);
    } catch {}

    setStep('show_choices');
    const introStep2 = `Nice to meet you ${capitalized}! I love that name. Listen, you don't need to touch anything. This app has only two choices: ACTIVATE and DEACTIVATE. Just say ACTIVATE when you need me, or DEACTIVATE when you want me to leave your phone alone like a ghost. Say ACTIVATE or give me an order right now!`;
    setSpeechActive(true);
    speech.speak(introStep2, {
      rate: 1.0,
      onEnd: () => {
        setSpeechActive(false);
        startChoiceListening(capitalized);
      },
    });
  };

  const startChoiceListening = (friendName: string) => {
    speech.setCallbacks(
      () => {},
      (text: string) => {
        setRecognizedSpeech(text);
        const lower = text.toLowerCase().trim();
        if (lower.includes('activate') || lower.includes('hey brie') || lower.includes('wake up') || lower.includes('yes') || lower.includes('ready')) {
          handleActivate(friendName);
        } else if (lower.includes('deactivate') || lower.includes('sleep') || lower.includes('leave') || lower.includes('stop')) {
          handleDeactivate(friendName);
        } else if (text.trim().length > 3) {
          // If the user already issued any other command, treat as active and proceed
          handleActivate(friendName);
        }
      },
      () => {}
    );
    speech.startListening();
  };

  useEffect(() => {
    speakGreeting();
    return () => {
      speech.stopListening();
    };
  }, []);

  const handleActivate = (friendName?: string) => {
    sounds.playSuccess();
    haptics.success();
    speech.stopSpeaking();
    speech.stopListening();

    const nameToUse = friendName || userName || 'friend';
    try {
      localStorage.setItem('@user_app_mode', 'blind');
      localStorage.setItem('@brie_first_time', 'false');
    } catch {}

    speech.speak(
      `Activated, ${nameToUse}! I am listening and ready to follow your orders. You never need to tap the screen.`,
      { rate: 1.0 }
    );

    onSelectMode('blind');
  };

  const handleDeactivate = (friendName?: string) => {
    sounds.playEarconStop();
    haptics.listeningStop();
    speech.stopSpeaking();
    speech.stopListening();

    const nameToUse = friendName || userName || 'friend';
    try {
      localStorage.setItem('@user_app_mode', 'blind');
      localStorage.setItem('@brie_first_time', 'false');
    } catch {}

    speech.speak(
      `Deactivated, ${nameToUse}. Your phone is normal. Just say ACTIVATE or Hey Brie whenever you need me.`,
      { rate: 1.0 }
    );

    onSelectMode('blind');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white p-6 sm:p-10 select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Brie for Blind"
    >
      {/* Top Banner / Audio Replay */}
      <div className="flex items-center justify-between border-b-2 border-yellow-400 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>BRIE</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold uppercase tracking-wider">
              Voice-First • Hands-Free
            </span>
          </h1>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (step === 'ask_name') {
              speakGreeting();
            } else {
              speech.speak(
                `Listen ${userName || 'friend'}, there are only two choices: ACTIVATE and DEACTIVATE. You never need to tap the screen. Just command me aloud.`,
                { rate: 1.0 }
              );
            }
          }}
          className="flex items-center gap-2 px-4 py-3 bg-yellow-400 text-black font-bold text-base sm:text-lg rounded-xl active:scale-95 transition-transform"
          aria-label="Replay Brie Voice Greeting"
        >
          <Volume2 className="w-6 h-6" />
          <span>Repeat Audio</span>
        </button>
      </div>

      {/* Main Spoken Question Callout with Brie Orb */}
      <div className="my-auto py-6 text-center max-w-3xl mx-auto space-y-6 flex flex-col items-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-purple-600 animate-siri-rotate blur-lg opacity-70 absolute inset-0 -m-2 pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-purple-600 p-1 flex items-center justify-center relative shadow-2xl">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <Volume2 className={`w-10 h-10 text-cyan-300 ${speechActive ? 'animate-bounce' : ''}`} />
            </div>
          </div>
        </div>

        {step === 'ask_name' ? (
          <>
            <p className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              &ldquo;Hey! I&apos;m <span className="text-yellow-400 underline decoration-yellow-400 underline-offset-8">Brie</span>, your new friend! What&apos;s your name?&rdquo;
            </p>
            <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto">
              Just speak your name out loud. Brie is listening right now and will remember you forever.
            </p>

            {/* Quick Name Input for Non-Verbal or Quick Testing */}
            <div className="flex items-center gap-3 w-full max-w-md mx-auto pt-2">
              <input
                type="text"
                placeholder="Say or type your name (e.g. Cathy, James)"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nameInput.trim()) {
                    handleNameReceived(nameInput.trim());
                  }
                }}
                className="flex-1 px-4 py-3 rounded-2xl bg-zinc-900 border-2 border-zinc-700 text-white font-bold text-lg placeholder:text-zinc-500 focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={() => {
                  if (nameInput.trim()) {
                    handleNameReceived(nameInput.trim());
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-yellow-400 text-black font-extrabold text-base hover:bg-yellow-300 active:scale-95 transition-transform cursor-pointer"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              &ldquo;Nice to meet you <span className="text-yellow-400">{userName}</span>! Just say <span className="text-emerald-400 underline decoration-emerald-400 underline-offset-8">ACTIVATE</span> or <span className="text-rose-400 underline decoration-rose-400 underline-offset-8">DEACTIVATE</span>.&rdquo;
            </p>
            <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto">
              No tapping needed. Just command with your voice — Brie follows orders automatically.
            </p>
          </>
        )}

        {/* Live Voice Listening Pulse */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 border border-yellow-400 text-sm font-bold text-yellow-400 shadow-lg">
          <span className="w-3 h-3 rounded-full bg-yellow-400 animate-ping" />
          <span>Brie is listening for your voice...</span>
          {recognizedSpeech && <span className="text-white ml-2">&ldquo;{recognizedSpeech}&rdquo;</span>}
        </div>
      </div>

      {/* Massive Tactile Action Cards (ACTIVATE and DEACTIVATE ONLY) */}
      {step === 'show_choices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mx-auto pb-4">
          {/* CHOICE 1: ACTIVATE */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleActivate();
            }}
            onFocus={() => {
              speech.speak('ACTIVATE. Command aloud by saying ACTIVATE. Brie will take control and follow all your voice orders.', {
                rate: speechRate,
              });
            }}
            className="flex flex-col items-center justify-center p-8 sm:p-10 bg-emerald-950/40 hover:bg-emerald-950/70 border-4 border-emerald-400 rounded-3xl active:scale-98 transition-all text-center group cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400 shadow-2xl shadow-emerald-500/20"
            aria-label="Choice 1: ACTIVATE. Say Activate aloud or tap to wake Brie."
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border-2 border-emerald-400">
              <Power className="w-10 h-10 text-emerald-400" />
            </div>
            <span className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-wider mb-2">
              ACTIVATE
            </span>
            <span className="text-lg sm:text-xl text-emerald-200 font-semibold mb-2">
              Say &ldquo;ACTIVATE&rdquo; aloud
            </span>
            <span className="text-sm sm:text-base text-zinc-300">
              Takes full autonomous voice control • Follows all commands • Zero tapping required
            </span>
          </button>

          {/* CHOICE 2: DEACTIVATE */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeactivate();
            }}
            onFocus={() => {
              speech.speak('DEACTIVATE. Command aloud by saying DEACTIVATE. Brie leaves your phone like a ghost and restores normal phone operation.', {
                rate: speechRate,
              });
            }}
            className="flex flex-col items-center justify-center p-8 sm:p-10 bg-zinc-900/80 hover:bg-zinc-800 border-4 border-zinc-500 hover:border-rose-400 rounded-3xl active:scale-98 transition-all text-center group cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-400 shadow-xl"
            aria-label="Choice 2: DEACTIVATE. Say Deactivate aloud or tap to put Brie to sleep."
          >
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border-2 border-zinc-600">
              <Moon className="w-10 h-10 text-zinc-300 group-hover:text-rose-400" />
            </div>
            <span className="text-4xl sm:text-5xl font-black text-zinc-200 group-hover:text-rose-400 tracking-wider mb-2">
              DEACTIVATE
            </span>
            <span className="text-lg sm:text-xl text-zinc-400 font-semibold mb-2">
              Say &ldquo;DEACTIVATE&rdquo; aloud
            </span>
            <span className="text-sm sm:text-base text-zinc-400">
              Ghost leaves phone • Phone returns to normal • Restores quiet state
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
