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

  /*
  ==========================
  CHECK LOGIN
  ==========================
  */

  useEffect(() => {

    async function checkSession() {

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setLoggedIn(true);
      }

    }

    checkSession();

  }, []);

  /*
  ==========================
  LOAD KARDS
  ==========================
  */

  useEffect(() => {

    if (!loggedIn) return;

    async function init() {

      const { data: kardData, error } = await supabase
        .from("kard_summaries")
        .select("*")
        .order("group_id", { ascending: true });

      console.log("Loaded kard summaries:", kardData, error);

      if (!kardData) return;

      // Remove duplicates by group_id
      const unique: Record<number, Kard> = {};

      kardData.forEach((k: Kard) => {
        unique[k.group_id] = k;
      });

      const uniqueKards = Object.values(unique);

      // Limit to 3 kards
      setKards(uniqueKards.slice(0, 3));

    }

    init();

    startSummarizer();

  }, [loggedIn]);

  /*
  ==========================
  REALTIME SUMMARY UPDATES
  ==========================
  */

  useEffect(() => {

    if (!loggedIn) return;

    const channel = supabase
      .channel("kard_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kard_summaries"
        },
        (payload) => {

          const updated = payload.new as Kard;

          setKards((prev) => {

            const filtered = prev.filter(
              (k) => k.group_id !== updated.group_id
            );

            return [...filtered, updated].slice(0, 3);

          });

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [loggedIn]);

  /*
  ==========================
  NAVIGATION
  ==========================
  */

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

  /*
  ==========================
  LOGIN SCREEN
  ==========================
  */

  if (!loggedIn) {
    return <Auth onLogin={() => setLoggedIn(true)} />;
  }

  /*
  ==========================
  CHAT SCREEN
  ==========================
  */

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

  /*
  ==========================
  KARD SELECTION SCREEN
  ==========================
  */

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
              key={kard.group_id}
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