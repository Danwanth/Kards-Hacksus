import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import "./App.css";
import Chat from "./Chat";
import Auth from "./Auth";
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
  const [loggedIn, setLoggedIn] = useState(false);

  // Check if user already logged in
  useEffect(() => {

    async function checkSession() {

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setLoggedIn(true);
      }

    }

    checkSession();

  }, []);

  // Initial setup after login
  useEffect(() => {

    if (!loggedIn) return;

    async function init() {

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .limit(1);

      console.log("Supabase test:", data, error);

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

    startSummarizer();

  }, [loggedIn]);

  // Realtime kard summary updates
  useEffect(() => {

    if (!loggedIn) return;

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

  }, [loggedIn]);

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

  // Show login page if not logged in
  if (!loggedIn) {
    return <Auth onLogin={() => setLoggedIn(true)} />;
  }

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