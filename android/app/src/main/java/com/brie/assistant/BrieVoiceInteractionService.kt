package com.brie.assistant

import android.os.Bundle
import android.service.voice.VoiceInteractionService
import android.service.voice.VoiceInteractionSession
import android.service.voice.VoiceInteractionSessionService
import android.util.Log

/**
 * BrieVoiceInteractionService - Default Digital Assistant Registration
 * Replaces default assistant (Google Assistant/Gemini/Bixby).
 * Summons Brie upon power-button long-press or hardware assistant gestures.
 */
class BrieVoiceInteractionService : VoiceInteractionService() {
    override fun onReady() {
        super.onReady()
        Log.d("BrieVoiceService", "Brie Registered as System Digital Assistant.")
    }
}

/**
 * Handles the voice session when summoned by hardware assistant keys.
 */
class BrieVoiceSessionService : VoiceInteractionSessionService() {
    override fun onNewSession(args: Bundle?): VoiceInteractionSession {
        return object : VoiceInteractionSession(this) {
            override fun onShow(args: Bundle?, showFlags: Int) {
                super.onShow(args, showFlags)
                Log.d("BrieVoiceSession", "Brie Assistant Summoned by System Key.")
                // Start speech recognition or wake up assistant
                MainActivity.instance?.startListening()
            }
        }
    }
}
