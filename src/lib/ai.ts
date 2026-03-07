const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

const getAIResponse = async (systemPrompt: string, userPrompt: string) => {
  if (!OPENROUTER_API_KEY) {
    console.warn("OpenRouter API Key not found. Returning fallback AI response.");
    return "Fallback AI Response";
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Using gpt-4o-mini as requested
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
};

export const generateAlias = async () => {
  const systemPrompt = "You are a naming assistant. Output only exactly one name.";
  const userPrompt = "Generate a cool anonymous username similar to gaming nicknames (e.g., SilentFox, NeonFalcon). Do not use spaces. Return only the name.";
  
  const alias = await getAIResponse(systemPrompt, userPrompt);
  return alias || `User${Math.floor(Math.random() * 1000)}`;
};

export const generateKardSummary = async (messagesText: string) => {
  if (!messagesText) return "No active discussion yet.";
  
  const systemPrompt = "You are a helpful summarizer for group chats. Return only one short sentence.";
  const userPrompt = `Summarize the discussion happening in this group chat in one sentence:\n\n${messagesText}`;
  
  const summary = await getAIResponse(systemPrompt, userPrompt);
  return summary || "Users are chatting...";
};

export const suggestDenselMessage = async (messagesText: string) => {
  const systemPrompt = "You are Densel, a helpful AI assistant inside a group chat. Keep your response very short, friendly, and helpful. Suggest exactly what the user could say depending on the context.";
  const userPrompt = `Analyze the conversation and suggest how a new user could join in.\n\nConversation:\n${messagesText}`;
  
  const suggestion = await getAIResponse(systemPrompt, userPrompt);
  return suggestion || "Looks quiet here. Why not say hello?";
};
