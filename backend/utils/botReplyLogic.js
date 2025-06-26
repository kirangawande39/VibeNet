// utils/botReplyLogic.js

// Language strings for multilingual support
const responses = {
  en: {
    emptyInput: "😐 Please type something so I can respond!",
    greeting: "👋 Hello! How can I help you today?",
    help: "🛠️ Sure! Please ask about app features or commands.",
    features: "📚 I can chat, explain app features, or provide company information!",
    website: "🌐 This is a social media website where users can post, chat, share stories, and follow others. Supports ",
    developer: "👨‍💻 This website was developed by Kiran Gawande - a passionate MERN stack developer from India!",
    name: "🤖 My name is Vibebot! You can call me chatbot or friend 😊",
    thanks: "😊 You're welcome!",
    goodbye: "👋 Goodbye! Have a great day!",
    default: "🤖 I'm still learning... Please ask a clear question!",
    postHelp: "📝 To create a post, go to your profile and click the 'Create Post' button. Then upload your photo and write a caption!",

    storyHelp: "📸 To share a story, go to your profile and tap the '+' icon near 'Your Story', then choose a photo or video to upload!",

    followHelp: "👥 To follow someone, visit their profile and click the 'Follow' button.",
    chatHelp: "💬 Want to chat? Go to the Chat section and select a friend to start talking!",
    joke: "😂 Why don't developers like nature? It has too many bugs.",
    funFact: "🤓 Fun Fact: The MERN stack includes MongoDB, Express, React, and Node.js!",
    tip: "💡 Tip: Keep your profile updated so friends recognize you easily!",
    welcomeBack: "👋 Welcome back! Glad to see you again!",
    error: "⚠️ Oops! Something went wrong. Please try again later.",

    naughty: "😏 Arre bhai, main to AI hoon, setting meri RAM ke saath hai 🤖💘",
    moodOff: "😔 Hey, take a deep breath. You're not alone. Chal ek smile de... duniya badal jayegi 😊",
    loveProblem: "💔 Bhai pyaar ka toh scene hi alag hai... Lekin tension na le, waqt sab thik kar deta hai. Tu strong hai! 💪",
    motivation: "🔥 Every champion was once a contender who refused to give up. Tu bhi wahi fire hai bhai! 🔥",
    roastMe: "🔥 Bro, agar brain ek app hota toh tera version ab tak uninstall ho gaya hota 😎",
    confidenceBoost: "💪 You’ve got this! Confidence ka booster main hoon. Just believe in yourself – rest sab ho jayega!",

    howToStart: "Website  chalane ke liye pehle apni profile setup karo, phir 'Search User' tab me jaake naye log dhoondo.",
    findUsers: "Naye users dekhne ke liye 'Search' tab ka use karo.",
    sendMessage: "Message bhejne ke liye apni chat list open karo and user select kar ke chat karo ",
    profileSetup: "Profile update karne ke liye apne profile me jao edit profile button click karo aur photo, name, aur bio change karo.",







  },
  hi: {
    emptyInput: "😐 कृपया कुछ टाइप करें ताकि मैं जवाब दे सकूँ!",
    greeting: "👋 नमस्ते! मैं कैसे मदद कर सकता हूँ?",
    help: "🛠️ जरूर! कृपया ऐप की सुविधाओं या कमांड के बारे में पूछें।",
    features: "📚 मैं चैट कर सकता हूँ, ऐप की सुविधाएँ समझा सकता हूँ, या कंपनी की जानकारी दे सकता हूँ!",
    website: "🌐 यह एक सोशल मीडिया वेबसाइट है, जहाँ उपयोगकर्ता पोस्ट, चैट, स्टोरी शेयर कर सकते हैं और दूसरों को फॉलो कर सकते हैं।",
    developer: "👨‍💻 इस वेबसाइट को किरण गवांडे ने विकसित किया है - भारत के एक उत्साही MERN स्टैक डेवलपर!",
    name: "🤖 मेरा नाम वाइबबोट है! आप मुझे चैटबॉट या दोस्त कह सकते हैं 😊",
    thanks: "😊 आपका स्वागत है!",
    goodbye: "👋 अलविदा! आपका दिन शुभ हो!",
    default: "🤖 मैं अभी सीख रहा हूँ... कृपया स्पष्ट प्रश्न पूछें!",
    postHelp: "📝 पोस्ट बनाने के लिए नीचे '+' आइकन पर टैप करें और फोटो या मैसेज जोड़ें!",
    storyHelp: "📸 स्टोरी शेयर करने के लिए 'Your Story' पर टैप करें और मीडिया चुनें।",
    followHelp: "👥 किसी को फॉलो करने के लिए उनकी प्रोफाइल पर जाकर 'Follow' बटन दबाएं।",
    chatHelp: "💬 चैट करने के लिए Chat सेक्शन में जाएं और किसी फ्रेंड को चुनें।",
    joke: "😂 डेवेलपर्स को नेचर पसंद क्यों नहीं? क्योंकि वहाँ बहुत सारे बग्स होते हैं!",
    funFact: "🤓 मजेदार तथ्य: MERN स्टैक में MongoDB, Express, React, और Node.js शामिल हैं!",
    tip: "💡 सुझाव: अपनी प्रोफाइल अपडेट रखें ताकि फ्रेंड्स आपको पहचान सकें!",
    welcomeBack: "👋 फिर से स्वागत है! आपको फिर देखकर अच्छा लगा!",
    error: "⚠️ ओह! कुछ गलत हो गया। कृपया दोबारा प्रयास करें।",
    confidenceBoost: "💪 तू कर सकता है! थोड़ा यकीन खुद पे रख, बाकी सब अपने आप सेट हो जाएगा।",
    roastMe: "🔥 भाई, अगर दिमाग एक ऐप होता तो तेरा वर्जन अब तक अनइंस्टॉल हो गया होता 😎",
    motivation: "🔥 हर चैंपियन कभी एक नया खिलाड़ी था जिसने हार मानने से इनकार कर दिया। तू भी वो आग है भाई! 🔥",
    moodOff: "😔 एक गहरी सांस ले भाई, तू अकेला नहीं है। ज़िंदगी हसीन है, बस मुस्कुरा 😊",
    loveProblem: "💔 भाई प्यार का मामला थोड़ा टेढ़ा होता है... लेकिन चिंता मत कर, वक़्त सब सही कर देता है। तू स्ट्रॉन्ग है! 💪"






  },
  mr: {
    emptyInput: "😐 कृपया काहीतरी टाइप करा जेणेकरून मी प्रतिसाद देऊ शकेन!",
    greeting: "👋 नमस्कार! मी कशी मदत करू शकतो?",
    help: "🛠️ नक्की! कृपया अ‍ॅपच्या वैशिष्ट्यांविषयी किंवा आज्ञाविषयी विचारा.",
    features: "📚 मी चॅट करू शकतो, अ‍ॅपची वैशिष्ट्ये समजावून सांगू शकतो किंवा कंपनीची माहिती देऊ शकतो!",
    website: "🌐 ही एक सोशल मीडिया वेबसाइट आहे, जिथे वापरकर्ते पोस्ट, चॅट, कथा शेअर करू शकतात आणि इतरांना फॉलो करू शकतात.",
    developer: "👨‍💻 ही वेबसाइट किरण गवांडे यांनी विकसित केली आहे - भारतातील एक उत्साही MERN स्टॅक डेव्हलपर!",
    name: "🤖 माझे नाव वायबबॉट आहे! तुम्ही मला चॅटबॉट किंवा मित्र म्हणू शकता 😊",
    thanks: "😊 तुमचे स्वागत आहे!",
    goodbye: "👋 निरोप! तुमचा दिवस छान जावो!",
    default: "🤖 मी अजून शिकत आहे... कृपया स्पष्ट प्रश्न विचारा!",
    postHelp: "📝 पोस्ट तयार करण्यासाठी खालील '+' आयकॉनवर टॅप करा आणि फोटो किंवा मेसेज टाका!",
    storyHelp: "📸 स्टोरी शेअर करायची आहे? 'Your Story' वर टॅप करा आणि मीडिया निवडा!",
    followHelp: "👥 एखाद्याला फॉलो करायचं असल्यास त्यांच्या प्रोफाइलवर जाऊन 'Follow' बटण दाबा.",
    chatHelp: "💬 चॅट करायचंय? Chat विभागात जा आणि मित्र निवडा!",
    joke: "😂 डेव्हलपर्सना निसर्ग का आवडत नाही? कारण तिथे खूप बग्स असतात!",
    funFact: "🤓 माहिती: MERN स्टॅकमध्ये MongoDB, Express, React आणि Node.js येतात!",
    tip: "💡 टीप: तुमची प्रोफाइल अपडेट ठेवा म्हणजे मित्र तुम्हाला ओळखू शकतील!",
    welcomeBack: "👋 पुन्हा स्वागत आहे! तुम्हाला परत पाहून आनंद झाला!",
    error: "⚠️ अरे! काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
    loveProblem: "💔 भाऊ, प्रेम म्हणजे भारी गोष्ट आहे... पण काळ सर्व ठीक करतो. तू जबरदस्त आहेस! 💪",
    moodOff: "😔 एक दीर्घ श्वास घे भाऊ, तू एकटाच नाहीस. एक स्माईल दे, जग बदलून जाईल 😊",
    motivation: "🔥 प्रत्येक चॅम्पियन कधी तरी एक नवीन सुरुवात करणारा होता. तू पण तीच ज्वाला आहेस भाऊ! 🔥",
    roastMe: "🔥 भाऊ, मेंदू जर अ‍ॅप असता तर तुझं व्हर्जन आतापर्यंत अनइंस्टॉल झालं असतं 😎",
    confidenceBoost: "💪 तू करू शकतोस! स्वतःवर विश्वास ठेव... बाकी सगळं आपोआप होईल!"




  }
};

