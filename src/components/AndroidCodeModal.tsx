import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  Sparkles,
  Ghost,
  ShieldCheck,
  Eye,
  Smartphone,
  Cpu,
  Layers,
  Power,
  Zap,
} from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { haptics } from '../services/haptics';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDrawables?: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({
  isOpen,
  onClose,
  onOpenDrawables,
}) => {
  const [activeTab, setActiveTab] = useState<
    'takeover' | 'manifest' | 'accessibility' | 'assistant' | 'overlay' | 'xml'
  >('takeover');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.brie.assistant">

    <!-- 1. Voice, Audio & Tactile Hardware -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />

    <!-- 2. Background Persistence & Continuous Listening -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <!-- 3. System Overlay & Screen Draw-Over -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/brie_active"
        android:label="Brie"
        android:roundIcon="@drawable/brie_active"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- 1. Autonomous Accessibility Service -->
        <service
            android:name=".BrieAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:label="Brie Autonomous Blind Assistant"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- 2. Default Digital Assistant System Service -->
        <service
            android:name=".BrieVoiceInteractionService"
            android:permission="android.permission.BIND_VOICE_INTERACTION"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.voice.VoiceInteractionService" />
            </intent-filter>
            <meta-data
                android:name="android.voice_interaction_service"
                android:resource="@xml/voice_interaction_service.xml" />
        </service>

        <service
            android:name=".BrieVoiceSessionService"
            android:permission="android.permission.BIND_VOICE_INTERACTION"
            android:exported="true" />

        <service
            android:name=".BrieRecognitionService"
            android:exported="true">
            <intent-filter>
                <action android:name="android.speech.RecognitionService" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </service>

        <!-- 3. Background Continuous Ghost Voice Service -->
        <service
            android:name=".BrieService"
            android:exported="false"
            android:foregroundServiceType="microphone" />

        <!-- 4. Phone Boot Auto-Start Receiver -->
        <receiver
            android:name=".BootReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`;

  const accessibilityKt = `package com.brie.assistant

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.os.Bundle
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * BrieAccessibilityService - Autonomous Screen Reader & OS Action Engine
 *
 * Operates third-party apps for blind users:
 * - Reads all screen text non-visually.
 * - Clicks buttons by text (e.g., "Send", "Install", "Transfer").
 * - Types text into search and input fields.
 * - Performs system gestures: Home, Back, Recents, Notifications.
 */
class BrieAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d("BrieAccessibility", "Brie Accessibility Service Connected.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Intercepts window state changes and notifications
    }

    override fun onInterrupt() {}

    fun dumpScreenText(): List<String> {
        val rootNode = rootInActiveWindow ?: return emptyList()
        val textList = mutableListOf<String>()
        collectText(rootNode, textList)
        return textList
    }

    private fun collectText(node: AccessibilityNodeInfo, list: MutableList<String>) {
        val text = node.text?.toString() ?: node.contentDescription?.toString()
        if (!text.isNullOrBlank()) list.add(text.trim())
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            collectText(child, list)
        }
    }

    fun clickElementByText(text: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val nodes = rootNode.findAccessibilityNodeInfosByText(text)
        for (node in nodes) {
            if (node.isClickable) return node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            var p = node.parent
            while (p != null) {
                if (p.isClickable) return p.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                p = p.parent
            }
        }
        return false
    }

    fun setTextIntoField(text: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val focused = rootNode.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)
        if (focused != null && focused.isEditable) {
            val args = Bundle()
            args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
            return focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
        }
        return false
    }

    fun performGoHome(): Boolean = performGlobalAction(GLOBAL_ACTION_HOME)
    fun performGoBack(): Boolean = performGlobalAction(GLOBAL_ACTION_BACK)
}`;

  const assistantKt = `package com.brie.assistant

import android.os.Bundle
import android.service.voice.VoiceInteractionService
import android.service.voice.VoiceInteractionSession
import android.service.voice.VoiceInteractionSessionService
import android.util.Log

/**
 * BrieVoiceInteractionService - Default Digital Assistant
 * Replaces Google Assistant / Gemini / Bixby at the OS level.
 */
class BrieVoiceInteractionService : VoiceInteractionService() {
    override fun onReady() {
        super.onReady()
        Log.d("BrieVoiceService", "Brie Registered as Default Digital Assistant.")
    }
}

class BrieVoiceSessionService : VoiceInteractionSessionService() {
    override fun onNewSession(args: Bundle?): VoiceInteractionSession {
        return object : VoiceInteractionSession(this) {
            override fun onShow(args: Bundle?, showFlags: Int) {
                super.onShow(args, showFlags)
                MainActivity.instance?.startListening()
            }
        }
    }
}`;

  const overlayKt = `package com.brie.assistant

import android.content.Context
import android.graphics.PixelFormat
import android.os.Build
import android.view.Gravity
import android.view.WindowManager
import android.widget.ImageView

/**
 * BrieOverlayManager - Floating System Overlay (SYSTEM_ALERT_WINDOW)
 * Draws the friendly green ghost over any app (WhatsApp, Calls, Browser).
 */
class BrieOverlayManager(private val context: Context) {
    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var overlayView: ImageView? = null

    fun showFloatingGhost(onClicked: () -> Unit) {
        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 30
            y = 120
        }
        val ghost = ImageView(context).apply {
            setImageResource(R.drawable.brie_active)
            setOnClickListener { onClicked() }
        }
        overlayView = ghost
        windowManager.addView(ghost, params)
    }

    fun hideFloatingGhost() {
        overlayView?.let { windowManager.removeView(it); overlayView = null }
    }
}`;

  const activityMainXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="#000000"
    android:padding="24dp">

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

    <Button
        android:id="@+id/btnActivate"
        android:layout_width="match_parent"
        android:layout_height="180dp"
        android:layout_marginTop="48dp"
        android:text="ACTIVATE"
        android:textSize="36sp"
        android:textStyle="bold"
        android:textColor="#000000"
        android:backgroundTint="#00FF88" />

    <Button
        android:id="@+id/btnDeactivate"
        android:layout_width="match_parent"
        android:layout_height="180dp"
        android:layout_marginTop="20dp"
        android:text="DEACTIVATE"
        android:textSize="36sp"
        android:textStyle="bold"
        android:textColor="#FFFFFF"
        android:backgroundTint="#330000" />
</LinearLayout>`;

  const getCode = () => {
    switch (activeTab) {
      case 'manifest':
        return manifestXml;
      case 'accessibility':
        return accessibilityKt;
      case 'assistant':
        return assistantKt;
      case 'overlay':
        return overlayKt;
      case 'xml':
        return activityMainXml;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    sounds.playClick();
    haptics.tap();
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00FF88]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">
                Part 1: Android System Takeover Engine
              </h2>
              <p className="text-xs text-zinc-400">
                Full OS-level permissions for autonomous phone operation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-3 px-6 border-b border-white/10 bg-black/40 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('takeover')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'takeover'
                ? 'bg-[#00FF88] text-black shadow-lg shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Overview & Takeover Status
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'manifest'
                ? 'bg-[#00FF88] text-black shadow-lg shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            AndroidManifest.xml
          </button>

          <button
            onClick={() => setActiveTab('accessibility')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'accessibility'
                ? 'bg-[#00FF88] text-black shadow-lg shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            BrieAccessibilityService.kt
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-[#00FF88] text-black shadow-lg shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            VoiceAssistant.kt
          </button>

          <button
            onClick={() => setActiveTab('overlay')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'overlay'
                ? 'bg-[#00FF88] text-black shadow-lg shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            OverlayManager.kt
          </button>

          <button
            onClick={() => setActiveTab('xml')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'xml'
                ? 'bg-[#00FF88] text-black shadow-lg shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            activity_main.xml
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'takeover' ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-[#00FF88] font-black text-sm uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  All Part 1 System Layers Installed in Codebase
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Brie is now fully architected with all Android system services required to take
                  over the phone autonomously. Each permission and service has been defined in{' '}
                  <code className="text-[#00FF88]">AndroidManifest.xml</code>,{' '}
                  <code className="text-[#00FF88]">BrieAccessibilityService.kt</code>,{' '}
                  <code className="text-[#00FF88]">BrieVoiceInteractionService.kt</code>, and{' '}
                  <code className="text-[#00FF88]">BrieOverlayManager.kt</code>.
                </p>
              </div>

              {/* 5 Takeover System Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <Eye className="w-4 h-4" />
                    1. Accessibility Service
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Inspects screen content, reads UI elements aloud to blind users, taps buttons
                    autonomously in other apps (e.g., WhatsApp, MTN MoMo, dialer), and types text.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                    ✓ BIND_ACCESSIBILITY_SERVICE
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Power className="w-4 h-4" />
                    2. Default Digital Assistant
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Replaces Google Assistant / Gemini. Allows summoning Brie with power-button
                    long-press, assistant hardware gesture, or lock screen wake word.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                    ✓ BIND_VOICE_INTERACTION
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-pink-300 font-bold text-sm">
                    <Layers className="w-4 h-4" />
                    3. System Alert Window Overlay
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Draws over other apps. The friendly neon green ghost and transient Siri pill
                    float on top of any active app or phone call.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                    ✓ SYSTEM_ALERT_WINDOW
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    4. Background 24/7 & Boot Receiver
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Auto-starts when phone is turned on or rebooted. Exempted from battery manager
                    sleep so she never dies in background.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                    ✓ RECEIVE_BOOT_COMPLETED & WAKE_LOCK
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-mono text-zinc-400">
                  {activeTab === 'manifest'
                    ? 'android/app/src/main/AndroidManifest.xml'
                    : activeTab === 'accessibility'
                    ? 'android/app/src/main/java/com/brie/assistant/BrieAccessibilityService.kt'
                    : activeTab === 'assistant'
                    ? 'android/app/src/main/java/com/brie/assistant/BrieVoiceInteractionService.kt'
                    : activeTab === 'overlay'
                    ? 'android/app/src/main/java/com/brie/assistant/BrieOverlayManager.kt'
                    : 'android/app/src/main/res/layout/activity_main.xml'}
                </span>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#00FF88]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                {getCode()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-zinc-900/60 backdrop-blur-xl flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            All files are synced in the project's <code className="text-[#00FF88]">android/</code>{' '}
            directory.
          </p>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
