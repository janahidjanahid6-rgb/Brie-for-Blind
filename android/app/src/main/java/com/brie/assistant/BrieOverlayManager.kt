package com.brie.assistant

import android.content.Context
import android.graphics.PixelFormat
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.ImageView

/**
 * BrieOverlayManager - Floating System Overlay Engine (SYSTEM_ALERT_WINDOW)
 * Renders the friendly glowing green ghost over other apps, games, and home screen.
 */
class BrieOverlayManager(private val context: Context) {

    private val windowManager: WindowManager =
        context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var overlayView: View? = null

    fun hasOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true
        }
    }

    fun showFloatingGhost(onGhostClicked: () -> Unit) {
        if (!hasOverlayPermission() || overlayView != null) return

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 30
            y = 120
        }

        val ghostIcon = ImageView(context).apply {
            setImageResource(R.drawable.brie_active)
            contentDescription = "Brie Floating Assistant Ghost"
            setOnClickListener {
                onGhostClicked()
            }
        }

        overlayView = ghostIcon
        try {
            windowManager.addView(ghostIcon, params)
            Log.d("BrieOverlay", "Floating green ghost overlay displayed.")
        } catch (e: Exception) {
            Log.e("BrieOverlay", "Failed to add overlay: ${e.message}")
        }
    }

    fun hideFloatingGhost() {
        if (overlayView != null) {
            try {
                windowManager.removeView(overlayView)
                overlayView = null
            } catch (e: Exception) {
                Log.e("BrieOverlay", "Failed to remove overlay: ${e.message}")
            }
        }
    }
}
