import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";
import "./Chat.css";

type Message = {
  id: string;
  content: string;
  user_id: string;
  group_id: number;
};

export default function Chat({ groupId, goBack }: any) {

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Get username created during signup/login
  const username = localStorage.getItem("kards_username") || "anonymous";

  // Load existing messages
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

  // Realtime messages
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

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {

    if (!text.trim()) return;

    await supabase.from("messages").insert({
      group_id: groupId,
      content: text,
      user_id: username
    });

    setText("");

  }

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
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>
  );
}