package com.brie.assistant

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * BrieService - Background Voice & Accessibility Service
 * Runs in the background to listen for wake words and assist blind users.
 * When user says "Brie sleep" or "Brie leave", this service is stopped immediately
 * so the phone returns to completely normal state without draining battery.
 */
class BrieService : Service() {

    private val CHANNEL_ID = "BrieServiceChannel"
    private val NOTIFICATION_ID = 1001

    override fun onCreate() {
        super.onCreate()
        Log.d("BrieService", "Brie Service created. Ghost assistant active.")
        createNotificationChannel()
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Brie Assistant Active")
            .setContentText("Listening eyes-free for your voice. Say 'Brie sleep' to deactivate.")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("BrieService", "Brie Service running in background.")
        return START_STICKY
    }

    override fun onDestroy() {
        Log.d("BrieService", "Brie Service stopped. Phone returned to normal.")
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Brie Assistant Background Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}
