import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  Check,
  RotateCcw,
  Sparkles,
  Ghost,
  Image as ImageIcon,
  FileCode,
  Eye,
  Sliders,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';

export interface DrawableAssets {
  activeUrl: string | null;
  activeXml?: string | null;
  sleepUrl: string | null;
  sleepXml?: string | null;
}

interface DrawableManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawables: DrawableAssets;
  onUpdateDrawables: (newDrawables: DrawableAssets) => void;
  isBrieActive: boolean;
  onToggleActiveState: (active: boolean) => void;
}

// Default Built-in XML Vectors for Android
export const DEFAULT_ACTIVE_XML = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="120dp"
    android:height="120dp"
    android:viewportWidth="120"
    android:viewportHeight="120">
    <!-- Glowing Green Active Indicator -->
    <path
        android:fillColor="#3310B981"
        android:pathData="M60,60m-58,0a58,58 0,1 1,116 0a58,58 0,1 1,-116 0" />
    <path
        android:fillColor="#6610B981"
        android:pathData="M60,60m-46,0a46,46 0,1 1,92 0a46,46 0,1 1,-92 0" />
    <path
        android:fillColor="#FF10B981"
        android:pathData="M60,60m-34,0a34,34 0,1 1,68 0a34,34 0,1 1,-68 0" />
    <path
        android:fillColor="#FFD1FAE5"
        android:pathData="M52,48m-8,0a8,8 0,1 1,16 0a8,8 0,1 1,-16 0" />
</vector>`;

export const DEFAULT_SLEEP_XML = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="120dp"
    android:height="120dp"
    android:viewportWidth="120"
    android:viewportHeight="120">
    <!-- Sleeping Grey Ghost Indicator -->
    <path
        android:fillColor="#1A71717A"
        android:pathData="M60,60m-58,0a58,58 0,1 1,116 0a58,58 0,1 1,-116 0" />
    <path
        android:fillColor="#FF52525B"
        android:pathData="M60,60m-34,0a34,34 0,1 1,68 0a34,34 0,1 1,-68 0" />
    <path
        android:strokeColor="#FFA1A1AA"
        android:strokeWidth="3"
        android:strokeLineCap="round"
        android:pathData="M48,58 Q53,62 58,58" />
    <path
        android:strokeColor="#FFA1A1AA"
        android:strokeWidth="3"
        android:strokeLineCap="round"
        android:pathData="M62,58 Q67,62 72,58" />
</vector>`;

