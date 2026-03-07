import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";
import "./Chat.css";
import { summarizeConversation, joinSuggestion } from "./ai";
import Densel from "./Densel";

type Message = {
  id: string;
  content: string;
  user_id: string;
  group_id: number;
};

export default function Chat({ groupId, goBack }: any) {

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [denselText, setDenselText] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const username = localStorage.getItem("kards_username") || "anonymous";

  // Autofocus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /*
  ==========================
  LOAD MESSAGES
  ==========================
  */

  useEffect(() => {

    async function loadMessages() {

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);

    }

    loadMessages();

  }, [groupId]);

  /*
  ==========================
  REALTIME CHAT
  ==========================
  */

  useEffect(() => {

    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        (payload) => {

          const msg = payload.new as Message;

          if (msg.group_id === groupId) {
            setMessages((prev) => [...prev, msg]);
          }

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [groupId]);

  /*
  ==========================
  AUTO SCROLL
  ==========================
  */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /*
  ==========================
  SEND MESSAGE
  ==========================
  */

  async function sendMessage() {

    if (!text.trim()) return;

    await supabase.from("messages").insert({
      group_id: groupId,
      content: text.trim(),
      user_id: username
    });

    setText("");

  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  /*
  ==========================
  UPDATE SUMMARY
  ==========================
  */

  async function updateSummary() {

    if (messages.length < 3) return;

    const texts = messages
      .slice(-20)
      .map(m => `${m.user_id}: ${m.content}`);

    const summary = await summarizeConversation(texts);

    await supabase
      .from("kard_summaries")
      .upsert({
        group_id: groupId,
        summary: summary
      }, {
        onConflict: "group_id"
      });

  }

  /*
  ==========================
  RUN SUMMARY EVERY 2 MIN
  ==========================
  */

  useEffect(() => {

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      updateSummary();
    }, 120000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

  }, [messages]);

  /*
  ==========================
  DENSEL SUGGESTION
  ==========================
  */

  useEffect(() => {

    async function generateSuggestion() {

      if (messages.length < 3) return;

      const texts = messages
        .slice(-15)
        .map(m => `${m.user_id}: ${m.content}`);

      const suggestion = await joinSuggestion(texts);

      setDenselText(suggestion);
    }

    generateSuggestion();

  }, [messages]);

  /*
  ==========================
  UI
  ==========================
  */

  return (
    <div className="chat-container">

      <div className="chat-header">
        <button onClick={goBack}>Back</button>
        <h2>Group Chat</h2>
      </div>

      <div className="messages">

        {messages.map((m) => {

          const isMe = m.user_id === username;

          return (
            <div
              key={m.id}
              className={`message ${isMe ? "me" : "other"}`}
            >
              <div className="bubble">

                {!isMe && (
                  <div className="user">{m.user_id}</div>
                )}

                {m.content}

              </div>
            </div>
          );

        })}

        <div ref={bottomRef}></div>

      </div>

      <div className="chat-input">

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type message..."
        />

        <button onClick={sendMessage}>
          ➤
        </button>

      </div>

      {/* AI Assistant */}
      <Densel text={denselText} />

    </div>
  );
}