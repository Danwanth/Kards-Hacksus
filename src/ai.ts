const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";

/*
========================
SUMMARIZE CONVERSATION
========================
Used for kard summaries
*/

export async function summarizeConversation(messages: string[]) {

  const joined = messages.slice(-20).join("\n");

  const prompt = `
You are Densel, an AI assistant that observes group chats.

Here are recent messages from a group conversation:

${joined}

Briefly explain what people are talking about.

Rules:
- Maximum 2 sentences
- Neutral tone
- No emojis
`;

  try {

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are Densel, an AI that summarizes conversations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      }),
    });

    const data = await res.json();

    if (!data?.choices?.[0]?.message?.content) {
      return "Conversation summary unavailable.";
    }

    return data.choices[0].message.content;

  } catch (error) {

    console.error("AI summary error:", error);

    return "Densel couldn't summarize the conversation.";

  }
}


/*
========================
JOIN SUGGESTION
========================
Used for Densel chatbot
*/

export async function joinSuggestion(messages: string[]) {

  const joined = messages.slice(-15).join("\n");

  const prompt = `
You are Densel, a friendly AI that helps users join conversations.

Recent messages:

${joined}

Explain briefly what the conversation is about and suggest ONE message the user could send to join.

Rules:
- Casual tone
- Maximum 3 sentences
`;

  try {

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are Densel, an AI that helps users join conversations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6
      }),
    });

    const data = await res.json();

    if (!data?.choices?.[0]?.message?.content) {
      return "I couldn't understand the conversation yet.";
    }

    return data.choices[0].message.content;

  } catch (error) {

    console.error("AI suggestion error:", error);

    return "Hi, I'm Densel. I'm still figuring out the conversation.";

  }
}