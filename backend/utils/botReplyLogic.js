// utils/botReplyLogic.js

// Language strings for multilingual support
const responses = {
  en: {
    emptyInput: "😐 Please type something so I can respond!",
    greeting: "👋 Hello! How can I help you today?",
    help: "🛠️ Sure! Please ask about app features or commands.",
    features: "📚 I can chat, explain app features, or provide company information!",
    website: "🌐 This is a social media website where users can post, chat, share stories, and follow others. Supports Marathi-Hindi-English!",
    developer: "👨‍💻 This website was developed by Kiran Gawande - a passionate MERN stack developer from India!",
    name: "🤖 My name is Vibebot! You can call me chatbot or friend 😊",
    thanks: "😊 You're welcome!",
    goodbye: "👋 Goodbye! Have a great day!",
    default: "🤖 I'm still learning... Please ask a clear question!"
  },
  hi: {
    emptyInput: "😐 कृपया कुछ टाइप करें ताकि मैं जवाब दे सकूँ!",
    greeting: "👋 नमस्ते! मैं कैसे मदद कर सकता हूँ?",
    help: "🛠️ जरूर! कृपया ऐप की सुविधाओं या कमांड के बारे में पूछें।",
    features: "📚 मैं चैट कर सकता हूँ, ऐप की सुविधाएँ समझा सकता हूँ, या कंपनी की जानकारी दे सकता हूँ!",
    website: "🌐 यह एक सोशल मीडिया वेबसाइट है, जहाँ उपयोगकर्ता पोस्ट, चैट, स्टोरी शेयर कर सकते हैं और दूसरों को फॉलो कर सकते हैं। मराठी-हिंदी-अंग्रेजी समर्थित!",
    developer: "👨‍💻 इस वेबसाइट को किरण गवांडे ने विकसित किया है - भारत के एक उत्साही MERN स्टैक डेवलपर!",
    name: "🤖 मेरा नाम वाइबबोट है! आप मुझे चैटबॉट या दोस्त कह सकते हैं 😊",
    thanks: "😊 आपका स्वागत है!",
    goodbye: "👋 अलविदा! आपका दिन शुभ हो!",
    default: "🤖 मैं अभी सीख रहा हूँ... कृपया स्पष्ट प्रश्न पूछें!"
  },
  mr: {
    emptyInput: "😐 कृपया काहीतरी टाइप करा जेणेकरून मी प्रतिसाद देऊ शकेन!",
    greeting: "👋 नमस्कार! मी कशी मदत करू शकतो?",
    help: "🛠️ नक्की! कृपया अ‍ॅपच्या वैशिष्ट्यांविषयी किंवा आज्ञाविषयी विचारा.",
    features: "📚 मी चॅट करू शकतो, अ‍ॅपची वैशिष्ट्ये समजावून सांगू शकतो किंवा कंपनीची माहिती देऊ शकतो!",
    website: "🌐 ही एक सोशल मीडिया वेबसाइट आहे, जिथे वापरकर्ते पोस्ट, चॅट, कथा शेअर करू शकतात आणि इतरांना फॉलो करू शकतात. मराठी-हिंदी-इंग्रजी समर्थित!",
    developer: "👨‍💻 ही वेबसाइट किरण गवांडे यांनी विकसित केली आहे - भारतातील एक उत्साही MERN स्टॅक डेव्हलपर!",
    name: "🤖 माझे नाव वायबबॉट आहे! तुम्ही मला चॅटबॉट किंवा मित्र म्हणू शकता 😊",
    thanks: "😊 तुमचे स्वागत आहे!",
    goodbye: "👋 निरोप! तुमचा दिवस छान जावो!",
    default: "🤖 मी अजून शिकत आहे... कृपया स्पष्ट प्रश्न विचारा!"
  }
};

// Intent detection patterns
const intents = [
  {
    name: 'greeting',
    patterns: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'नमस्कार'],
    responseKeys: ['greeting']
  },
  {
    name: 'help',
    patterns: ['help', 'madad', 'सहाय्य', 'मदत', 'सहायता'],
    responseKeys: ['help']
  },
  {
    name: 'features',
    patterns: ['feature', 'kya kar sakte ho', 'functionality', 'वैशिष्ट्य', 'कार्यक्षमता'],
    responseKeys: ['features']
  },
  {
    name: 'website',
    patterns: ['website', 'tumhare bare me batao', 'vibenet', 'वेबसाइट', 'तुमच्याबद्दल सांगा'],
    responseKeys: ['website']
  },
  {
    name: 'developer',
    patterns: ['developer', 'kisne banaya', 'developed', 'डेव्हलपर', 'कोणी बनवले'],
    responseKeys: ['developer']
  },
  {
    name: 'name',
    patterns: ['your name', 'tumhara naam', 'nav kay', 'तुझं नाव', 'तुमचे नाव'],
    responseKeys: ['name']
  },
  {
    name: 'thanks',
    patterns: ['thanks', 'shukriya', 'dhanyavad', 'धन्यवाद', 'आभार'],
    responseKeys: ['thanks']
  },
  {
    name: 'goodbye',
    patterns: ['bye', 'alvida', 'nighato', 'goodbye', 'बाय', 'अलविदा', 'निरोप'],
    responseKeys: ['goodbye']
  }
];

// Detect user's language preference (simple detection)
function detectLanguage(text) {
  const hindiRegex = /[\u0900-\u097F]/;
  const marathiRegex = /[\u0900-\u097F]/; // Shares Unicode block with Hindi
  
  if (marathiRegex.test(text)) return 'mr';
  if (hindiRegex.test(text)) return 'hi';
  return 'en';
}

// Find matching intent
function matchIntent(text) {
  const lowerText = text.toLowerCase();
  return intents.find(intent => 
    intent.patterns.some(pattern => lowerText.includes(pattern))
  );
}

// Generate bot reply
function generateBotReply(userText) {
  const text = userText.trim();
  if (!text) return responses.en.emptyInput + ' / ' + responses.hi.emptyInput;

  const language = detectLanguage(text);
  const intent = matchIntent(text);

  if (intent) {
    // Select a random response key if multiple exist
    const responseKey = intent.responseKeys[Math.floor(Math.random() * intent.responseKeys.length)];
    return responses[language][responseKey] || responses.en[responseKey];
  }

  return responses[language].default || responses.en.default;
}

module.exports = { generateBotReply };