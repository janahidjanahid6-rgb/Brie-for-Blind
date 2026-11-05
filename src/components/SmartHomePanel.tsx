import React from 'react';
import { SmartHomeState } from '../types';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';
import { speech } from '../services/speech';
import {
  Lightbulb,
  Thermometer,
  Lock,
  Unlock,
  Blinds,
  RefreshCw,
  Home,
  Music,
  Play,
  Pause,
  Plus,
  Minus,
} from 'lucide-react';

interface SmartHomePanelProps {
  smartHome: SmartHomeState;
  onUpdateSmartHome: (updater: (prev: SmartHomeState) => SmartHomeState) => void;
  onOpenSetupWizard: () => void;
  speechRate: number;
}

export const SmartHomePanel: React.FC<SmartHomePanelProps> = ({
  smartHome,
  onUpdateSmartHome,
  onOpenSetupWizard,
  speechRate,
}) => {
  const toggleLight = (id: string) => {
    sounds.playClick();
    haptics.tap();
    onUpdateSmartHome((prev) => {
      const lights = prev.lights.map((l) => {
        if (l.id === id) {
          const nextState = !l.isOn;
          speech.speak(
            nextState
              ? `You got it, turning on the ${l.name}.`
              : `Done, turning off the ${l.name}.`,
            { rate: speechRate }
          );
          return { ...l, isOn: nextState };
        }
        return l;
      });
      return { ...prev, lights };
    });
  };

  const changeBrightness = (id: string, brightness: number) => {
    onUpdateSmartHome((prev) => {
      const lights = prev.lights.map((l) => (l.id === id ? { ...l, brightness } : l));
      return { ...prev, lights };
    });
  };

  const changeTemp = (delta: number) => {
    sounds.playClick();
    haptics.tap();
    onUpdateSmartHome((prev) => {
      const nextTemp = Math.max(60, Math.min(85, prev.thermostat.targetTemp + delta));
      speech.speak(`Got it! Adjusting the thermostat to ${nextTemp} degrees.`, { rate: speechRate });
      return {
        ...prev,
        thermostat: { ...prev.thermostat, targetTemp: nextTemp },
      };
    });
  };

  const toggleLock = (id: string) => {
    sounds.playSuccess();
    haptics.success();
    onUpdateSmartHome((prev) => {
      const locks = prev.locks.map((lk) => {
        if (lk.id === id) {
          const nextLocked = !lk.isLocked;
          speech.speak(
            nextLocked
              ? `All locked up! ${lk.name} is now secure.`
              : `Unlocked ${lk.name} for you.`,
            {
              rate: speechRate,
            }
          );
          return { ...lk, isLocked: nextLocked };
        }
        return lk;
      });
      return { ...prev, locks };
    });
  };

  const toggleVacuum = () => {
    sounds.playClick();
    haptics.tap();
    onUpdateSmartHome((prev) => {
      const isCleaning = prev.vacuum.status === 'cleaning';
      const nextStatus = isCleaning ? 'returning' : 'cleaning';
      speech.speak(
        isCleaning
          ? 'Sending the vacuum back to its charging dock now.'
          : 'Starting up the vacuum to give the living room a good clean.',
        { rate: speechRate }
      );
      return {
        ...prev,
        vacuum: {
          ...prev.vacuum,
          status: nextStatus,
          currentRoom: isCleaning ? 'Returning to Dock' : 'Living Room',
        },
      };
    });
  };

  const toggleBlinds = (id: string) => {
    sounds.playClick();
    haptics.tap();
    onUpdateSmartHome((prev) => {
      const blinds = prev.blinds.map((b) => {
        if (b.id === id) {
          const nextPct = b.openPercentage > 0 ? 0 : 100;
          speech.speak(
            nextPct === 0
              ? 'Closing the blinds for privacy.'
              : 'Opening up the blinds to let in some nice natural light.',
            {
              rate: speechRate,
            }
          );
          return { ...b, openPercentage: nextPct };
        }
        return b;
      });
      return { ...prev, blinds };
    });
  };

  const toggleSpeaker = () => {
    sounds.playClick();
    haptics.tap();
    onUpdateSmartHome((prev) => {
      const nextPlaying = !prev.speaker.isPlaying;
      speech.speak(
        nextPlaying
          ? 'Playing some relaxing acoustic music for you.'
          : 'Paused the music.',
        { rate: speechRate }
      );
      return {
        ...prev,
        speaker: { ...prev.speaker, isPlaying: nextPlaying },
      };
    });
  };

  return (
    <div className="space-y-6" role="region" aria-label="Smart Home Control Devices">
      {/* Top Header with Ecosystem Guided Setup Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-black text-white">Smart Home Ecosystems</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSetupWizard}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform shadow-md shadow-yellow-400/20"
          >
            <span>+ Link Google, Alexa, Apple</span>
          </button>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            {smartHome.lights.filter((l) => l.isOn).length} lights on
          </span>
        </div>
      </div>

      {/* Connected Ecosystems Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {smartHome.ecosystems.map((eco) => (
          <div
            key={eco.id}
            onClick={onOpenSetupWizard}
            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
              eco.isConnected
                ? 'bg-zinc-900 border-zinc-700 hover:border-yellow-400'
                : 'bg-zinc-950 border-zinc-800 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-white">{eco.brand}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  eco.isConnected ? 'bg-emerald-400' : 'bg-zinc-600'
                }`}
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              {eco.isConnected ? `${eco.deviceCount} synced` : 'Not connected'}
            </p>
          </div>
        ))}
      </div>

      {/* Grid of Smart Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thermostat Card */}
        <div className="p-5 bg-zinc-900 border-2 border-zinc-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Climate Thermostat</h3>
                <p className="text-xs text-zinc-400">Indoor Temp: {smartHome.thermostat.currentTemp}°F · {smartHome.thermostat.humidity}% Humidity</p>
              </div>
            </div>
            <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded bg-orange-500/20 text-orange-400">
              {smartHome.thermostat.mode}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="text-4xl font-black text-yellow-400 font-mono tabular-nums">
              {smartHome.thermostat.targetTemp}°F
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeTemp(-1)}
                className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white flex items-center justify-center border border-zinc-700"
                aria-label="Decrease Thermostat Temperature"
              >
                <Minus className="w-6 h-6" />
              </button>
              <button
                onClick={() => changeTemp(1)}
                className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white flex items-center justify-center border border-zinc-700"
                aria-label="Increase Thermostat Temperature"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Robot Vacuum Card */}
        <div className="p-5 bg-zinc-900 border-2 border-zinc-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <RefreshCw className={`w-5 h-5 ${smartHome.vacuum.status === 'cleaning' ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Robot Vacuum</h3>
                <p className="text-xs text-zinc-400">Battery: {smartHome.vacuum.batteryLevel}% · Location: {smartHome.vacuum.currentRoom}</p>
              </div>
            </div>
            <span className={`text-xs uppercase font-extrabold px-2.5 py-1 rounded ${
              smartHome.vacuum.status === 'cleaning'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {smartHome.vacuum.status}
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={toggleVacuum}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 active:scale-98 transition-transform ${
                smartHome.vacuum.status === 'cleaning'
                  ? 'bg-amber-500 text-black border-amber-300'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{smartHome.vacuum.status === 'cleaning' ? 'Send Vacuum Home to Dock' : 'Start Vacuuming Clean'}</span>
            </button>
          </div>
        </div>

        {/* Smart Locks */}
        <div className="p-5 bg-zinc-900 border-2 border-zinc-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Security Door Locks</h3>
              <p className="text-xs text-zinc-400">Encrypted autonomous physical access</p>
            </div>
          </div>

          <div className="space-y-2">
            {smartHome.locks.map((lk) => (
              <div
                key={lk.id}
                className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl"
              >
                <div>
                  <p className="font-bold text-sm text-white">{lk.name}</p>
                  <p className="text-xs text-zinc-400">Battery: {lk.batteryLevel}%</p>
                </div>
                <button
                  onClick={() => toggleLock(lk.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-extrabold text-xs border active:scale-95 transition-transform ${
                    lk.isLocked
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-red-500/20 text-red-300 border-red-500'
                  }`}
                  aria-label={`Toggle ${lk.name}`}
                >
                  {lk.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{lk.isLocked ? 'SECURE LOCKED' : 'UNLOCKED'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Audio / Speaker */}
        <div className="p-5 bg-zinc-900 border-2 border-zinc-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Smart Audio Speaker</h3>
                <p className="text-xs text-zinc-400">{smartHome.speaker.artist}</p>
              </div>
            </div>
            <button
              onClick={toggleSpeaker}
              className="p-3 bg-yellow-400 text-black rounded-xl font-bold active:scale-95"
              aria-label={smartHome.speaker.isPlaying ? 'Pause Audio' : 'Play Audio'}
            >
              {smartHome.speaker.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300">
            <span className="font-bold text-yellow-300">Now Playing: </span>
            {smartHome.speaker.currentTrack}
          </div>
        </div>
      </div>

      {/* Lighting Section */}
      <div className="p-5 bg-zinc-900 border-2 border-zinc-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-400/20 text-yellow-400 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-white text-base">Smart Lighting Network</h3>
          </div>
          <span className="text-xs text-zinc-400">Voice command: &quot;Turn on living room lights&quot;</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {smartHome.lights.map((light) => (
            <div
              key={light.id}
              className={`p-4 rounded-xl border-2 transition-colors ${
                light.isOn
                  ? 'bg-zinc-800 border-yellow-400'
                  : 'bg-zinc-950 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-white">{light.name}</span>
                <button
                  onClick={() => toggleLight(light.id)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    light.isOn ? 'bg-yellow-400' : 'bg-zinc-700'
                  }`}
                  aria-label={`Toggle ${light.name}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform ${
                      light.isOn ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {light.isOn && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-zinc-400 font-mono">
                    <span>Brightness</span>
                    <span>{light.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={light.brightness}
                    onChange={(e) => changeBrightness(light.id, parseInt(e.target.value, 10))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
