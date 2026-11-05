import React, { useState } from 'react';
import { PlayApp, Contact, WhatsAppMessage } from '../types';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';
import { speech } from '../services/speech';
import {
  Download,
  Check,
  Phone,
  MessageSquare,
  Send,
  Zap,
  Battery,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface PhoneSimulatorProps {
  apps: PlayApp[];
  contacts: Contact[];
  messages: WhatsAppMessage[];
  onTriggerDownload: (app: PlayApp) => void;
  onTriggerCall: (contact: Contact) => void;
  onSendWhatsApp: (contactName: string, text: string) => void;
  onSimulateIncomingCall: () => void;
  onSimulateBatteryLow: () => void;
  flashlightOn: boolean;
  onToggleFlashlight: () => void;
  speechRate: number;
}

export const PhoneSimulatorPanel: React.FC<PhoneSimulatorProps> = ({
  apps,
  contacts,
  messages,
  onTriggerDownload,
  onTriggerCall,
  onSendWhatsApp,
  onSimulateIncomingCall,
  onSimulateBatteryLow,
  flashlightOn,
  onToggleFlashlight,
  speechRate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'playstore' | 'calls' | 'whatsapp' | 'system'>('playstore');
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[1]); // Sarah
  const [composeText, setComposeText] = useState('');

  const handleSendWA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeText.trim()) return;
    onSendWhatsApp(selectedContact.name, composeText.trim());
    setComposeText('');
  };

  return (
    <div className="space-y-6" role="region" aria-label="Phone Autonomous Control Hub">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        <button
          onClick={() => {
            sounds.playClick();
            haptics.tap();
            setActiveSubTab('playstore');
            speech.speak('Google Play Store autonomous downloads', { rate: speechRate });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
            activeSubTab === 'playstore'
              ? 'bg-yellow-400 text-black shadow-md'
              : 'bg-zinc-900 text-zinc-300 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Play Store Downloads</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            haptics.tap();
            setActiveSubTab('whatsapp');
            speech.speak('WhatsApp autonomous messaging', { rate: speechRate });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
            activeSubTab === 'whatsapp'
              ? 'bg-yellow-400 text-black shadow-md'
              : 'bg-zinc-900 text-zinc-300 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Control</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            haptics.tap();
            setActiveSubTab('calls');
            speech.speak('Phone cellular calls', { rate: speechRate });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
            activeSubTab === 'calls'
              ? 'bg-yellow-400 text-black shadow-md'
              : 'bg-zinc-900 text-zinc-300 hover:text-white'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Phone Dialer</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            haptics.tap();
            setActiveSubTab('system');
            speech.speak('Phone system utilities and sensors', { rate: speechRate });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
            activeSubTab === 'system'
              ? 'bg-yellow-400 text-black shadow-md'
              : 'bg-zinc-900 text-zinc-300 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>System Utilities</span>
        </button>
      </div>

      {/* 1. Play Store Tab */}
      {activeSubTab === 'playstore' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Google Play Store Autopilot</h3>
              <p className="text-xs text-zinc-400">
                Say: &ldquo;Download Spotify&rdquo; or &ldquo;Install Audible&rdquo; and Bri will handle everything autonomously.
              </p>
            </div>
            <span className="text-xs text-yellow-400 font-mono bg-yellow-400/10 border border-yellow-400/40 px-2.5 py-1 rounded-lg">
              VOICE AUTOPILOT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shrink-0">
                    {app.icon}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{app.name}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-1">{app.description}</p>
                    <span className="text-[11px] text-zinc-500 font-mono">{app.size} · ★ {app.rating}</span>
                  </div>
                </div>

                <button
                  onClick={() => onTriggerDownload(app)}
                  className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all ${
                    app.isInstalled
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700'
                      : 'bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95 shadow-md shadow-yellow-400/20'
                  }`}
                  aria-label={`${app.isInstalled ? 'Open' : 'Autonomous Download'} ${app.name}`}
                >
                  {app.isInstalled ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>OPEN</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>INSTALL</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. WhatsApp Tab */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Autonomous WhatsApp Engine</h3>
              <p className="text-xs text-zinc-400">
                Say: &ldquo;Send WhatsApp message to Sarah saying I am on my way&rdquo; or &ldquo;Read my messages&rdquo;.
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playSonarPing();
                const latest = messages[messages.length - 1];
                speech.speak(`You have a message from ${latest.contactName}: "${latest.text}"`, { rate: speechRate });
              }}
              className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400 px-3 py-1.5 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors"
            >
              Read Messages Aloud
            </button>
          </div>

          {/* Quick Contact Picker */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {contacts.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  sounds.playClick();
                  haptics.tap();
                  setSelectedContact(c);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border ${
                  selectedContact.id === c.id
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: c.avatarColor }}
                />
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Message Thread Preview */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 max-h-64 overflow-y-auto">
            {messages
              .filter((m) => m.contactName.toLowerCase() === selectedContact.name.toLowerCase() || m.sender === 'user')
              .map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                      m.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="text-[10px] text-zinc-400 mt-1 block text-right font-mono">
                      {m.timestamp} {m.sender === 'user' ? '✓✓' : ''}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Compose Form */}
          <form onSubmit={handleSendWA} className="flex gap-2">
            <input
              type="text"
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder={`Send message to ${selectedContact.name}...`}
              className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-yellow-400 text-black font-extrabold rounded-xl text-sm flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* 3. Phone Calls Tab */}
      {activeSubTab === 'calls' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">Autonomous Phone Calls</h3>
              <p className="text-xs text-zinc-400">
                Say: &ldquo;Call Mom&rdquo; or &ldquo;Call Dr. Adams on speakerphone&rdquo;.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSimulateIncomingCall}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform shadow-md shadow-yellow-400/20"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Simulate Incoming Call (John Doe)</span>
              </button>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg hidden sm:inline">
                CELLULAR LINK
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-black text-black text-base shrink-0"
                    style={{ backgroundColor: contact.avatarColor }}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{contact.name}</h4>
                    <p className="text-xs text-zinc-400 font-mono">{contact.phoneNumber}</p>
                    <span className="text-[10px] text-yellow-400 font-semibold">{contact.relationship}</span>
                  </div>
                </div>

                <button
                  onClick={() => onTriggerCall(contact)}
                  className="p-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl active:scale-95 transition-transform"
                  aria-label={`Call ${contact.name}`}
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. System Utilities Tab */}
      {activeSubTab === 'system' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Phone Hardware & Utilities</h3>
              <p className="text-xs text-zinc-400">
                Bri controls the phone hardware directly for accessibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Flashlight */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase">Flashlight</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${flashlightOn ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  {flashlightOn ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="py-2">
                <button
                  onClick={onToggleFlashlight}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 ${
                    flashlightOn ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{flashlightOn ? 'Turn Flashlight OFF' : 'Turn Flashlight ON'}</span>
                </button>
              </div>
            </div>

            {/* Battery */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase">Battery Level</span>
                <span className="text-xs font-mono font-bold text-emerald-400">92%</span>
              </div>
              <div className="space-y-1.5 py-1">
                <button
                  onClick={() => {
                    sounds.playSonarPing();
                    speech.speak('Your phone battery is at 92%, healthy, discharging normally.', { rate: speechRate });
                  }}
                  className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center gap-2"
                >
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <span>Announce Battery Aloud</span>
                </button>
                <button
                  onClick={onSimulateBatteryLow}
                  className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span>Simulate Low Battery (15%)</span>
                </button>
              </div>
            </div>

            {/* Time / Clock */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase">Current Time</span>
                <span className="text-xs font-mono font-bold text-yellow-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="py-2">
                <button
                  onClick={() => {
                    sounds.playSonarPing();
                    const now = new Date();
                    const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    speech.speak(`It is currently ${timeString}.`, { rate: speechRate });
                  }}
                  className="w-full py-3 rounded-xl font-extrabold text-xs bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>Announce Time Aloud</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
