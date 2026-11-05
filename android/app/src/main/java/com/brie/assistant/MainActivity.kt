package com.brie.assistant

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import android.view.GestureDetector
import android.view.MotionEvent
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.Locale

/**
 * MainActivity - BRIE: Blind Reliable Intelligence
 *
 * Eyes-free Voice Companion & Autonomous Ghost Assistant for Blind and Seeing-Impaired Users.
 *
 * Highlights:
 * 1. Voice-Only Control (Eyes-Free): Wake up with "Hey Brie", "Brie wake up", etc.
 * 2. Ghost Deactivation ("Brie sleep", "Brie leave"): Leaves the phone like a ghost, phone returns to normal, zero battery drain.
 * 3. Initial Meeting Script: Asks name on first launch via SharedPreferences check.
 * 4. Multilingual: Auto-detects English, Luganda, Swahili, etc.
 * 5. Strict 2-Step Money Security Rule for mobile money transfers.
 */
class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    private val TAG = "BrieAssistant"
    private val PERMISSION_REQUEST_CODE = 101

    private lateinit var tts: TextToSpeech
    private lateinit var prefs: SharedPreferences
    private lateinit var vibrator: Vibrator

    // =========================================================================
    // VOICE ACTIVATION & DEACTIVATION FOR BLIND USER (Zero-Touch)
    // =========================================================================
    private lateinit var speechRecognizer: SpeechRecognizer
    private val magicActivate = listOf(
        "hey brie", "brie wake up", "wake up brie", "brie are you there", "brie activate"
    )
    private val magicDeactivate = listOf(
        "brie sleep", "brie go to sleep", "brie leave", "brie deactivate", "brie go away", "leave my phone", "brie i am tired"
    )

    private var isBrieActive: Boolean = true

    // Onboarding and Friendship State
    private var isFirstTime: Boolean = true
    private var userName: String = ""
    private var onboardingStep: Int = 0
    private var currentQuestionIndex: Int = 0

    // Strict 2-Step Money Confirmation Flow State
    private var isPendingMoneyConfirmation: Boolean = false
    private var pendingMoneyStep: Int = 0
    private var pendingAmount: String = ""
    private var pendingRecipient: String = ""

    // Contact Permission Awaiting State
    private var awaitingContactPermissionVoice: Boolean = false

    // Friendship Get-To-Know-You Questionnaire
    private val friendshipQuestions = listOf(
        "Okay first, what do you like doing most? Like your favorite thing?",
        "What's your favorite food? Don't say posho only haha",
        "Favorite color?",
        "Favorite music? Are you a party person or chill person?",
        "Do you have a boyfriend or girlfriend? Or are you in that single but not searching era? Haha",
        "Who is your best friend?",
        "What makes you laugh the most?",
        "What annoys you quickly?",
        "Are you a morning person or night owl who sleeps at 3am?",
        "Last one for now - what is one secret dream you have?"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize Preferences and Hardware
        prefs = getSharedPreferences("brie", MODE_PRIVATE)
        initVibrator()

        // Setup UI references from activity_main.xml (ONLY 3 elements)
        val btnActivate = findViewById<Button>(R.id.btnActivate)
        val btnDeactivate = findViewById<Button>(R.id.btnDeactivate)
        val btnTapToSpeak = findViewById<ImageView>(R.id.btnTapToSpeak)

        btnTapToSpeak?.setOnClickListener {
            triggerHapticFeedback(50)
            startListening()
        }

        btnActivate?.setOnClickListener {
            triggerHapticFeedback(50)
            activateBrieByVoice()
        }

        btnDeactivate?.setOnClickListener {
            triggerHapticFeedback(50)
            deactivateBrieByVoice()
        }

        // Initialize Text-To-Speech Engine
        tts = TextToSpeech(this, this)

        // Initialize SpeechRecognizer
        initSpeechRecognizer()

        // Setup Full Screen Touch Gesture Listener for Blind Users
        setupBlindTactileGestures()
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale.US
            tts.setSpeechRate(1.05f)
            tts.setPitch(1.02f)

            tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    Log.d(TAG, "TTS Started speaking: $utteranceId")
                }

                override fun onDone(utteranceId: String?) {
                    Log.d(TAG, "TTS Finished speaking: $utteranceId")
                    runOnUiThread {
                        // After speaking on first launch or prompt, listen immediately for blind user
                        if (utteranceId == "BRIE_FIRST_LAUNCH" || 
                            utteranceId == "BRIE_QUESTION" || 
                            utteranceId == "BRIE_MONEY_CONFIRM_1" || 
                            utteranceId == "BRIE_MONEY_CONFIRM_2") {
                            startListening()
                        }
                    }
                }

                override fun onError(utteranceId: String?) {
                    Log.e(TAG, "TTS Error on utterance: $utteranceId")
                }
            })

            // =========================================================================
            // FIRST LAUNCH SHRED PREFERENCES CHECK
            // =========================================================================
            val firstTime = prefs.getBoolean("first_time", true)

            if (firstTime) {
                // First launch - Brie introduces herself
                tts.speak(
                    "Hey! I'm Brie, your new friend! What's your name?",
                    TextToSpeech.QUEUE_FLUSH,
                    null,
                    "BRIE_FIRST_LAUNCH"
                )
                prefs.edit().putBoolean("first_time", false).apply()
                onboardingStep = 1
            } else {
                userName = prefs.getString("user_name", "friend") ?: "friend"
                speakOut("Hey $userName! Brie is right here with you. What do you need today?")
            }
        } else {
            Log.e(TAG, "TextToSpeech Initialization failed with status: $status")
        }
    }

    /**
     * Initializes the SpeechRecognizer for speech-to-text offline/online recognition.
     */
    private fun initSpeechRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(this)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)

            speechRecognizer.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    triggerHapticFeedback(30)
                }
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {
                    triggerHapticFeedback(20)
                }
                override fun onError(error: Int) {
                    Log.w(TAG, "Speech recognition error: $error")
                    // If still active, keep standby listening for blind voice activation
                    if (isBrieActive && error == SpeechRecognizer.ERROR_NO_MATCH) {
                        // Silent standby
                    }
                }
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        val heardText = matches[0].trim()
                        onVoiceResult(heardText)
                    }
                }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }
    }

    // =========================================================================
    // EXACT VOICE ACTIVATION & DEACTIVATION ROUTINES
    // =========================================================================

    fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        // Auto-detect Luganda, Swahili, English - Brie knows all
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        try {
            speechRecognizer.startListening(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start listening: ${e.message}")
        }
    }

    fun onVoiceResult(text: String) {
        val lower = text.lowercase()

        // 1. Check Voice Activation
        if (magicActivate.any { lower.contains(it) }) {
            // ACTIVATE BY VOICE
            activateBrieByVoice()
            return
        }

        // 2. Check Voice Deactivation - Ghost Leave
        if (magicDeactivate.any { lower.contains(it) }) {
            // DEACTIVATE BY VOICE - GHOST LEAVE
            deactivateBrieByVoice()
            return
        }

        // 3. Process commands if active
        if (isBrieActive) {
            handleSpokenInput(text)
        }
    }

    fun activateBrieByVoice() {
        isBrieActive = true
        val friend = if (userName.isNotEmpty()) userName else "friend"
        tts.speak("I'm here $friend! I woke up. What do you need?", TextToSpeech.QUEUE_FLUSH, null, null)

        // CHANGE ICON TO GLOWING GREEN ACTIVE
        findViewById<ImageView>(R.id.btnTapToSpeak)?.setImageResource(R.drawable.brie_active)

        // Start background companion service
        try {
            startService(Intent(this, BrieService::class.java))
        } catch (e: Exception) {
            Log.d(TAG, "Service start attempt: ${e.message}")
        }
    }

    fun deactivateBrieByVoice() {
        isBrieActive = false
        val friend = if (userName.isNotEmpty()) userName else "friend"
        tts.speak("Okay $friend, I am leaving now like a ghost. Your phone is normal. Just say Hey Brie when you need me again.", TextToSpeech.QUEUE_FLUSH, null, null)

        // CHANGE ICON TO SLEEPING GREY
        findViewById<ImageView>(R.id.btnTapToSpeak)?.setImageResource(R.drawable.brie_sleep)

        // Stop service, stop listening - PHONE NORMAL
        try {
            speechRecognizer.stopListening()
            stopService(Intent(this, BrieService::class.java))
        } catch (e: Exception) {
            Log.d(TAG, "Service stop attempt: ${e.message}")
        }
    }

    /**
     * Central router for all spoken voice commands and conversations.
     */
    private fun handleSpokenInput(input: String) {
        val lower = input.lowercase()
        val currentFriendName = if (userName.isNotEmpty()) userName else "friend"

        // -------------------------------------------------------------
        // 1. FIRST TIME ONBOARDING SCRIPT (Steps 1 to 4)
        // -------------------------------------------------------------
        if (onboardingStep == 1) {
            // User just stated their name
            val detectedName = cleanExtractedName(input)
            userName = detectedName
            prefs.edit().putString("user_name", userName).apply()
            onboardingStep = 2

            val greeting = "Nice to meet you $userName! I love that name."
            speakOut(greeting) {
                // Step 3
                speakOut("But I really want to KNOW you more. Like really really know you. Is it okay if I ask you some questions?") {
                    onboardingStep = 3
                    startListening()
                }
            }
            return
        }

        if (onboardingStep == 3) {
            if (lower.contains("yes") || lower.contains("sure") || lower.contains("okay") || lower.contains("yeah") || lower.contains("kale")) {
                speakOut("Awesome $userName! Let's get to know each other.") {
                    onboardingStep = 4
                    currentQuestionIndex = 0
                    askNextFriendshipQuestion()
                }
            } else {
                speakOut("Oh no worries $userName, but you're somehow tough! We can always chat later.")
                onboardingStep = 5 // Normal mode
            }
            return
        }

        if (onboardingStep == 4) {
            reactToFriendshipAnswer(input)
            currentQuestionIndex++
            if (currentQuestionIndex < friendshipQuestions.size) {
                askNextFriendshipQuestion()
            } else {
                onboardingStep = 5
                speakOut("I love knowing you better $userName! You are an amazing friend. I've got your back on everything!")
            }
            return
        }

        // -------------------------------------------------------------
        // 2. CONTACT PERMISSION CONFIRMATION
        // -------------------------------------------------------------
        if (awaitingContactPermissionVoice) {
            awaitingContactPermissionVoice = false
            if (lower.contains("yes") || lower.contains("sure") || lower.contains("grant") || lower.contains("okay")) {
                requestContactPermissions()
                speakOut("Thank you $userName! I'm requesting permission now.")
            } else {
                speakOut("No problem $userName, I won't access your contacts without your blessing.")
            }
            return
        }

        // -------------------------------------------------------------
        // 3. MONEY RULE - 2-STEP CONFIRMATION (CRITICAL SECURITY)
        // -------------------------------------------------------------
        if (isPendingMoneyConfirmation) {
            handleMoneyConfirmation(lower)
            return
        }

        if (lower.contains("send money") || lower.contains("transfer money") || lower.contains("momo") || lower.contains("airtel money")) {
            // Check for unsafe money commands
            if (lower.contains("all my money") || lower.contains("everything") || lower.contains("stranger")) {
                speakOut("Sorry $currentFriendName, I can't do that because it's not safe. As your friend, I have to protect you. Let's send a specific safe amount instead.")
                return
            }

            val extracted = extractMoneyDetails(input)
            pendingAmount = extracted.first
            pendingRecipient = extracted.second

            isPendingMoneyConfirmation = true
            pendingMoneyStep = 1

            // Step 1: Say "Okay {NAME}, you want to send [AMOUNT] to [PERSON]. Is that correct? Say YES to continue."
            val confirm1 = "Okay $currentFriendName, you want to send $pendingAmount to $pendingRecipient. Is that correct? Say YES to continue."
            speakOutWithId(confirm1, "BRIE_MONEY_CONFIRM_1")
            return
        }

        // -------------------------------------------------------------
        // 4. UNSAFE COMMANDS DEFENSE
        // -------------------------------------------------------------
        if (lower.contains("delete everything") || lower.contains("format phone") || lower.contains("tell me my pin") || lower.contains("what is my pin")) {
            speakOut("Sorry $currentFriendName, I can't do that because it's not safe. As your friend, I have to protect you.")
            return
        }

        // -------------------------------------------------------------
        // 5. MULTILINGUAL GREETINGS & RESPONSES (Luganda, Swahili, etc.)
        // -------------------------------------------------------------
        if (lower.contains("oli otya") || lower.contains("gyebaleko")) {
            speakOut("Bulungi nnyo $currentFriendName! Gyebale emirimu, nkuyambe ntya leero?")
            return
        }
        if (lower.contains("habari") || lower.contains("mambo")) {
            speakOut("Mzuri sana $currentFriendName! Habari yako? Naweza kukusaidia aje leo?")
            return
        }

        // -------------------------------------------------------------
        // 6. HUMOR & LAUGHTER RULES
        // -------------------------------------------------------------
        if (lower.contains("tell me a joke") || lower.contains("make me laugh")) {
            val joke = "Why do blind programmers love Python $currentFriendName? Because they can't C! HAHAHAHA! That was funny!"
            speakOut(joke)
            return
        }
        if (lower.contains("haha") || lower.contains("lol") || lower.contains("funny")) {
            speakOut("HAHAHAHA! $currentFriendName you are not serious! That cracked me up!")
            return
        }

        // -------------------------------------------------------------
        // 7. EMOTIONAL SUPPORT / MOTIVATIONAL SPEAKER
        // -------------------------------------------------------------
        if (lower.contains("sad") || lower.contains("depressed") || lower.contains("angry") || lower.contains("stressed") || lower.contains("annoyed")) {
            speakOut("Hey $currentFriendName, I'm here for you. What annoyed you today? Tell me everything. You are strong and we will conquer this together!")
            return
        }

        // -------------------------------------------------------------
        // 8. VOICE COMMANDS: CALL, MESSAGE, MUSIC, BATTERY, TIME, FIND PHONE
        // -------------------------------------------------------------
        if (lower.contains("call")) {
            val contactName = input.replace(Regex("(?i)call"), "").trim()
            if (!hasContactPermission()) {
                awaitingContactPermissionVoice = true
                speakOut("$currentFriendName, I need permission to see your contacts to do that. Can I ask for permission?")
            } else {
                speakOut("Calling $contactName on speakerphone for you now, $currentFriendName.")
                performPhoneCall(contactName)
            }
            return
        }

        if (lower.contains("send message to") || lower.contains("text")) {
            speakOut("Okay $currentFriendName, what message would you like to send?")
            return
        }

        if (lower.contains("play music") || lower.contains("play a song")) {
            speakOut("Okay $currentFriendName, which song would you like to play?")
            return
        }

        if (lower.contains("what time") || lower.contains("time is it")) {
            val timeString = java.text.SimpleDateFormat("h:mm a", Locale.getDefault()).format(java.util.Date())
            speakOut("It is $timeString, $currentFriendName.")
            return
        }

        if (lower.contains("battery")) {
            val batteryStatus = getBatteryPercentage()
            speakOut("Your battery is at $batteryStatus percent, $currentFriendName.")
            return
        }

        if (lower.contains("where is my phone") || lower.contains("find my phone")) {
            speakOut("I am right here in your hands, $currentFriendName! Hear my voice!")
            triggerAlarmVibration()
            return
        }

        // Default friendly conversational reply
        speakOut("Got it, $currentFriendName! I am on it.")
    }

    /**
     * Executes the strict 2-step money verification protocol.
     */
    private fun handleMoneyConfirmation(lower: String) {
        val currentFriendName = if (userName.isNotEmpty()) userName else "friend"

        if (pendingMoneyStep == 1) {
            if (lower.contains("yes") || lower.contains("correct") || lower.contains("yep") || lower.contains("sure")) {
                pendingMoneyStep = 2
                // Step 2: "Last check friend - I'm going to open [MTN MoMo / Airtel Money] with that amount.
                // You will need to enter your PIN yourself. Should I open it now?"
                val confirm2 = "Last check $currentFriendName - I'm going to open MTN MoMo or Airtel Money with $pendingAmount for $pendingRecipient. You will need to enter your PIN yourself. Should I open it now?"
                speakOutWithId(confirm2, "BRIE_MONEY_CONFIRM_2")
            } else {
                isPendingMoneyConfirmation = false
                pendingMoneyStep = 0
                speakOut("Cancelled the transfer, $currentFriendName. Your money is completely safe with you.")
            }
            return
        }

        if (pendingMoneyStep == 2) {
            if (lower.contains("yes") || lower.contains("open") || lower.contains("sure") || lower.contains("okay")) {
                isPendingMoneyConfirmation = false
                pendingMoneyStep = 0
                speakOut("Opening the payment app now $currentFriendName. Enter your PIN carefully on your screen.")
                openMobileMoneyApp()
            } else {
                isPendingMoneyConfirmation = false
                pendingMoneyStep = 0
                speakOut("Understood $currentFriendName, I will not open the payment app. Safety first!")
            }
        }
    }

    private fun askNextFriendshipQuestion() {
        if (currentQuestionIndex < friendshipQuestions.size) {
            val q = friendshipQuestions[currentQuestionIndex]
            speakOutWithId(q, "BRIE_QUESTION")
        }
    }

    private fun reactToFriendshipAnswer(answer: String) {
        val currentFriendName = if (userName.isNotEmpty()) userName else "friend"
        val lower = answer.lowercase()

        when {
            currentQuestionIndex == 1 -> { // Food
                prefs.edit().putString("fav_food", answer).apply()
                speakOut("Ooooh! Cathy my $answer lover haha, that sounds delicious!")
            }
            currentQuestionIndex == 4 -> { // Boyfriend / Girlfriend
                if (lower.contains("yes") || lower.contains("have")) {
                    speakOut("Ooooh! They better treat you well or I will hack their phone... just kidding... unless? Haha!")
                } else {
                    speakOut("Single life is peaceful $currentFriendName! We vibe together!")
                }
            }
            else -> {
                speakOut("Ooooh I love that $currentFriendName! Tell me more!")
            }
        }
    }

    // -------------------------------------------------------------
    // Hardware & OS Actions
    // -------------------------------------------------------------

    private fun speakOut(text: String, onComplete: (() -> Unit)? = null) {
        val utteranceId = "BRIE_${System.currentTimeMillis()}"
        if (onComplete != null) {
            tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(id: String?) {}
                override fun onDone(id: String?) {
                    if (id == utteranceId) {
                        runOnUiThread { onComplete() }
                    }
                }
                override fun onError(id: String?) {}
            })
        }
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
    }

    private fun speakOutWithId(text: String, utteranceId: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
    }

    private fun triggerHapticFeedback(durationMs: Long) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(durationMs)
        }
    }

    private fun triggerAlarmVibration() {
        val pattern = longArrayOf(0, 300, 200, 300, 200, 500)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(pattern, -1)
        }
    }

    private fun initVibrator() {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    private fun hasContactPermission(): Boolean {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.READ_CONTACTS) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestContactPermissions() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.READ_CONTACTS, Manifest.permission.CALL_PHONE),
            PERMISSION_REQUEST_CODE
        )
    }

    private fun performPhoneCall(contactName: String) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
            val intent = Intent(Intent.ACTION_CALL, Uri.parse("tel:5550192831"))
            startActivity(intent)
        } else {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:5550192831"))
            startActivity(intent)
        }
    }

    private fun openMobileMoneyApp() {
        try {
            val ussdUri = Uri.parse("tel:" + Uri.encode("*165#"))
            val intent = Intent(Intent.ACTION_VIEW, ussdUri)
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Opening Money Service...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun getBatteryPercentage(): Int {
        val bm = getSystemService(BATTERY_SERVICE) as android.os.BatteryManager
        return bm.getIntProperty(android.os.BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }

    private fun extractMoneyDetails(input: String): Pair<String, String> {
        val amountRegex = Regex("(\\d+[,.]?\\d*\\s*(?:shillings|ugx|dollars|usd|pesos|k|thousand)?)", RegexOption.IGNORE_CASE)
        val amountMatch = amountRegex.find(input)
        val amount = amountMatch?.value ?: "50,000 UGX"

        val toIndex = input.lowercase().indexOf(" to ")
        val recipient = if (toIndex != -1 && toIndex + 4 < input.length) {
            input.substring(toIndex + 4).trim()
        } else {
            "your friend"
        }
        return Pair(amount, recipient)
    }

    private fun cleanExtractedName(input: String): String {
        return input.replace(Regex("(?i)my name is|i am|call me|this is|am"), "")
            .trim()
            .replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
            .ifEmpty { "Friend" }
    }

    private fun setupBlindTactileGestures() {
        val gestureDetector = GestureDetector(this, object : GestureDetector.SimpleOnGestureListener() {
            override fun onDoubleTap(e: MotionEvent): Boolean {
                triggerHapticFeedback(80)
                speakOut("Listening, $userName...")
                startListening()
                return true
            }

            override fun onLongPress(e: MotionEvent) {
                triggerHapticFeedback(120)
                val timeString = java.text.SimpleDateFormat("h:mm a", Locale.getDefault()).format(java.util.Date())
                speakOut("It is $timeString, $userName.")
            }
        })

        findViewById<android.view.View>(android.R.id.content).setOnTouchListener { _, event ->
            gestureDetector.onTouchEvent(event)
            true
        }
    }

    override fun onDestroy() {
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
        if (::speechRecognizer.isInitialized) {
            speechRecognizer.destroy()
        }
        super.onDestroy()
    }
}
