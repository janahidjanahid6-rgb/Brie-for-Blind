import React, { useState } from 'react';
import { SmartEcosystem, SmartEcosystemConnection, SmartHomeState } from '../types';
import { speech } from '../services/speech';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';
import {
  Home,
  CheckCircle2,
  X,
  Plus,
  RefreshCw,
  Check,
  ChevronRight,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface SmartHomeSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  ecosystems: SmartEcosystemConnection[];
  onToggleEcosystem: (id: SmartEcosystem, connected: boolean) => void;
  onSyncAll: () => void;
  speechRate: number;
}

export const SmartHomeSetupWizard: React.FC<SmartHomeSetupWizardProps> = ({
  isOpen,
  onClose,
  ecosystems,
  onToggleEcosystem,
  onSyncAll,
  speechRate,
}) => {
  const [selectedEcosystem, setSelectedEcosystem] = useState<SmartEcosystem | null>(null);
  const [step, setStep] = useState<'select' | 'authorizing' | 'success'>('select');
  const [authEmail, setAuthEmail] = useState('');

  if (!isOpen) return null;

  const handleStartConnect = (eco: SmartEcosystemConnection) => {
    sounds.playClick();
    haptics.tap();
    setSelectedEcosystem(eco.id);
    setStep('authorizing');

    speech.speak(
      `Linking with ${eco.brand}. I'll scan your home network and import all your lights, switches, and thermostats in just a second.`,
      { rate: speechRate }
    );

    // Simulate guided connection
    setTimeout(() => {
      sounds.playSuccess();
      haptics.success();
      onToggleEcosystem(eco.id, true);
      setStep('success');
      speech.speak(
        `Great news! Your ${eco.brand} is connected. I found all your devices and they're ready to control with your voice anytime.`,
        { rate: speechRate }
      );
    }, 2400);
  };

  const handleDisconnect = (id: SmartEcosystem, brandName: string) => {
    sounds.playEarconStop();
    haptics.listeningStop();
    onToggleEcosystem(id, false);
    speech.speak(`Disconnected ${brandName}.`, { rate: speechRate });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Smart Home Ecosystem Setup"
    >
      <div className="relative w-full max-w-2xl bg-zinc-950 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 text-white space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400 text-black rounded-xl">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Connect Your Smart Home
              </h2>
              <p className="text-xs text-zinc-400">
                Link Google Home, Amazon Alexa, Apple HomeKit & Matter
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              speech.stopSpeaking();
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900"
            aria-label="Close Setup Wizard"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Normal Human Introductory Voice Note */}
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              Talk to your whole home naturally
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              &ldquo;Hey! I can connect straight to whatever smart stuff you already have at home—Google Nest, Alexa, or Apple HomeKit. Once we link up, you can just tell me what you need, like <span className="text-yellow-400 font-semibold">&apos;Hey Bri, turn off the bedroom lamp&apos;</span> or <span className="text-yellow-400 font-semibold">&apos;Make it cozy in the living room&apos;</span>.&rdquo;
            </p>
          </div>
        </div>

        {/* Step 1: Select & Manage Ecosystems */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase text-yellow-400 tracking-wider">
                Supported Smart Ecosystems
              </h3>
              <button
                onClick={() => {
                  sounds.playSonarPing();
                  haptics.tap();
                  onSyncAll();
                  speech.speak('Scanning all linked smart home networks for new devices.', {
                    rate: speechRate,
                  });
                }}
                className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800"
              >
                <RefreshCw className="w-3.5 h-3.5 text-yellow-400" />
                <span>Sync All Devices</span>
              </button>
            </div>

            <div className="space-y-3">
              {ecosystems.map((eco) => (
                <div
                  key={eco.id}
                  className="p-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl flex items-center justify-between gap-4 transition-all hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                        eco.id === 'google-home'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : eco.id === 'alexa'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : eco.id === 'homekit'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {eco.id === 'google-home' && 'G'}
                      {eco.id === 'alexa' && 'A'}
                      {eco.id === 'homekit' && ''}
                      {eco.id === 'matter' && 'M'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-white">
                          {eco.brand}
                        </h4>
                        {eco.isConnected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            CONNECTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">
                        {eco.isConnected
                          ? `${eco.deviceCount} smart devices active · Last synced ${eco.lastSynced}`
                          : 'Not linked yet · One-touch easy pairing'}
                      </p>
                    </div>
                  </div>

                  <div>
                    {eco.isConnected ? (
                      <button
                        onClick={() => handleDisconnect(eco.id, eco.brand)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-zinc-700"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartConnect(eco)}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-yellow-400 hover:bg-yellow-300 text-black flex items-center gap-1.5 active:scale-95 shadow-md shadow-yellow-400/20"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Natural Voice Command Examples for Ecosystems */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
              <h4 className="text-xs font-extrabold text-yellow-400 uppercase tracking-wider">
                What you can say with these linked:
              </h4>
              <ul className="text-xs text-zinc-300 space-y-1.5">
                <li>• &ldquo;Hey Bri, tell Google Home to set the thermostat to 72&rdquo;</li>
                <li>• &ldquo;Bri, turn on all my Alexa kitchen lights&rdquo;</li>
                <li>• &ldquo;Hey Bri, lock the Apple HomeKit front door&rdquo;</li>
                <li>• &ldquo;Bri, is my front entrance door locked?&rdquo;</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Authorizing Animation */}
        {step === 'authorizing' && (
          <div className="space-y-6 py-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400/20 text-yellow-400 border-2 border-yellow-400 flex items-center justify-center animate-spin">
              <RefreshCw className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">
                Scanning Your Home Network...
              </h3>
              <p className="text-sm text-zinc-300 max-w-sm mx-auto">
                Bri is discovering your compatible lights, smart plugs, locks, and climate systems. Hang tight!
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 'success' && (
          <div className="space-y-6 py-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">
                Boom! Your devices are synced.
              </h3>
              <p className="text-sm text-zinc-300 max-w-md mx-auto">
                Everything is linked and ready. You don&apos;t have to memorize special commands—just speak to Bri like a friend.
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playSuccess();
                setStep('select');
                onClose();
              }}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-base rounded-2xl active:scale-98 transition-transform"
            >
              Start Controlling My Devices
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Matter & Direct Token Authentication</span>
          </div>
          <span>Offline Fallback Ready</span>
        </div>
      </div>
    </div>
  );
};
