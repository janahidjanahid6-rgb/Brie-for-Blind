package com.brie.assistant

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
 * Enables full eyes-free phone operation for blind users:
 * 1. Screen Reading: Traverses UI nodes and reads content out loud.
 * 2. Autonomous Tap / Click: Clicks buttons by text or ID (e.g. WhatsApp Send, Play Store Install).
 * 3. Text Input: Fills search bars and message fields autonomously.
 * 4. System Gestures: Home, Back, Recents, Notifications.
 */
class BrieAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "BrieAccessibility"
        var instance: BrieAccessibilityService? = null
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.d(TAG, "Brie Accessibility Service Connected. Full phone takeover ready.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        // Intercept window or focus changes
        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                val packageName = event.packageName?.toString() ?: ""
                val className = event.className?.toString() ?: ""
                Log.d(TAG, "Window changed: $packageName / $className")
            }
            AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED -> {
                val notifText = event.text.joinToString(", ")
                Log.d(TAG, "Notification received: $notifText")
            }
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "Brie Accessibility Service Interrupted.")
    }

    override fun onDestroy() {
        instance = null
        super.onDestroy()
        Log.d(TAG, "Brie Accessibility Service Destroyed.")
    }

    // =========================================================================
    // AUTONOMOUS SCREEN ACTIONS FOR BLIND COMPANION
    // =========================================================================

    /**
     * Reads all visible text on the active screen non-visually.
     */
    fun dumpScreenText(): List<String> {
        val rootNode = rootInActiveWindow ?: return emptyList()
        val textList = mutableListOf<String>()
        collectText(rootNode, textList)
        return textList
    }

    private fun collectText(node: AccessibilityNodeInfo, list: MutableList<String>) {
        val text = node.text?.toString() ?: node.contentDescription?.toString()
        if (!text.isNullOrBlank()) {
            list.add(text.trim())
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            collectText(child, list)
        }
    }

    /**
     * Finds and clicks a button or UI element matching text.
     */
    fun clickElementByText(text: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val nodes = rootNode.findAccessibilityNodeInfosByText(text)
        for (node in nodes) {
            if (node.isClickable) {
                return node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            }
            // Check parent clickable container
            var parent = node.parent
            while (parent != null) {
                if (parent.isClickable) {
                    return parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                }
                parent = parent.parent
            }
        }
        return false
    }

    /**
     * Finds an editable field and inputs text.
     */
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

    /**
     * System Gestures: Go Home, Back, Recents, Open Notifications
     */
    fun performGoHome(): Boolean = performGlobalAction(GLOBAL_ACTION_HOME)
    fun performGoBack(): Boolean = performGlobalAction(GLOBAL_ACTION_BACK)
    fun performOpenNotifications(): Boolean = performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)
    fun performOpenRecents(): Boolean = performGlobalAction(GLOBAL_ACTION_RECENTS)

    /**
     * Simulates physical touch tap on (x, y) coordinates
     */
    fun tapAtCoordinates(x: Float, y: Float, durationMs: Long = 50) {
        val path = Path().apply { moveTo(x, y) }
        val stroke = GestureDescription.StrokeDescription(path, 0, durationMs)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()
        dispatchGesture(gesture, null, null)
    }
}
