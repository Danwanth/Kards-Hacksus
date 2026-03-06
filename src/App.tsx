import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import "./App.css";
import Chat from "./Chat";
import { startSummarizer } from "./summarizerRunner";

type Kard = {
  id: number;
  summary: string;
  group_id: number;
};

function App() {

  const [kards, setKards] = useState<Kard[]>([]);
  const [selectedKard, setSelectedKard] = useState<Kard | null>(null);
  const [chatGroup, setChatGroup] = useState<number | null>(null);

  // Initial setup
  useEffect(() => {

    async function init() {

      // test database connection
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .limit(1);

      console.log("Supabase test:", data, error);

      // load kard summaries
      const { data: kardData, error: kardError } = await supabase
        .from("kard_summaries")
        .select("*")
        .order("group_id", { ascending: true });

      console.log("Loaded kard summaries:", kardData, kardError);

      if (kardData) {
        setKards(kardData);
      }

    }

    init();

    // start AI summarizer loop
    startSummarizer();

  }, []);

  // Realtime updates for kard summaries
  useEffect(() => {

    const channel = supabase
      .channel("kard_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "kard_summaries"
        },
        (payload) => {

          const updated = payload.new as Kard;

          setKards((prev) =>
            prev.map((k) =>
              k.id === updated.id ? updated : k
            )
          );

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  const openKard = (kard: Kard) => {
    setSelectedKard(kard);
  };

  const closeKard = () => {
    setSelectedKard(null);
  };

  const enterChat = () => {
    if (selectedKard) {
      setChatGroup(selectedKard.group_id);
    }
  };

  // Chat screen
  if (chatGroup) {
    return (
      <Chat
        groupId={chatGroup}
        goBack={() => {
          setChatGroup(null);
          setSelectedKard(null);
        }}
      />
    );
  }

  return (
    <div className="app">

      <h1 className="title">KARDS</h1>

      {!selectedKard && (
        <div className="kard-container">

          {kards.length === 0 && (
            <p>Loading summaries...</p>
          )}

          {kards.map((kard, index) => (
            <div
              key={kard.id}
              className={`kard kard-${index + 1}`}
              onClick={() => openKard(kard)}
            >
              <p>{kard.summary.substring(0, 60)}...</p>
            </div>
          ))}

        </div>
      )}

      {selectedKard && (
        <div className="expanded-kard">

          <p className="summary">
            {selectedKard.summary}
          </p>

          <div className="buttons">

            <button onClick={closeKard}>
              Back
            </button>

            <button onClick={enterChat}>
              Enter Chat
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;