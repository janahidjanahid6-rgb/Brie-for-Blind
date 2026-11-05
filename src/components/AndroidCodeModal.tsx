import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Sparkles, Ghost, Layout } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDrawables?: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose, onOpenDrawables }) => {
  const [activeTab, setActiveTab] = useState<'xml' | 'kt'>('xml');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activityMainXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="#000000"
    android:padding="24dp">

    <!-- TOP: ONLY 3 THINGS - ICON + BRIE -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical">

        <ImageView
            android:id="@+id/btnTapToSpeak"
            android:layout_width="64dp"
            android:layout_height="64dp"
            android:src="@drawable/brie_active"
            android:contentDescription="Tap to speak" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="BRIE"
            android:textColor="#FFFFFF"
            android:textSize="32sp"
            android:textStyle="bold"
            android:layout_marginStart="12dp" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="FOR BLIND"
            android:textColor="#FFFFFF"
            android:textSize="14sp"
            android:layout_marginStart="8dp" />

    </LinearLayout>

    <!-- MIDDLE: ACTIVATE ONLY -->
    <Button
        android:id="@+id/btnActivate"
        android:layout_width="match_parent"
        android:layout_height="180dp"
        android:layout_marginTop="48dp"
        android:text="ACTIVATE"
        android:textSize="36sp"
        android:textStyle="bold"
        android:textColor="#000000"
        android:backgroundTint="#00FF88"
        android:contentDescription="Activate Brie" />

    <!-- MIDDLE: DEACTIVATE ONLY -->
    <Button
        android:id="@+id/btnDeactivate"
        android:layout_width="match_parent"
        android:layout_height="180dp"
        android:layout_marginTop="20dp"
        android:text="DEACTIVATE"
        android:textSize="36sp"
        android:textStyle="bold"
        android:textColor="#FFFFFF"
        android:backgroundTint="#330000"
        android:contentDescription="Deactivate Brie" />

</LinearLayout>`;

  const kotlinVoiceSnippet = `// Add this to MainActivity.kt - VOICE ACTIVATION FOR BLIND

private lateinit var speechRecognizer: SpeechRecognizer
private val magicActivate = listOf("activate", "hey brie", "brie wake up", "wake up brie", "brie are you there", "brie activate")
private val magicDeactivate = listOf("deactivate", "brie sleep", "brie go to sleep", "brie leave", "brie deactivate", "brie go away", "leave my phone")

fun startListening() {
    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
    // Auto-detect Luganda, Swahili, English - Brie knows all
    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
    speechRecognizer.startListening(intent)
}

fun onVoiceResult(text: String) {
    val lower = text.lowercase()
    if (magicActivate.any { lower.contains(it) }) {
        // ACTIVATE BY VOICE
        activateBrieByVoice()
    }
    if (magicDeactivate.any { lower.contains(it) }) {
        // DEACTIVATE BY VOICE - GHOST LEAVE
        deactivateBrieByVoice()
    }
}

fun activateBrieByVoice() {
    tts.speak("I'm here friend! I woke up. What do you need?", TextToSpeech.QUEUE_FLUSH, null, null)
    // CHANGE ICON TO GLOWING GREEN ACTIVE
    findViewById<ImageView>(R.id.btnTapToSpeak)?.setImageResource(R.drawable.brie_active)
    // Start service
    startService(Intent(this, BrieService::class.java))
}

fun deactivateBrieByVoice() {
    tts.speak("Okay friend, I am leaving now like a ghost. Your phone is normal. Just say Hey Brie when you need me again.", TextToSpeech.QUEUE_FLUSH, null, null)
    // CHANGE ICON TO SLEEPING GREY
    findViewById<ImageView>(R.id.btnTapToSpeak)?.setImageResource(R.drawable.brie_sleep)
    // Stop service, stop listening - PHONE NORMAL
    speechRecognizer.stopListening()
    stopService(Intent(this, BrieService::class.java))
}`;

  const currentSnippet = activeTab === 'xml' ? activityMainXml : kotlinVoiceSnippet;
  const currentFileName = activeTab === 'xml' ? 'activity_main.xml' : 'MainActivity.kt';

  const handleCopy = () => {
    sounds.playSuccess();
    haptics.success();
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    sounds.playClick();
    const element = document.createElement('a');
    const file = new Blob([currentSnippet], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = currentFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border-2 border-yellow-400 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-title" className="text-lg font-black text-white">
                  Android Code &amp; Layout
                </h2>
                <div className="flex items-center bg-zinc-900 rounded-xl p-0.5 border border-zinc-700">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab('xml');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'xml'
                        ? 'bg-yellow-400 text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>activity_main.xml</span>
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab('kt');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'kt'
                        ? 'bg-yellow-400 text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>MainActivity.kt</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                {activeTab === 'xml'
                  ? 'High-contrast layout: BRIE FOR BLIND + Large ACTIVATE / DEACTIVATE'
                  : 'Voice-activation & Ghost leaving routine for blind users'}
              </p>
            </div>
          </div>
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

        {/* Highlight Banner */}
        <div className="p-4 bg-gradient-to-r from-yellow-400/10 via-amber-500/10 to-orange-500/10 border-b border-yellow-400/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-200">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>
              Target: <span className="font-mono text-white">/android/app/src/main/res/layout/{currentFileName}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenDrawables && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenDrawables();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-transform active:scale-95 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upload Drawables</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black transition-transform active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : `Copy ${activeTab === 'xml' ? 'XML' : 'Kotlin'}`}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-black transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-zinc-300 bg-black/60 space-y-4">
          <div className="p-4 bg-zinc-900/80 rounded-2xl border border-yellow-400/30">
            <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Ghost className="w-3.5 h-3.5" />
              <span>{activeTab === 'xml' ? 'activity_main.xml layout structure:' : 'Voice Activation & Ghost Deactivation Routine:'}</span>
            </div>
            <pre className="text-emerald-400 font-bold overflow-x-auto leading-relaxed">
{currentSnippet}
            </pre>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-sans">
              Key Blind-Friendly Behaviors Supported:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-zinc-300 font-sans">
              <li>
                <span className="font-bold text-yellow-400">Pure Voice Control:</span> User does not need to tap anything. Speaking &ldquo;Hey Brie&rdquo; activates; &ldquo;Brie sleep&rdquo; leaves like a ghost.
              </li>
              <li>
                <span className="font-bold text-yellow-400">High Contrast Layout:</span> Only 3 items at top (brie_active icon, BRIE, FOR BLIND) and 2 huge 180dp buttons for ACTIVATE (#00FF88) and DEACTIVATE (#330000).
              </li>
              <li>
                <span className="font-bold text-yellow-400">Full Audio &amp; Haptics:</span> Every state change is spoken out loud and confirmed with distinct tactile haptic patterns.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
