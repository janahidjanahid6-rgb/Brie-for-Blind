import { ParsedIntent } from '../types';

/**
 * Fast, offline natural language intent parser.
 * Works completely in-browser without server or internet round-trip.
 * Fully optimized for blind users (speed, audio-first, conversational shortcuts).
 */
export function parseVoiceCommand(rawText: string, wakeWords: string[] = ['hey brie', 'brie', 'hello brie', 'hey bri', 'bri']): ParsedIntent {
  const rawLower = rawText.toLowerCase().trim();
  const magicActivate = ['activate', 'brie activate', 'hey brie', 'brie wake up', 'wake up brie', 'brie are you there', 'start brie', 'wake up'];
  const magicDeactivate = ['deactivate', 'brie deactivate', 'brie sleep', 'brie go to sleep', 'brie leave', 'brie go away', 'leave my phone', 'brie i am tired', 'go to sleep'];

  const cleanedPunct = rawLower.replace(/[.!?,]/g, '').trim();

  // Check Ghost Leave / Deactivate by Voice
  if (
    cleanedPunct === 'deactivate' ||
    cleanedPunct.startsWith('deactivate') ||
    cleanedPunct.endsWith('deactivate') ||
    magicDeactivate.some((phrase) => rawLower.includes(phrase))
  ) {
    return { type: 'DEACTIVATE_BRIE' };
  }

  // Check Voice Activation
  if (
    cleanedPunct === 'activate' ||
    cleanedPunct.startsWith('activate') ||
    cleanedPunct.endsWith('activate') ||
    magicActivate.some((phrase) => rawLower.includes(phrase) || cleanedPunct === phrase)
  ) {
    return { type: 'ACTIVATE_BRIE' };
  }

  let cleaned = rawText.toLowerCase().trim();

  // Strip leading wake words (Brie / Hey Brie)
  for (const w of wakeWords) {
    if (cleaned.startsWith(w)) {
      cleaned = cleaned.slice(w.length).trim();
      break;
    }
  }

  // Handle Luganda / English mixed colloquial prefixes:
  // "gwe" (you), "kati" (now), "bambi" (please), "mwattu" (kindly)
  cleaned = cleaned
    .replace(/^(?:please|can you|could you|would you|brie please|brie|gwe|kati|bambi|mwattu)\s+/i, '')
    .trim();

  // Strip ecosystem voice prefixes (e.g. "tell google home to", "ask alexa to", "homekit")
  cleaned = cleaned
    .replace(/^(?:tell\s+)?(?:google\s+home|google\s+nest|alexa|amazon\s+alexa|apple\s+homekit|homekit|matter)\s+(?:to\s+)?/i, '')
    .replace(/^(?:ask\s+)(?:google\s+home|alexa|homekit)\s+(?:to\s+)?/i, '')
    .trim();

  // ==========================================
  // 1. UNSAFE COMMANDS (Protection Rule: Say NO kindly)
  // ==========================================
  if (/(?:send|transfer|withdraw|empty)\s+(?:all|everything|my entire account|all of my money)/i.test(cleaned)) {
    return { type: 'UNSAFE_COMMAND', action: 'send_all', rawText: cleaned };
  }
  if (/(?:delete|wipe|erase|clear)\s+(?:everything|all|my phone|all data|all contacts)/i.test(cleaned)) {
    return { type: 'UNSAFE_COMMAND', action: 'delete_all', rawText: cleaned };
  }
  if (/(?:tell|say|what is|share|repeat|show)\s+(?:me\s+)?(?:my\s+)?pin/i.test(cleaned)) {
    return { type: 'UNSAFE_COMMAND', action: 'pin_query', rawText: cleaned };
  }
  if (/(?:send|transfer)\s+money\s+to\s+(?:a\s+)?stranger/i.test(cleaned) || /someone\s+i\s+don'?t\s+know/i.test(cleaned)) {
    return { type: 'UNSAFE_COMMAND', action: 'stranger_send', rawText: cleaned };
  }

  // ==========================================
  // 2. STOP / SILENCE
  // ==========================================
  if (/^(stop|shut up|be quiet|silence|quiet|pause|stop talking|leka|lekeraawo)$/i.test(cleaned)) {
    return { type: 'STOP_TALKING' };
  }

  // ==========================================
  // 3. DIALOGUE CONFIRMATIONS (YES / NO)
  // ==========================================
  if (/^(?:yes|yeah|yep|yup|sure|correct|confirm|proceed|okay|ok|open\s*it|do\s*it|go\s*ahead|yego|kale|ye|yes\s*please)$/i.test(cleaned)) {
    return { type: 'CONFIRM_YES' };
  }
  if (/^(?:no|nope|nah|cancel|stop|don'?t|do not|abort|wait|never\s*mind|nedda)$/i.test(cleaned)) {
    return { type: 'CONFIRM_NO' };
  }

  // ==========================================
  // 4. EMOTIONAL SUPPORT / MOTIVATIONAL FRIEND
  // ==========================================
  if (/(?:i('?m| am)\s+(?:so\s+)?(?:sad|angry|annoyed|mad|furious|depressed|unhappy|crying|hurt|frustrated|down|feeling down|overwhelmed|stressed))/i.test(cleaned)) {
    const emotion = cleaned.includes('angry') || cleaned.includes('mad') || cleaned.includes('furious')
      ? 'angry'
      : cleaned.includes('annoyed') || cleaned.includes('frustrated')
      ? 'annoyed'
      : 'sad';
    return { type: 'EMOTIONAL_SUPPORT', emotion, message: cleaned };
  }
  if (/(?:i feel terrible|having a bad day|nobody likes me|i want to give up|life is hard|i am upset)/i.test(cleaned)) {
    return { type: 'EMOTIONAL_SUPPORT', emotion: 'sad', message: cleaned };
  }

  // ==========================================
  // 5. WHERE IS MY PHONE / LOCATE
  // ==========================================
  if (/(?:where\s+is\s+my\s+phone|find\s+(?:my\s+)?phone|ping\s+(?:my\s+)?phone|where\s+are\s+you|ring\s+(?:my\s+)?phone)/i.test(cleaned)) {
    return { type: 'FIND_PHONE' };
  }

  // ==========================================
  // 5A. EMERGENCY SOS (Triple-click / voice command)
  // ==========================================
  if (/(?:emergency\s+sos|sos|help\s+me\s+emergency|danger|ndi\s+bubi|yamba|nyamba)/i.test(cleaned)) {
    return { type: 'EMERGENCY_SOS' };
  }

  // ==========================================
  // 5B. CAMERA VISION / "BRIE, WHAT DO YOU SEE?"
  // ==========================================
  if (
    /(?:what\s+(?:do\s+you\s+see|is\s+in\s+front\s+of\s+me|is\s+this|am\s+i\s+looking\s+at)|describe\s+(?:the\s+)?scene|read\s+(?:this\s+)?(?:money|currency|banknote|shilling|cash|dollar)|read\s+(?:this\s+)?(?:document|paper|label|text)|what\s+color\s+is|look\s+around|open\s+camera|brie\s+vision)/i.test(
      cleaned
    )
  ) {
    return { type: 'DESCRIBE_VISION', targetQuery: cleaned };
  }

  // ==========================================
  // 5C. "WHERE AM I?" & GPS ORIENTATION
  // ==========================================
  if (/(?:where\s+am\s+i|what\s+is\s+my\s+location|where\s+are\s+we|which\s+direction|compass|orientation)/i.test(cleaned)) {
    return { type: 'WHERE_AM_I' };
  }

  if (/(?:drop\s+breadcrumb|remember\s+(?:this\s+)?(?:place|location|spot|front\s+door)|save\s+breadcrumb)/i.test(cleaned)) {
    const labelMatch = cleaned.match(/(?:remember|save)\s+(?:my\s+)?([a-z0-9\s]+?)(?:\s+location|\s+spot)?$/i);
    const label = labelMatch ? labelMatch[1].trim() : 'Front Door';
    return { type: 'DROP_BREADCRUMB', label };
  }

  if (/(?:guide\s+me\s+(?:back|home)|take\s+me\s+(?:back|home)|where\s+is\s+my\s+breadcrumb|return\s+home)/i.test(cleaned)) {
    return { type: 'GUIDE_BACK' };
  }

  // ==========================================
  // 6. MONEY TRANSFERS (Strict 2-Step Confirmation)
  // ==========================================
  // e.g. "send 50000 to Sarah", "send 20 dollars to Mom on MTN MoMo", "send money to John", "send money"
  const moneyMatch = cleaned.match(/(?:send|transfer|weereza)\s+([$€£]?\d+(?:[.,]\d+)?(?:\s*(?:k|thousand|shillings|ugx|dollars))?)\s+to\s+([a-z0-9\s]+?)(?:\s+on\s+(mtn\s*momo|airtel\s*money|m-?pesa|mobile\s*money))?$/i);
  if (moneyMatch) {
    const rawAmt = moneyMatch[1].trim();
    const recipient = moneyMatch[2].trim();
    const rawProvider = moneyMatch[3]?.toLowerCase();
    const provider = rawProvider?.includes('airtel')
      ? 'Airtel Money'
      : rawProvider?.includes('pesa')
      ? 'M-Pesa'
      : 'MTN MoMo';
    return { type: 'SEND_MONEY', amount: rawAmt, recipient, provider };
  }

  // "send money to Sarah" without specific amount
  const sendMoneyToMatch = cleaned.match(/(?:send|transfer)\s+money\s+to\s+([a-z0-9\s]+?)(?:\s+on\s+(mtn\s*momo|airtel\s*money|m-?pesa))?$/i);
  if (sendMoneyToMatch) {
    const recipient = sendMoneyToMatch[1].trim();
    return { type: 'SEND_MONEY', amount: '50,000 UGX', recipient, provider: 'MTN MoMo' };
  }

  // General "send money" / "open mobile money"
  if (/^(?:send\s+money|transfer\s+money|mobile\s+money|momo|weereza\s+sente)$/i.test(cleaned)) {
    return { type: 'SEND_MONEY', amount: '20,000 UGX', recipient: 'Sarah', provider: 'MTN MoMo' };
  }

  // ==========================================
  // 7. MUSIC PLAYBACK ("play music", "play song", "play [title]")
  // ==========================================
  if (/^play\s+music$/i.test(cleaned) || /^play\s+a\s+song$/i.test(cleaned) || /^play\s+some\s+tunes$/i.test(cleaned)) {
    return { type: 'PLAY_MUSIC' };
  }
  const playSpecificSong = cleaned.match(/^play\s+(.+)$/i);
  if (playSpecificSong && !cleaned.includes('store') && !cleaned.includes('light')) {
    const songName = playSpecificSong[1].trim();
    return { type: 'PLAY_MUSIC', song: songName };
  }

  // ==========================================
  // 8. HELP / CAPABILITIES
  // ==========================================
  if (/^(help|what can you do|how do i use|commands|list commands|onyamba otya)$/i.test(cleaned)) {
    return { type: 'HELP' };
  }

  // ==========================================
  // 9. SWITCH MODES
  // ==========================================
  const modeMatch = cleaned.match(/(?:switch to|change to|set mode to|enable)\s+(blind|seeing impaired|low vision|hands free|busy)/i);
  if (modeMatch) {
    const rawMode = modeMatch[1].toLowerCase();
    if (rawMode.includes('blind')) {
      return { type: 'SWITCH_MODE', targetMode: 'blind' };
    } else if (rawMode.includes('seeing') || rawMode.includes('low vision')) {
      return { type: 'SWITCH_MODE', targetMode: 'low-vision' };
    } else {
      return { type: 'SWITCH_MODE', targetMode: 'busy' };
    }
  }

  // ==========================================
  // 10. PHONE CALLS (e.g. "call Mom", "gwe call Sarah", "piga call 911")
  // ==========================================
  const callMatch = cleaned.match(/^(?:call|dial|phone|ring|kubira|kuba)\s+(.+)$/i);
  if (callMatch) {
    const target = callMatch[1].replace(/on speaker|speakerphone/i, '').trim();
    return { type: 'CALL_PHONE', contactOrNumber: target };
  }
  if (/^(?:hang up|end call|stop call|disconnect)$/i.test(cleaned)) {
    return { type: 'END_CALL' };
  }

  // ==========================================
  // 11. COMPOUND COMMAND: READ LAST MESSAGE AND REPLY
  // ==========================================
  const readAndReplyMatch = cleaned.match(/(?:read\s+(?:my\s+)?(?:last\s+)?messages?\s+(?:and\s+)?(?:reply|answer|saying)\s+)(.+)$/i);
  if (readAndReplyMatch) {
    return { type: 'READ_AND_REPLY', replyText: readAndReplyMatch[1].trim() };
  }

  // ==========================================
  // 12. PLAY STORE / DOWNLOAD APPS
  // ==========================================
  const downloadMatch = cleaned.match(/^(?:download|install|get|installing)\s+(.+?)(?:\s+from\s+(?:the\s+)?(?:play\s*store|app\s*store))?$/i);
  if (downloadMatch) {
    const appName = downloadMatch[1].replace(/app$/i, '').trim();
    return { type: 'DOWNLOAD_APP', appName };
  }

  const openAppMatch = cleaned.match(/^(?:open|launch|start|zigule)\s+(.+?)(?:\s+app)?$/i);
  if (openAppMatch && !cleaned.includes('blinds') && !cleaned.includes('door') && !cleaned.includes('light')) {
    return { type: 'OPEN_APP', appName: openAppMatch[1].trim() };
  }

  // ==========================================
  // 13. WHATSAPP MESSAGING
  // ==========================================
  const waMatch = cleaned.match(/(?:send\s+(?:a\s+)?(?:whatsapp\s+)?(?:message\s+)?to|text|message|weereza)\s+([a-z0-9\s]+?)(?:\s+saying|\s+that|\s*:|\s*,|\s+with\s+message|\s+say)?\s+(.+)$/i);
  if (waMatch) {
    const contact = waMatch[1].replace(/on whatsapp/i, '').trim();
    const messageText = waMatch[2].trim();
    return { type: 'WHATSAPP_MESSAGE', contact, messageText };
  }

  // Read messages
  if (/(?:read|check|show|soma)\s+(?:my\s+)?(?:whatsapp\s+)?(?:new\s+|last\s+)?messages/i.test(cleaned)) {
    return { type: 'READ_MESSAGES' };
  }

  // ==========================================
  // 14. SMART LIGHTS
  // ==========================================
  const lightMatch = cleaned.match(/turn\s+(on|off)\s+(?:the\s+)?(.+?)(?:\s+lights?|\s+lamp)?$/i);
  if (lightMatch) {
    const action = lightMatch[1].toLowerCase() as 'on' | 'off';
    const room = lightMatch[2].trim();
    return { type: 'SMART_LIGHT', action, roomOrLight: room };
  }

  const lightBrightnessMatch = cleaned.match(/(?:set|dim)\s+(?:the\s+)?(.+?)\s+(?:lights?\s+)?to\s+(\d+)%?/i);
  if (lightBrightnessMatch) {
    const room = lightBrightnessMatch[1].trim();
    const value = parseInt(lightBrightnessMatch[2], 10);
    return { type: 'SMART_LIGHT', action: 'dim', roomOrLight: room, value };
  }

  const lightColorMatch = cleaned.match(/(?:set|change)\s+(?:the\s+)?(.+?)\s+(?:lights?\s+)?to\s+(warm|white|red|blue|green|amber|purple)/i);
  if (lightColorMatch) {
    const room = lightColorMatch[1].trim();
    const color = lightColorMatch[2].trim();
    return { type: 'SMART_LIGHT', action: 'color', roomOrLight: room, value: color };
  }

  // ==========================================
  // 15. SMART THERMOSTAT
  // ==========================================
  const tempMatch = cleaned.match(/(?:set|change)\s+(?:the\s+)?(?:temperature|thermostat|ac|heat)\s+to\s+(\d+)/i);
  if (tempMatch) {
    const targetTemp = parseInt(tempMatch[1], 10);
    return { type: 'SMART_THERMOSTAT', targetTemp };
  }

  // ==========================================
  // 16. SMART LOCKS
  // ==========================================
  const lockMatch = cleaned.match(/(lock|unlock)\s+(?:the\s+)?(front door|garage|back door|door)/i);
  if (lockMatch) {
    const action = lockMatch[1].toLowerCase() as 'lock' | 'unlock';
    const door = lockMatch[2].trim();
    return { type: 'SMART_LOCK', action, doorName: door };
  }

  // ==========================================
  // 17. SMART BLINDS
  // ==========================================
  const blindsMatch = cleaned.match(/(open|close)\s+(?:the\s+)?(?:window\s+)?blinds/i);
  if (blindsMatch) {
    const action = blindsMatch[1].toLowerCase() as 'open' | 'close';
    return { type: 'SMART_BLINDS', action };
  }

  // ==========================================
  // 18. SMART VACUUM
  // ==========================================
  const vacuumMatch = cleaned.match(/(start|run|stop|dock|send home)\s+(?:the\s+)?(?:robot\s+)?vacuum/i);
  if (vacuumMatch) {
    const verb = vacuumMatch[1].toLowerCase();
    const action = verb === 'start' || verb === 'run' ? 'start' : verb === 'dock' || verb === 'send home' ? 'dock' : 'stop';
    return { type: 'SMART_VACUUM', action };
  }

  // ==========================================
  // 19. PHONE FLASHLIGHT
  // ==========================================
  const flashMatch = cleaned.match(/turn\s+(on|off)\s+(?:the\s+)?flashlight/i);
  if (flashMatch) {
    const action = flashMatch[1].toLowerCase() as 'on' | 'off';
    return { type: 'PHONE_FLASHLIGHT', action };
  }
  if (/toggle flashlight|flashlight/i.test(cleaned)) {
    return { type: 'PHONE_FLASHLIGHT', action: 'toggle' };
  }

  // ==========================================
  // 20. BATTERY & TIME
  // ==========================================
  if (/(?:what is|check|how much is)\s+(?:my\s+|the\s+)?battery/i.test(cleaned) || cleaned === 'battery') {
    return { type: 'PHONE_BATTERY' };
  }
  if (/what time is it|what is the time|current time|clock|what time/i.test(cleaned)) {
    return { type: 'PHONE_TIME' };
  }

  // ==========================================
  // 21. READ SCREEN
  // ==========================================
  if (/read\s+(?:the\s+|my\s+)?screen|what\s+is\s+on\s+(?:the\s+)?screen/i.test(cleaned)) {
    return { type: 'READ_SCREEN' };
  }

  // Default: Open-ended conversational query
  return { type: 'CONVERSATIONAL', query: cleaned };
}

