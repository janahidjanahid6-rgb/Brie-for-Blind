import React, { useState } from 'react';
import {
  PlayApp,
  Contact,
  WhatsAppMessage,
  CallState,
  AutonomousActionLog,
  PendingMoneyTransfer,
} from '../types';
import {
  Ghost,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  PhoneCall,
  MessageSquare,
  Download,
  DollarSign,
  Radio,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';

interface GhostTakeoverPanelProps {
  userName: string;
  hasContactsPermission: boolean;
  onToggleContactsPermission: () => void;
  apps: PlayApp[];
  contacts: Contact[];
  messages: WhatsAppMessage[];
  currentCall: CallState;
  actionLogs: AutonomousActionLog[];
  pendingMoneyTransfer: PendingMoneyTransfer | null;
  flashlightOn: boolean;
  onSimulateAppLaunch: (appName: string) => void;
  onSimulateWhatsApp: (contact: string) => void;
  onSimulateMoneyTransfer: (amount: string, recipient: string) => void;
}

export function GhostTakeoverPanel({
  userName,
  hasContactsPermission,
  onToggleContactsPermission,
  apps,
  contacts,
  messages,
  currentCall,
  actionLogs,
  pendingMoneyTransfer,
  flashlightOn,
  onSimulateAppLaunch,
  onSimulateWhatsApp,
  onSimulateMoneyTransfer,
}: GhostTakeoverPanelProps) {
  const [activeGhostSubsystem, setActiveGhostSubsystem] = useState<string>('telephony');

  const subsystems = [
    {
      id: 'accessibility',
      name: 'Accessibility Root Daemon',
      icon: Layers,
      status: 'Active (PID 1337)',
      description: 'Injects synthetic taps, scrolls, and screen descriptions. Bypasses the need for sight.',
      accent: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20',
    },
    {
      id: 'telephony',
      name: 'Telephony & Audio Hook',
      icon: PhoneCall,
      status: currentCall.isActive ? 'Call Hook Engaged' : 'Intercepting Standby',
      description: 'Auto-answers calls on speakerphone (blind mode) or seeks permission (sighted companion).',
      accent: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Automation Engine',
      icon: MessageSquare,
      status: 'Relay Active',
      description: 'Reads incoming messages aloud and dispatches voice dictations without touching the screen.',
      accent: 'border-green-500/50 text-green-400 bg-green-950/20',
    },
    {
      id: 'momo',
      name: 'Mobile Money 2-Step Guard',
      icon: DollarSign,
      status: pendingMoneyTransfer ? 'Authorization Pending' : 'Armed (Zero Auto-Send)',
      description: 'Enforces strict 2-step verification. Pre-fills amount, user manually inputs their own PIN.',
      accent: 'border-amber-500/50 text-amber-400 bg-amber-950/20',
    },
    {
      id: 'playstore',
      name: 'Autonomous App Installer',
      icon: Download,
      status: 'Package Daemon Ready',
      description: 'Navigates Play Store, downloads accessibility tools, and configures apps hands-free.',
      accent: 'border-purple-500/50 text-purple-400 bg-purple-950/20',
    },
    {
      id: 'firewall',
      name: 'Privacy & Permission Firewall',
      icon: ShieldCheck,
      status: hasContactsPermission ? 'Contacts Authorized' : 'Permission Required',
      description: 'Guards private data. Blocks strangers (<85% voice similarity) and seeks user approval.',
      accent: 'border-blue-500/50 text-blue-400 bg-blue-950/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Ghost Takeover Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-neutral-950 via-slate-900 to-cyan-950/40 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Ghost className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Ghost className="w-3.5 h-3.5 animate-pulse" />
              <span>Full Phone System Ghost Takeover</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Brie's Ethereal Phone Daemon
            </h2>
            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
              Like a ghost entering a phone, Brie takes control of the entire operating system so blind and busy users never have to look at the screen. Private actions always seek permission first.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onToggleContactsPermission}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                hasContactsPermission
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              {hasContactsPermission ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              <span>{hasContactsPermission ? 'Contacts Permission: GRANTED' : 'Contacts Permission: REVOKED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subsystem Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub) => {
          const Icon = sub.icon;
          const isSelected = activeGhostSubsystem === sub.id;
          return (
            <div
              key={sub.id}
              onClick={() => setActiveGhostSubsystem(sub.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected ? `${sub.accent} ring-2 ring-cyan-500/50 shadow-lg` : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm text-white">{sub.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  {sub.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{sub.description}</p>
            </div>
          );
        })}
      </div>

      {/* Interactive Ghost Autonomous Phone Simulation Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulated Phone OS Screen */}
        <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Simulated Device Screen (Brie Autonomous View)
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-neutral-400 font-mono">
              <span>BATTERY 92%</span>
              <span>•</span>
              <span className={flashlightOn ? 'text-amber-400 font-semibold' : ''}>
                FLASH: {flashlightOn ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Phone Screen Canvas */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 min-h-[300px] flex flex-col justify-between relative">
            {/* Ethereal Ghost Cursor Overlay */}
            <div className="absolute top-6 right-6 flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[10px] text-cyan-300 font-mono animate-pulse">
              <Ghost className="w-3 h-3 text-cyan-400" />
              <span>GHOST_TOUCH_DAEMON: ARMED</span>
            </div>

            {/* Simulated Active Screen Content */}
            {pendingMoneyTransfer ? (
              <div className="my-auto p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold text-sm">
                    {pendingMoneyTransfer.provider} Screen Intercepted
                  </span>
                </div>
                <p className="text-xs text-neutral-300">
                  Pre-filled: <span className="font-bold text-white">{pendingMoneyTransfer.amount}</span> to{' '}
                  <span className="font-bold text-white">{pendingMoneyTransfer.recipient}</span>.
                </p>
                <div className="p-2.5 bg-neutral-900 rounded-lg text-xs text-amber-200/90 font-mono">
                  [Awaiting manual user PIN input on hardware keypad]
                </div>
              </div>
            ) : currentCall.isActive ? (
              <div className="my-auto p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 mx-auto flex items-center justify-center">
                  <PhoneCall className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{currentCall.contactName}</h4>
                  <p className="text-xs text-emerald-400 font-mono">
                    Call Routed Through Ghost Telephony Daemon
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 my-2">
                <div className="text-left">
                  <p className="text-xs text-neutral-400">Installed Applications (Autonomous Launchable):</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-2">
                    {apps.slice(0, 8).map((app) => (
                      <button
                        key={app.id}
                        onClick={() => onSimulateAppLaunch(app.name)}
                        className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 flex flex-col items-center space-y-1.5 active:scale-95 transition-all text-center"
                      >
                        <span className="text-xl">{app.icon}</span>
                        <span className="text-[11px] font-medium text-neutral-200 truncate w-full">
                          {app.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-left pt-2 border-t border-neutral-800">
                  <p className="text-xs text-neutral-400 mb-2">Quick Simulated Autonomous Invocations:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onSimulateMoneyTransfer('50,000 UGX', 'Sarah')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-medium"
                    >
                      Trigger MoMo Transfer
                    </button>
                    <button
                      onClick={() => onSimulateWhatsApp('Mom')}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 text-xs font-medium"
                    >
                      Simulate WhatsApp Message
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Ghost Status Bar */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Ghost Voice Bridge: Continuous Audio Out</span>
              </span>
              <span>Owner: {userName}</span>
            </div>
          </div>
        </div>

        {/* Right: Live Ghost System Event Stream */}
        <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Ghost Subsystem Event Log
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                LIVE
              </span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {actionLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 text-left space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{log.title}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-neutral-300">{log.details}</p>
                  <div className="text-[10px] text-cyan-300 bg-cyan-950/40 p-1.5 rounded font-mono">
                    Spoken: "{log.spokenFeedback}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Permission Protected</span>
            </span>
            <span>Zero Unattended PIN Entry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
