const axios = require('axios');
require("dotenv").config();

const OpenRouter=process.env.OpenRouter_API_KEY;

async function getAIReply(userMessage) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mixtral-8x7b-instruct", 
      messages: [
        {
          role: "system",
          content: "You are a helpful chatbot for a social media app."
          // ✅ Aap is line ko customize kar sakte ho: chatbot ka tone ya behavior change karne ke liye
        },
        {
          role: "user",
          content: userMessage 
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${OpenRouter}`,
        
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vibe-net-two.vercel.app",
       
        "X-Title": "VibeNet"
     
      }
    }
  );

  return response.data.choices[0].message.content; 
}


module.exports = { getAIReply };