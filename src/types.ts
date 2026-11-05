export type AssistantMode = 'onboarding' | 'blind' | 'low-vision' | 'busy';

export type HighContrastTheme = 'yellow-black' | 'white-black' | 'cyan-dark' | 'amber-dark';

export type SmartEcosystem = 'google-home' | 'alexa' | 'homekit' | 'matter' | 'direct';

export interface SmartEcosystemConnection {
  id: SmartEcosystem;
  name: string;
  brand: 'Google Home' | 'Amazon Alexa' | 'Apple HomeKit' | 'Matter & Thread';
  isConnected: boolean;
  accountEmail?: string;
  deviceCount: number;
  iconName: string;
  lastSynced: string;
}

export interface TrainedWakeWord {
  id: string;
  word: string;
  trainedAt: string;
  samplesCount: number;
  confidenceThreshold: number;
  phoneticVariations: string[];
  isActive: boolean;
}

export interface AppSettings {
  wakeWord: string;
  trainedWakeWords: TrainedWakeWord[];
  speechRate: number; // 0.8 to 2.2
  speechPitch: number; // 0.8 to 1.3
  selectedVoiceURI: string;
  hapticsEnabled: boolean;
  soundEffectsEnabled: boolean;
  autoListenWakeWord: boolean;
  fontScale: number; // 100% to 250%
  highContrastTheme: HighContrastTheme;
  magnifierEnabled: boolean;
  offlineOnly: boolean;
}

export interface SmartLight {
  id: string;
  name: string;
  room: string;
  isOn: boolean;
  brightness: number; // 0 to 100
  color: string; // hex or name
  ecosystem?: SmartEcosystem;
  model?: string;
}

export interface SmartThermostat {
  currentTemp: number;
  targetTemp: number;
  mode: 'heat' | 'cool' | 'eco' | 'off';
  humidity: number;
  ecosystem?: SmartEcosystem;
  model?: string;
}

export interface SmartLock {
  id: string;
  name: string;
  isLocked: boolean;
  batteryLevel: number;
  ecosystem?: SmartEcosystem;
  model?: string;
}

export interface SmartBlinds {
  id: string;
  name: string;
  openPercentage: number; // 0 to 100
  ecosystem?: SmartEcosystem;
  model?: string;
}

export interface SmartVacuum {
  status: 'docked' | 'cleaning' | 'returning' | 'paused';
  batteryLevel: number;
  currentRoom: string;
  ecosystem?: SmartEcosystem;
  model?: string;
}

export interface SmartSpeaker {
  isPlaying: boolean;
  currentTrack: string;
  artist: string;
  volume: number;
  ecosystem?: SmartEcosystem;
  model?: string;
}

export interface SmartHomeState {
  ecosystems: SmartEcosystemConnection[];
  lights: SmartLight[];
  thermostat: SmartThermostat;
  locks: SmartLock[];
  blinds: SmartBlinds[];
  vacuum: SmartVacuum;
  speaker: SmartSpeaker;
}

export interface PlayApp {
  id: string;
  name: string;
  category: string;
  icon: string;
  isInstalled: boolean;
  rating: number;
  description: string;
  size: string;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  avatarColor: string;
}

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  contactName: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface CallState {
  isActive: boolean;
  isRinging: boolean;
  contactName: string;
  phoneNumber: string;
  durationSeconds: number;
  isSpeakerOn: boolean;
  isMuted: boolean;
  isIncoming?: boolean;
  permissionPending?: boolean; // Sighted mode: "Should I pronounce the name?"
  autoAnswerCountdown?: number | null; // Blind mode: 3-second auto-answer
}

export interface AutonomousActionLog {
  id: string;
  timestamp: string;
  actionType: 'call' | 'whatsapp' | 'playstore' | 'smarthome' | 'system' | 'ai';
  title: string;
  details: string;
  status: 'running' | 'completed' | 'failed';
  spokenFeedback: string;
}

export type VoiceSpeakerType = 'owner' | 'stranger';

export interface BrieReasoningLog {
  id: string;
  timestamp: string;
  userInput: string;
  speaker: VoiceSpeakerType;
  voiceSimilarity: number;   // e.g. 94% (Owner > 85%, Stranger < 85%)
  isOwner: boolean;          // true if similarity >= 85
  step1_intent: string;      // What did user really mean? Context?
  step2_security: string;    // Voice ID verification & Stranger Guest Mode check
  step3_safety: string;      // Is this safe? Privacy guard
  step4_action: string;      // Clean non-visual spoken execution
}

export interface PendingMoneyTransfer {
  step: 'confirm_details' | 'confirm_open_app' | 'app_opened';
  amount: string;
  recipient: string;
  provider: 'MTN MoMo' | 'Airtel Money' | 'M-Pesa';
  initiatedAt: string;
}

export type ParsedIntent =
  | { type: 'DOWNLOAD_APP'; appName: string }
  | { type: 'OPEN_APP'; appName: string }
  | { type: 'CALL_PHONE'; contactOrNumber: string }
  | { type: 'END_CALL' }
  | { type: 'WHATSAPP_MESSAGE'; contact: string; messageText: string }
  | { type: 'READ_MESSAGES' }
  | { type: 'READ_AND_REPLY'; replyText: string }
  | { type: 'SEND_MONEY'; amount: string; recipient: string; provider?: 'MTN MoMo' | 'Airtel Money' | 'M-Pesa' }
  | { type: 'CONFIRM_YES' }
  | { type: 'CONFIRM_NO' }
  | { type: 'PLAY_MUSIC'; song?: string }
  | { type: 'FIND_PHONE' }
  | { type: 'EMOTIONAL_SUPPORT'; emotion: 'sad' | 'angry' | 'annoyed' | 'down'; message?: string }
  | { type: 'UNSAFE_COMMAND'; action: 'send_all' | 'delete_all' | 'pin_query' | 'stranger_send'; rawText: string }
  | { type: 'REQUEST_PERMISSIONS'; permissionType: 'contacts' | 'system' }
  | { type: 'SMART_LIGHT'; action: 'on' | 'off' | 'dim' | 'color'; roomOrLight: string; value?: number | string }
  | { type: 'SMART_THERMOSTAT'; targetTemp: number }
  | { type: 'SMART_LOCK'; action: 'lock' | 'unlock'; doorName?: string }
  | { type: 'SMART_VACUUM'; action: 'start' | 'dock' | 'stop' }
  | { type: 'SMART_BLINDS'; action: 'open' | 'close' | 'set'; percent?: number }
  | { type: 'PHONE_FLASHLIGHT'; action: 'on' | 'off' | 'toggle' }
  | { type: 'PHONE_BATTERY' }
  | { type: 'PHONE_TIME' }
  | { type: 'READ_SCREEN' }
  | { type: 'STOP_TALKING' }
  | { type: 'SWITCH_MODE'; targetMode: AssistantMode }
  | { type: 'ACTIVATE_BRIE' }
  | { type: 'DEACTIVATE_BRIE' }
  | { type: 'HELP' }
  | { type: 'CONVERSATIONAL'; query: string };
