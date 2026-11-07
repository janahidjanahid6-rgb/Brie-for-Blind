import React, { useState, useEffect } from 'react';
import { AppSettings, AssistantMode, HighContrastTheme } from '../types';
import { speech } from '../services/speech';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';
import {
  X,
  Sliders,
  Volume2,
  Vibrate,
  Palette,
  Eye,
  Shield,
  RotateCcw,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  currentMode: AssistantMode;
  onSelectMode: (mode: AssistantMode) => void;
  onOpenWakeWordTrainer: () => void;
  onOpenSmartHomeWizard: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentMode,
  onSelectMode,
  onOpenWakeWordTrainer,
  onOpenSmartHomeWizard,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [customWakeWord, setCustomWakeWord] = useState(settings.wakeWord);

  useEffect(() => {
    const list = speech.getVoices();
    setVoices(list);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(speech.getVoices());
      };
    }
  }, []);

  if (!isOpen) return null;

  const testVoice = (rate: number = 1.0, pitch: number = 1.0, voiceURI: string = '') => {
    speech.speak('Hello friend, I am Brie. I am speaking at normal speed now.', {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voiceURI,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Brie Settings & Accessibility Options"
    >
      <div className="relative w-full max-w-2xl bg-zinc-950 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 text-white space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-black text-white">Accessibility & Voice Settings</h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 hover:bg-zinc-800"
            aria-label="Close Settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 1. Mode Switcher */}
        <div className="space-y-2">
          <label className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider block">
            Assistant Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['blind', 'low-vision', 'busy'] as AssistantMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  sounds.playClick();
                  haptics.tap();
                  onSelectMode(m);
                }}
                className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 ${
                  currentMode === m
                    ? 'bg-yellow-400 text-black border-yellow-300'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {currentMode === m && <Check className="w-4 h-4" />}
                <span className="capitalize">{m === 'low-vision' ? 'Seeing Impaired' : m}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Wake Word Customization & Training */}
        <div className="space-y-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider block">
                Custom Wake Word & Voice Training
              </label>
              <p className="text-xs text-zinc-400">
                Current active wake word: &ldquo;<span className="text-white font-bold">{settings.wakeWord}</span>&rdquo;
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenWakeWordTrainer();
              }}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-yellow-400/20 active:scale-95 transition-transform"
            >
              <span>Train Voice Pattern</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customWakeWord}
              onChange={(e) => setCustomWakeWord(e.target.value)}
              placeholder="e.g. Hey Brie, Computer, Jarvis, Buddy..."
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 font-bold"
            />
            <button
              onClick={() => {
                sounds.playSuccess();
                haptics.success();
                onUpdateSettings({ wakeWord: customWakeWord.trim().toLowerCase() });
                speech.speak(`Got it! I will now answer whenever you say "${customWakeWord}".`, { rate: settings.speechRate });
              }}
              className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs rounded-xl border border-zinc-700"
            >
              Set Wake Word
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {['Hey Brie', 'Brie', 'Hello Brie', 'Buddy', 'Jarvis', 'Phoenix'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setCustomWakeWord(preset);
                  onUpdateSettings({ wakeWord: preset.toLowerCase() });
                }}
                className="text-xs bg-zinc-950 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-800"
              >
                {preset}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 italic">
            Tip: For the best offline accuracy, tap &ldquo;Train Voice Pattern&rdquo; above to record 3 audio calibration samples with your own voice.
          </p>
        </div>

        {/* 2B. Smart Home Ecosystems Setup */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-white">Smart Home Ecosystems</h4>
            <p className="text-xs text-zinc-400">Google Home, Amazon Alexa, Apple HomeKit & Matter</p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSmartHomeWizard();
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-zinc-700 font-extrabold text-xs rounded-xl"
          >
            Manage Ecosystems
          </button>
        </div>

        {/* 3. Speech Rate & Pitch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-300">
              <span>Speech Speed ({settings.speechRate.toFixed(2)}x)</span>
              <span className="text-yellow-400 font-mono">
                {settings.speechRate >= 1.3 ? 'Fast (Blind-optimized)' : 'Standard'}
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                onUpdateSettings({ speechRate: rate });
              }}
              className="w-full accent-yellow-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-300">
              <span>Speech Pitch ({settings.speechPitch.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={settings.speechPitch}
              onChange={(e) => {
                const pitch = parseFloat(e.target.value);
                onUpdateSettings({ speechPitch: pitch });
              }}
              className="w-full accent-yellow-400"
            />
          </div>
        </div>

        {/* 4. Voice Selection */}
        {voices.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider">
                Synthesized Voice
              </label>
              <button
                onClick={() => testVoice(settings.speechRate, settings.speechPitch, settings.selectedVoiceURI)}
                className="text-xs font-bold text-yellow-400 underline"
              >
                Test Voice Sample
              </button>
            </div>
            <select
              value={settings.selectedVoiceURI}
              onChange={(e) => onUpdateSettings({ selectedVoiceURI: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400"
            >
              <option value="">Default System Natural Voice</option>
              {voices
                .filter((v) => v.lang.startsWith('en'))
                .map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* 5. High-Contrast Themes (For Low Vision) */}
        <div className="space-y-2">
          <label className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider block">
            Visual Contrast Themes (Low Vision Mode)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'yellow-black', label: 'Yellow on Black', bg: 'bg-black text-yellow-400 border-yellow-400' },
              { id: 'white-black', label: 'White on Black', bg: 'bg-black text-white border-white' },
              { id: 'cyan-dark', label: 'Cyan on Deep Blue', bg: 'bg-slate-950 text-cyan-400 border-cyan-400' },
              { id: 'amber-dark', label: 'Amber Night', bg: 'bg-stone-950 text-amber-400 border-amber-400' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  sounds.playClick();
                  onUpdateSettings({ highContrastTheme: theme.id as HighContrastTheme });
                }}
                className={`p-3 rounded-xl text-xs font-bold border-2 ${theme.bg} ${
                  settings.highContrastTheme === theme.id ? 'ring-2 ring-white' : 'opacity-80'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Toggles: Haptics, Audio Cues, Offline Privacy */}
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-bold text-white">Haptic Vibration Feedback</p>
                <p className="text-xs text-zinc-400">Tactile vibrational pulses on touch and actions</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.hapticsEnabled ? 'bg-yellow-400' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-bold text-white">Acoustic Sound Cues & Sonar Pings</p>
                <p className="text-xs text-zinc-400">Tactile earcons for spatial awareness</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.soundEffectsEnabled ? 'bg-yellow-400' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  settings.soundEffectsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-bold text-white">Strict Offline Privacy Mode</p>
                <p className="text-xs text-zinc-400">Process voice locally with zero cloud transmissions</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ offlineOnly: !settings.offlineOnly })}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.offlineOnly ? 'bg-yellow-400' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  settings.offlineOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            onClick={() => {
              sounds.playSuccess();
              onClose();
            }}
            className="px-6 py-3 bg-yellow-400 text-black font-extrabold rounded-xl text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
