import React, { useState } from 'react';
import { SiriOrb } from './SiriOrb';
import { SiriWaveform } from './SiriWaveform';
import {
  CallState,
  WhatsAppMessage,
  PendingMoneyTransfer,
  SmartHomeState,
  SmartSpeaker,
} from '../types';
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Send,
  Music,
  Play,
  Pause,
  Home,
  X,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface OriginalSiriOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  isListening: boolean;
  isSpeaking: boolean;
  spokenTranscript: string;
  lastBriReply: string;
  onMicToggle: () => void;
  currentCall: CallState;
  onEndCall: () => void;
  pendingMoneyTransfer: PendingMoneyTransfer | null;
  onConfirmMoneyTransfer: (confirm: boolean) => void;
  messages: WhatsAppMessage[];
  smartHome: SmartHomeState;
  speaker: SmartSpeaker;
  onToggleMusic: () => void;
  activeEmotion: string | null;
  hasContactsPermission: boolean;
  onRequestContactsPermission: () => void;
}

export function OriginalSiriOverlay({
  isOpen,
  onClose,
  userName,
  isListening,
  isSpeaking,
  spokenTranscript,
  lastBriReply,
  onMicToggle,
  currentCall,
  onEndCall,
  pendingMoneyTransfer,
  onConfirmMoneyTransfer,
  messages,
  smartHome,
  speaker,
  onToggleMusic,
  activeEmotion,
  hasContactsPermission,
  onRequestContactsPermission,
}: OriginalSiriOverlayProps) {
  if (!isOpen) return null;

  const latestMessage = messages[messages.length - 1];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 backdrop-blur-3xl bg-black/85 text-white animate-fade-in select-none"
      role="dialog"
      aria-label="Brie for Blind Voice Assistant"
    >
      {/* Background ambient chromatic glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-purple-600 blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-pink-500 blur-[120px]" />
      </div>

      {/* Top Bar: Brie Header and Dismiss */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-3xl mx-auto pt-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs uppercase tracking-widest font-semibold text-neutral-400">
            Brie for Blind • Voice-Guided Navigation
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-neutral-300 hover:text-white"
          title="Dismiss Brie (or say 'Stop')"
          aria-label="Close Brie Overlay"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Center Area: Brie Typography & Dynamic Interactive Cards */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto my-auto space-y-6 overflow-y-auto py-4">
        {/* Title greeting or active status */}
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
            {isListening ? 'Listening to your voice...' : isSpeaking ? 'Brie speaking...' : 'Voice Assistant Ready'}
          </p>
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white/95">
            {isListening && spokenTranscript ? (
              <span className="font-normal italic">"{spokenTranscript}"</span>
            ) : pendingMoneyTransfer ? (
              <span>Money Transfer Authorization</span>
            ) : currentCall.isActive ? (
              <span>Active Phone Call</span>
            ) : activeEmotion ? (
              <span>I'm right here with you, {userName}</span>
            ) : (
              <span>What can I do for you, {userName}?</span>
            )}
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 max-w-lg mx-auto font-normal leading-relaxed">
            {lastBriReply}
          </p>
        </div>

        {/* Dynamic Context Card: Money Transfer 2-Step Confirmation */}
        {pendingMoneyTransfer && (
          <div className="w-full bg-neutral-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-amber-300 text-sm">
                  {pendingMoneyTransfer.step === 'confirm_details'
                    ? 'Step 1 of 2: Confirm Transaction'
                    : 'Step 2 of 2: Manual PIN Hand-Off'}
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {pendingMoneyTransfer.provider}
              </span>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-400">Recipient:</span>
                <span className="text-base font-semibold text-white">{pendingMoneyTransfer.recipient}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-400">Amount:</span>
                <span className="text-lg font-bold text-emerald-400">{pendingMoneyTransfer.amount}</span>
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
              <p className="font-semibold mb-1 flex items-center space-x-1">
                <span>🛡️ Money Rule Protection:</span>
              </p>
              <p>
                Brie will NEVER send money or ask for your PIN automatically. You will enter your PIN manually in the official{' '}
                {pendingMoneyTransfer.provider} application.
              </p>
            </div>

            <div className="flex space-x-3 pt-1">
              <button
                onClick={() => onConfirmMoneyTransfer(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-semibold text-white shadow-lg flex items-center justify-center space-x-2 active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Say "YES" or Tap Here</span>
              </button>
              <button
                onClick={() => onConfirmMoneyTransfer(false)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 font-medium text-neutral-300 active:scale-98 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Context Card: Active Phone Call */}
        {currentCall.isActive && (
          <div className="w-full bg-neutral-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-pulse">
              <PhoneCall className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{currentCall.contactName || 'Call in Progress'}</h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{currentCall.phoneNumber}</p>
              <p className="text-sm text-emerald-400 font-medium mt-1">
                Connected on Speakerphone • {Math.floor(currentCall.durationSeconds / 60)}:
                {(currentCall.durationSeconds % 60).toString().padStart(2, '0')}
              </p>
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <button
                onClick={onEndCall}
                className="py-2.5 px-6 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold flex items-center space-x-2 shadow-lg transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Hang Up</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Context Card: Emotional Support / Motivational Speaker */}
        {activeEmotion && (
          <div className="w-full bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-purple-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-fade-in space-y-3 text-left">
            <div className="flex items-center space-x-2 text-purple-300">
              <HeartHandshake className="w-5 h-5" />
              <span className="font-semibold text-sm">Your Personal Friend & Motivator</span>
            </div>
            <p className="text-sm text-purple-100 leading-relaxed font-normal">
              "{userName}, every tough moment passes, but your resilience stays. I'm right here beside you. Tell me what annoyed you or how you're feeling—I'm all ears, friend."
            </p>
            <div className="text-xs text-purple-300/80 italic">
              Speak naturally. Brie listens and speaks aloud at every moment.
            </div>
          </div>
        )}

        {/* Dynamic Context Card: Contacts Permission Guard */}
        {!hasContactsPermission && (
          <div className="w-full bg-neutral-900/80 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between text-left space-x-3">
            <div>
              <p className="text-xs font-semibold text-blue-300">Contacts Access Guard</p>
              <p className="text-xs text-neutral-300 mt-0.5">
                Brie needs your verbal permission before searching or dialing contacts.
              </p>
            </div>
            <button
              onClick={onRequestContactsPermission}
              className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white shrink-0"
            >
              Grant Permission
            </button>
          </div>
        )}

        {/* Dynamic Context Card: Music Player */}
        <div className="w-full bg-neutral-900/70 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{speaker.currentTrack}</p>
              <p className="text-xs text-neutral-400">{speaker.artist}</p>
            </div>
          </div>
          <button
            onClick={onToggleMusic}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
            aria-label={speaker.isPlaying ? 'Pause Music' : 'Play Music'}
          >
            {speaker.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>

        {/* Brie Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-neutral-400">Try saying:</span>
          {['"Send 20,000 to Sarah"', '"Call Mom"', '"Play music"', '"Where is my phone"', '"Turn on living room light"'].map(
            (phrase, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-medium"
              >
                {phrase}
              </span>
            )
          )}
        </div>
      </div>

      {/* Bottom Area: Brie Sinusoidal Waveform & Glowing Orb */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-4 pb-4">
        {/* Sinusoidal Waveform Canvas */}
        <div className="w-full h-14 flex items-center justify-center">
          <SiriWaveform isListening={isListening} isSpeaking={isSpeaking} />
        </div>

        {/* Brie Glowing Plasma Orb & Push-to-Talk Button */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={onMicToggle}
            className="relative group focus:outline-none rounded-full p-2"
            aria-label={isListening ? 'Mute microphone' : 'Activate Brie microphone'}
          >
            <SiriOrb isListening={isListening} isSpeaking={isSpeaking} size="lg" />
            <div className="absolute inset-0 flex items-center justify-center text-white/90 pointer-events-none">
              {isListening ? (
                <Mic className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <Sparkles className="w-5 h-5 text-white/80" />
              )}
            </div>
          </button>

          <span className="text-xs text-neutral-400 font-medium">
            {isListening ? 'Tap orb or speak naturally' : 'Tap orb to talk'}
          </span>
        </div>
      </div>
    </div>
  );
}
