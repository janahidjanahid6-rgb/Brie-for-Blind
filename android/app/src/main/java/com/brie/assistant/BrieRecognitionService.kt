package com.brie.assistant

import android.content.Intent
import android.speech.RecognitionService

/**
 * BrieRecognitionService - Recognition service binding for VoiceInteractionService.
 */
class BrieRecognitionService : RecognitionService() {
    override fun onStartListening(intent: Intent?, callback: Callback?) {
        // Handled by primary SpeechRecognizer
    }

    override fun onCancel(callback: Callback?) {}

    override fun onStopListening(callback: Callback?) {}
}