export const DrawableManagerModal: React.FC<DrawableManagerModalProps> = ({
  isOpen,
  onClose,
  drawables,
  onUpdateDrawables,
  isBrieActive,
  onToggleActiveState,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'xml' | 'presets'>('upload');
  const [activeUploadSuccess, setActiveUploadSuccess] = useState(false);
  const [sleepUploadSuccess, setSleepUploadSuccess] = useState(false);

  const activeInputRef = useRef<HTMLInputElement>(null);
  const sleepInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file uploads (PNG, SVG, JPG, XML)
  const handleFileUpload = (file: File, type: 'active' | 'sleep') => {
    sounds.playSuccess();
    haptics.success();

    if (file.name.endsWith('.xml')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const xmlText = e.target?.result as string;
        if (type === 'active') {
          onUpdateDrawables({ ...drawables, activeXml: xmlText });
          setActiveUploadSuccess(true);
          setTimeout(() => setActiveUploadSuccess(false), 3000);
        } else {
          onUpdateDrawables({ ...drawables, sleepXml: xmlText });
          setSleepUploadSuccess(true);
          setTimeout(() => setSleepUploadSuccess(false), 3000);
        }
      };
      reader.readAsText(file);
    } else {
      // Image file (PNG, SVG, JPG, etc.)
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (type === 'active') {
          onUpdateDrawables({ ...drawables, activeUrl: dataUrl });
          setActiveUploadSuccess(true);
          setTimeout(() => setActiveUploadSuccess(false), 3000);
        } else {
          onUpdateDrawables({ ...drawables, sleepUrl: dataUrl });
          setSleepUploadSuccess(true);
          setTimeout(() => setSleepUploadSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDrawables = () => {
    sounds.playClick();
    haptics.tap();
    onUpdateDrawables({
      activeUrl: null,
      activeXml: DEFAULT_ACTIVE_XML,
      sleepUrl: null,
      sleepXml: DEFAULT_SLEEP_XML,
    });
  };

  const downloadFile = (filename: string, content: string, mimeType = 'text/plain') => {
    sounds.playClick();
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawable-modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-950 border-2 border-yellow-400 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="drawable-modal-title" className="text-lg font-black text-white flex items-center gap-2">
                <span>Android Drawable Manager</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold uppercase tracking-wider">
                  brie_active &amp; brie_sleep
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Upload custom icons or vector XMLs for your Android app and live preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Simulator Status Bar */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Simulated State:</span>
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => {
                  sounds.playSuccess();
                  haptics.tap();
                  onToggleActiveState(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  isBrieActive
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Active (brie_active)</span>
              </button>
              <button
                onClick={() => {
                  sounds.playEarconStop();
                  haptics.tap();
                  onToggleActiveState(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  !isBrieActive
                    ? 'bg-zinc-700 text-zinc-100 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Ghost className="w-3.5 h-3.5" />
                <span>Sleep (brie_sleep)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDrawables}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold transition-transform active:scale-95"
              title="Reset drawables to default glowing vectors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 px-5 bg-black/40">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Images &amp; SVGs</span>
          </button>

          <button
            onClick={() => setActiveTab('xml')}
            className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'xml'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Android Vector XML Code</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pre-Made Orb Themes</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/50">
          {activeTab === 'upload' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: brie_active */}
              <div
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isBrieActive
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-zinc-800 bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                      <h3 className="font-extrabold text-base text-white">brie_active</h3>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      res/drawable/brie_active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                    Displayed when Brie is awake and listening. By default, a glowing emerald green orb.
                  </p>

                  {/* Preview Area */}
                  <div className="h-44 rounded-xl bg-black/70 border border-emerald-500/30 flex items-center justify-center p-4 relative overflow-hidden mb-4">
                    {drawables.activeUrl ? (
                      <img
                        src={drawables.activeUrl}
                        alt="Custom brie_active preview"
                        className="max-h-36 max-w-36 object-contain animate-pulse filter drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      />
                    ) : (
                      <div className="relative flex items-center justify-center">
                        <div className="w-28 h-28 rounded-full bg-emerald-500/20 blur-xl absolute" />
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-green-300 p-1 flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-pulse">
                          <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-emerald-400 animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="file"
                    ref={activeInputRef}
                    accept="image/*,.xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'active');
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => activeInputRef.current?.click()}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{activeUploadSuccess ? 'Uploaded Successfully!' : 'Upload brie_active (PNG/SVG/XML)'}</span>
                    </button>
                    {drawables.activeUrl && (
                      <button
                        onClick={() => downloadFile('brie_active.png', drawables.activeUrl || '')}
                        className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                        title="Download uploaded image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 text-center">
                    Accepts PNG, SVG, JPG, or Android Vector XML (.xml)
                  </p>
                </div>
              </div>

              {/* Card 2: brie_sleep */}
              <div
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  !isBrieActive
                    ? 'border-zinc-400 bg-zinc-900 shadow-lg shadow-white/5'
                    : 'border-zinc-800 bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-zinc-500" />
                      <h3 className="font-extrabold text-base text-white">brie_sleep</h3>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                      res/drawable/brie_sleep
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                    Displayed when user says &ldquo;Brie sleep&rdquo; or leaves the phone. Inactive sleeping ghost icon.
                  </p>

                  {/* Preview Area */}
                  <div className="h-44 rounded-xl bg-black/70 border border-zinc-700/40 flex items-center justify-center p-4 relative overflow-hidden mb-4">
                    {drawables.sleepUrl ? (
                      <img
                        src={drawables.sleepUrl}
                        alt="Custom brie_sleep preview"
                        className="max-h-36 max-w-36 object-contain opacity-70 filter grayscale"
                      />
                    ) : (
                      <div className="relative flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center shadow-inner">
                          <Ghost className="w-10 h-10 text-zinc-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="file"
                    ref={sleepInputRef}
                    accept="image/*,.xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'sleep');
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => sleepInputRef.current?.click()}
                      className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 border border-zinc-600"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{sleepUploadSuccess ? 'Uploaded Successfully!' : 'Upload brie_sleep (PNG/SVG/XML)'}</span>
                    </button>
                    {drawables.sleepUrl && (
                      <button
                        onClick={() => downloadFile('brie_sleep.png', drawables.sleepUrl || '')}
                        className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                        title="Download uploaded image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 text-center">
                    Accepts PNG, SVG, JPG, or Android Vector XML (.xml)
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'xml' && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
                    <FileCode className="w-4 h-4" />
                    <span>brie_active.xml (Vector Code)</span>
                  </div>
                  <button
                    onClick={() => downloadFile('brie_active.xml', drawables.activeXml || DEFAULT_ACTIVE_XML, 'text/xml')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-lg active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download XML</span>
                  </button>
                </div>
                <textarea
                  value={drawables.activeXml || DEFAULT_ACTIVE_XML}
                  onChange={(e) => onUpdateDrawables({ ...drawables, activeXml: e.target.value })}
                  rows={8}
                  className="w-full bg-black/80 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-emerald-500/30 focus:outline-none focus:border-emerald-400 leading-relaxed"
                />
              </div>

              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-wider">
                    <FileCode className="w-4 h-4" />
                    <span>brie_sleep.xml (Vector Code)</span>
                  </div>
                  <button
                    onClick={() => downloadFile('brie_sleep.xml', drawables.sleepXml || DEFAULT_SLEEP_XML, 'text/xml')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs rounded-lg active:scale-95 border border-zinc-600"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download XML</span>
                  </button>
                </div>
                <textarea
                  value={drawables.sleepXml || DEFAULT_SLEEP_XML}
                  onChange={(e) => onUpdateDrawables({ ...drawables, sleepXml: e.target.value })}
                  rows={8}
                  className="w-full bg-black/80 text-zinc-300 font-mono text-xs p-3 rounded-xl border border-zinc-700 focus:outline-none focus:border-zinc-400 leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-300">
                Choose one of the handcrafted visual themes for your active and sleep drawables:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preset 1 */}
                <div
                  onClick={() => {
                    sounds.playSuccess();
                    haptics.tap();
                    onUpdateDrawables({
                      activeUrl: null,
                      activeXml: DEFAULT_ACTIVE_XML,
                      sleepUrl: null,
                      sleepXml: DEFAULT_SLEEP_XML,
                    });
                  }}
                  className="p-4 rounded-2xl border border-emerald-500/40 bg-zinc-900/80 hover:bg-zinc-900 cursor-pointer flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Default Emerald &amp; Ghost Grey</h4>
                      <p className="text-xs text-zinc-400">Standard Brie companion colors</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-yellow-400">Apply</span>
                </div>

                {/* Preset 2 */}
                <div
                  onClick={() => {
                    sounds.playSuccess();
                    haptics.tap();
                    onUpdateDrawables({
                      activeUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
                      activeXml: DEFAULT_ACTIVE_XML,
                      sleepUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&auto=format&fit=crop&q=60',
                      sleepXml: DEFAULT_SLEEP_XML,
                    });
                  }}
                  className="p-4 rounded-2xl border border-cyan-500/40 bg-zinc-900/80 hover:bg-zinc-900 cursor-pointer flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Brie Iridescent Glass</h4>
                      <p className="text-xs text-zinc-400">Cyan plasma chromatic orb</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-yellow-400">Apply</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            Path: <span className="font-mono text-yellow-400">/android/app/src/main/res/drawable/</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs transition-transform active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
