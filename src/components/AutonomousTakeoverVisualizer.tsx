import React from 'react';
import { AutonomousActionLog, CallState, WhatsAppMessage, PlayApp } from '../types';
import { Phone, PhoneOff, Volume2, Mic, CheckCheck, Download, CheckCircle, ShieldCheck } from 'lucide-react';

interface AutonomousTakeoverProps {
  currentCall: CallState;
  onEndCall: () => void;
  onToggleSpeaker: () => void;
  onPronounceDecision?: (shouldPronounce: boolean) => void;
  recentMessages: WhatsAppMessage[];
  installedApps: PlayApp[];
  actionLogs: AutonomousActionLog[];
  activeTask: AutonomousActionLog | null;
  downloadProgress: { appName: string; percent: number } | null;
}

export const AutonomousTakeoverVisualizer: React.FC<AutonomousTakeoverProps> = ({
  currentCall,
  onEndCall,
  onToggleSpeaker,
  onPronounceDecision,
  recentMessages,
  installedApps,
  actionLogs,
  activeTask,
  downloadProgress,
}) => {
  return (
    <div className="space-y-6">
      {/* Sighted Mode: Incoming Call Pronounce Permission Dialog */}
      {currentCall.isActive && currentCall.permissionPending && (
        <div
          className="p-6 bg-slate-900 border-4 border-yellow-400 rounded-3xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          role="dialog"
          aria-label="Caller Name Privacy Decision"
        >
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-yellow-400 animate-bounce" />
            <span className="text-xs font-extrabold text-yellow-400 uppercase tracking-wider">
              PRIVACY PERMISSION PROTOCOL
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Your phone is calling. Should I pronounce the name?
          </h3>
          <p className="text-sm text-slate-300">
            Just say <span className="text-emerald-400 font-bold">&quot;Yes&quot;</span> or <span className="text-red-400 font-bold">&quot;No&quot;</span>. Listening for your voice automatically.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => onPronounceDecision?.(true)}
              className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span>Yes, Pronounce</span>
            </button>
            <button
              onClick={() => onPronounceDecision?.(false)}
              className="py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span>No, Don&apos;t Say</span>
            </button>
          </div>
        </div>
      )}

      {/* Blind Mode: Auto-Answer 3s Countdown HUD */}
      {currentCall.isActive &&
        currentCall.autoAnswerCountdown !== null &&
        currentCall.autoAnswerCountdown !== undefined &&
        !currentCall.permissionPending && (
          <div
            className="p-6 bg-yellow-400 text-black border-4 border-yellow-300 rounded-3xl shadow-2xl space-y-2 animate-in zoom-in-95 duration-200"
            role="status"
          >
            <span className="text-xs font-black uppercase tracking-wider bg-black text-yellow-400 px-3 py-1 rounded-full">
              BLIND MODE AUTONOMOUS ANSWER
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Incoming call from {currentCall.contactName}
            </h3>
            <p className="text-base font-bold">
              Answering automatically on speakerphone in {currentCall.autoAnswerCountdown}s... You do not need to look at or touch the screen.
            </p>
          </div>
        )}
      {/* Active Autonomous Phone Call Overlay */}
      {currentCall.isActive && (
        <div
          className="p-6 bg-emerald-950 border-4 border-emerald-400 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
          role="region"
          aria-label="Active Autonomous Phone Call"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 font-extrabold uppercase tracking-wider text-sm">
                AUTONOMOUS CELLULAR CALL
              </span>
            </div>
            <span className="text-xl font-mono text-emerald-200 font-bold tabular-nums">
              {Math.floor(currentCall.durationSeconds / 60)}:
              {(currentCall.durationSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="text-center py-4 space-y-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-700/60 border-2 border-emerald-400 flex items-center justify-center text-3xl font-extrabold text-white">
              {currentCall.contactName ? currentCall.contactName.charAt(0) : 'P'}
            </div>
            <h3 className="text-3xl font-black text-white">{currentCall.contactName}</h3>
            <p className="text-lg text-emerald-200 font-mono">{currentCall.phoneNumber}</p>
            <p className="text-sm font-semibold text-emerald-300">
              {currentCall.isRinging ? 'Ringing...' : 'Connected on Loud Speakerphone'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={onToggleSpeaker}
              className={`p-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-base border-2 ${
                currentCall.isSpeakerOn
                  ? 'bg-emerald-400 text-black border-white'
                  : 'bg-emerald-900 text-white border-emerald-500'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span>{currentCall.isSpeakerOn ? 'Speaker ON' : 'Speaker OFF'}</span>
            </button>
            <button
              onClick={onEndCall}
              className="p-4 rounded-2xl font-black flex items-center justify-center gap-2 text-base bg-red-600 hover:bg-red-700 text-white border-2 border-red-400 active:scale-95 transition-transform"
            >
              <PhoneOff className="w-5 h-5" />
              <span>Hang Up Call</span>
            </button>
          </div>
        </div>
      )}

      {/* Autonomous Download Progress Bar */}
      {downloadProgress && (
        <div className="p-6 bg-zinc-900 border-4 border-yellow-400 rounded-3xl shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-400/20 text-yellow-400 rounded-xl">
                <Download className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  PLAY STORE AUTONOMOUS ENGINE
                </span>
                <h4 className="text-xl font-black text-white">
                  Installing {downloadProgress.appName}
                </h4>
              </div>
            </div>
            <span className="text-2xl font-black text-yellow-400 tabular-nums">
              {downloadProgress.percent}%
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden border border-zinc-700">
            <div
              className="bg-yellow-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${downloadProgress.percent}%` }}
            />
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium">
            Brie is automatically downloading, verifying integrity, and installing for you.
          </p>
        </div>
      )}

      {/* Current Executing Task HUD */}
      {activeTask && (
        <div className="p-5 bg-sky-950/80 border-2 border-sky-400 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-sky-400 animate-ping" />
            <div>
              <span className="text-xs font-bold text-sky-300 uppercase">
                ACTIVE AUTONOMOUS TASK
              </span>
              <p className="text-base font-extrabold text-white">{activeTask.title}</p>
              <p className="text-xs text-sky-200">{activeTask.details}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-sky-400 text-black text-xs font-black rounded-lg">
            AUTOPILOT
          </span>
        </div>
      )}

      {/* Live System Action Audit Log */}
      <div className="p-6 bg-zinc-950 border-2 border-zinc-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">
              Autonomous Accessibility Audit Log
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Total actions: {actionLogs.length}
          </span>
        </div>

        {actionLogs.length === 0 ? (
          <p className="text-sm text-zinc-400 italic py-4 text-center">
            Brie is on standby. Speak a command or gesture to trigger autonomous phone tasks.
          </p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {actionLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-lg shrink-0 mt-0.5">
                    {log.actionType === 'call' && <Phone className="w-4 h-4" />}
                    {log.actionType === 'whatsapp' && <CheckCheck className="w-4 h-4" />}
                    {log.actionType === 'playstore' && <Download className="w-4 h-4" />}
                    {log.actionType === 'smarthome' && <CheckCircle className="w-4 h-4" />}
                    {log.actionType === 'system' && <Volume2 className="w-4 h-4" />}
                    {log.actionType === 'ai' && <Mic className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{log.title}</p>
                      <span className="text-[10px] font-mono text-zinc-400">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5">{log.details}</p>
                    {log.spokenFeedback && (
                      <p className="text-xs text-yellow-300 font-medium mt-1 italic">
                        &ldquo;{log.spokenFeedback}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 shrink-0">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
