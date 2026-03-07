const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";

/*
========================
CLEAN MESSAGES
========================
Removes spam and duplicates
*/

function preprocessMessages(messages: string[]) {

  const cleaned: string[] = [];

  const seen = new Set();

  messages.forEach(msg => {

    const trimmed = msg.trim();

    if (!trimmed) return;

    const lower = trimmed.toLowerCase();

    if (seen.has(lower)) return;

    seen.add(lower);

    cleaned.push(trimmed);

  });

  return cleaned.slice(-50);

}


/*
========================
SUMMARIZE CONVERSATION
========================
Produces clear explanation of discussion
*/

export async function summarizeConversation(messages: string[]) {

  const cleanedMessages = preprocessMessages(messages);

  const joined = cleanedMessages.join("\n");

  const prompt = `
You are Densel, an AI that summarizes group conversations.

Below are raw chat messages from a group conversation:

${joined}

Your task:
Understand the overall topic and produce a **very short summary of the discussion**.

Rules:
• Do NOT repeat or paraphrase messages
• Ignore spam or repeated phrases
• Focus only on the main topic
• Write like a conversation headline

Output format:
• ONE short sentence
• Maximum 10–12 words
• No emojis
• Neutral tone

Examples:

Messages:
"He fell from his scooter"
"Bro Densel had an accident"
"Is he okay?"
"I heard he broke his arm"

Good output:
Discussion about Densel having a scooter accident.

Messages:
"AI will take jobs"
"Bro automation already happening"
"Developers safe?"
"I think AI will replace some jobs"

Good output:
Debate about AI replacing jobs and automation.
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
            content: "You summarize conversations into short headline-style summaries."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      }),
    });

    const data = await res.json();

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return "Conversation topic unclear.";
    }

    return content.trim();

  } catch (error) {

    console.error("AI summary error:", error);

    return "Conversation topic unclear.";

  }

}


/*
========================
JOIN SUGGESTION
========================
Helps user enter conversation
*/

export async function joinSuggestion(messages: string[]) {

  const cleanedMessages = preprocessMessages(messages);

  const joined = cleanedMessages.slice(-25).join("\n");

  const prompt = `
You are Densel, an AI assistant helping users join conversations.

Recent messages:

${joined}

First understand what the conversation is about.

Then produce:

1) A short explanation of the discussion
2) ONE natural message the user could send

Rules:
• Casual tone
• Maximum 3 sentences
• Suggested message must feel natural
• Do not repeat the messages
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
            content: "You help users understand and join conversations."
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

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return "I couldn't understand the conversation yet.";
    }

    return content.trim();

  } catch (error) {

    console.error("AI suggestion error:", error);

    return "Hi, I'm Densel. I'm still figuring out the conversation.";

  }

}