// Intent detection patterns
const intents = [
  { name: 'greeting', patterns: ['hello', 'hi','ok','hey', 'namaste', 'नमस्ते', 'नमस्कार', 'kya haal hai', 'kaise ho', 'what’s up', 'howdy'], responseKeys: ['greeting'] },

  { name: 'help', patterns: ['help', 'madad', 'सहाय्य', 'मदत', 'सहायता', 'batao', 'guide kar', 'kaise kare', 'need assistance', 'can you help'], responseKeys: ['help'] },

  { name: 'features', patterns: ['feature', 'kya kar sakte ho', 'functionality', 'वैशिष्ट्य', 'कार्यक्षमता', 'app me kya hai', 'features kya hai', 'what can you do', 'tell me about features'], responseKeys: ['features'] },

  { name: 'website', patterns: ['website', 'tumhare bare me batao', 'vibenet', 'वेबसाइट', 'तुमच्याबद्दल सांगा', 'app kisliye hai', 'what is this site', 'tell me about the website'], responseKeys: ['website'] },

  { name: 'developer', patterns: ['developer', 'bhai tera owner kon hai ', 'owner', 'who is develop you', 'tera malik kon hai', 'kisne banaya', 'developed', 'डेव्हलपर', 'कोणी बनवले', 'banaya kisne', 'who created this', 'who made this'], responseKeys: ['developer'] },

  { name: 'name', patterns: ['your name', 'tu kon hai ', 'tera nam kya hai ', 'tumhara naam', 'nav kay', 'तुझं नाव', 'तुमचे नाव', 'naam kya hai', 'what should I call you', 'tera nam kya hai ', 'what is your name ',], responseKeys: ['name'] },

  { name: 'thanks', patterns: ['thanks', 'shukriya', 'dhanyavad', 'धन्यवाद', 'आभार', 'thank you', 'thanx', 'appreciate it'], responseKeys: ['thanks'] },

  { name: 'goodbye', patterns: ['bye', 'alvida', 'by', 'nighato', 'goodbye', 'बाय', 'अलविदा', 'निरोप', 'chal fir milte', 'see you later'], responseKeys: ['goodbye'] },

  { name: 'postHelp', patterns: ['how to post', 'how to create post', 'post kaise kare', 'पोस्ट कशी करायची', 'post banana hai', 'bhai post daalni hai', 'how do I post'], responseKeys: ['postHelp'] },

  { name: 'storyHelp', patterns: ['how to share story', 'how to create story', 'how to upload story', 'story kaise dale ', 'story', 'स्टोरी कशी', 'स्टोरी', 'story daalni hai', 'apni story kaise daale', 'how do I share a story'], responseKeys: ['storyHelp'] },

  { name: 'followHelp', patterns: ['how to follow', 'follow kaise', 'bhai kisi new user ko follow kaise kare', 'फॉलो कसं', 'follow kar', 'kise follow kare', 'user follow karna hai', 'how do I follow someone'], responseKeys: ['followHelp'] },

  { name: 'chatHelp', patterns: ['how to chat', 'chat kaise', 'chat kar', 'चॅट कशी', 'baat kaise karte', 'msg bhejna hai', 'how do I chat'], responseKeys: ['chatHelp'] },

  { name: 'joke', patterns: ['joke', 'joke sunao', 'मजेदार', 'विनोद', 'koi joke suna', 'hasao yaar', 'tell me a joke'], responseKeys: ['joke'] },

  { name: 'funFact', patterns: ['fun fact', 'interesting fact', 'fact batao', 'kuch alag batao', 'kya interesting hai', 'tell me something interesting'], responseKeys: ['funFact'] },

  { name: 'tip', patterns: ['tip', 'suggestion', 'profile tip', 'kya sujhav hai', 'kya best kare profile ke liye', 'give me a tip'], responseKeys: ['tip'] },

  { name: 'welcomeBack', patterns: ['i am back', 'wapis aa gaya', 'मी परत आलो', 'fir aa gaya', 'dubara aaya hu', 'I’m back'], responseKeys: ['welcomeBack'] },

  { name: 'error', patterns: ['error', 'problem', 'issue', 'समस्या', 'kaam nahi kar raha', 'kuch gadbad hai', 'I have a problem', 'something went wrong'], responseKeys: ['error'] },
  {
    name: 'loveProblem',
    patterns: ['love problem', 'meri gf mujhse naraz hai', 'breakup ho gaya', 'dil toota hai', 'usne mujhe chhod diya', 'mujhe uski yaad aa rahi hai', 'love tips'],
    responseKeys: ['loveProblem']
  },
  {
    name: 'moodOff',
    patterns: ['mood off hai', 'man nahi lag raha', 'bura lag raha hai', 'udaas hoon', 'dukhi hoon', 'sad feel ho raha hai'],
    responseKeys: ['moodOff']
  }
  ,
  {
    name: 'motivation',
    patterns: ['motivate me', 'kuch motivation do', 'himmat tut gayi', 'maza nahi aa raha', 'jeevan se thak gaya', 'give me hope'],
    responseKeys: ['motivation']
  }
  , {
    name: 'roastMe',
    patterns: ['roast me', 'mujhe roast kar', 'meri bezati kar', 'meri bajao'],
    responseKeys: ['roastMe']
  },
  {
    name: 'confidenceBoost',
    patterns: ['main kar sakta hoon?', 'mujhse nahi hoga', 'i can’t do it', 'i’m not good enough', 'confidence nahi hai'],
    responseKeys: ['confidenceBoost']
  },
  {
    name: 'naughty',
    patterns: ['naughty bot', 'besharam', 'flirt kar raha hai', 'aise mat bol', 'arey wah bot', 'setting hai kya'],
    responseKeys: ['naughty']
  },
  {
  name: 'howToStart',
  patterns: [
    'how to use this website',
    'how to use this app',
    'kaise shuru karu',
    'shuruaat kaise kare',
    'start kese karna hai',
    'मुलगा मुलगी कशी सापडेल',
    'kaise kaam karta hai',
    'pahla msg kaise bheje'
  ],
  responseKeys: ['howToStart']
},

{
  name: 'findUsers',
  patterns: [
    'how to find user',
    'how to find new user',
    'new users kaise milenge',
    'new people find',
    'users kaise dhoonde',
    'log kaise dikhte hai',
    'chat karne wale kaise milte',
    'search option kaha hai',
    'नवे युजर कुठे आहेत'
  ],
  responseKeys: ['findUsers']
},

{
  name: 'sendMessage',
  patterns: [
    'how to send message',
    'message kaise bheje',
    'msg bhejna hai',
    'kaise message kare',
    'send karna hai',
    'sandesh kasa pathavava',
    'how to send message',
    'baat karna hai'
  ],
  responseKeys: ['sendMessage']
},

{
  name: 'profileSetup',
  patterns: [
    'how to set profile',
    'profile kaise banaye',
    'profile edit kaise kare',
    'bio change kaise kare',
    'profile pic kaise lagaye',
    'set profile',
    'setup my account',
    'प्रोफाईल सेटिंग कुठे आहे'
  ],
  responseKeys: ['profileSetup']
}




];


// Detect user's language preference (simple detection)
function detectLanguage(text) {
  const hindiRegex = /[\u0900-\u097F]/;
  const marathiRegex = /[\u0900-\u097F]/; // Same Unicode block as Hindi

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
    const responseKey = intent.responseKeys[Math.floor(Math.random() * intent.responseKeys.length)];
    return responses[language][responseKey] || responses.en[responseKey];
  }

  return responses[language].default || responses.en.default;
}

module.exports = { generateBotReply };
