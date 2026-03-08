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

const POSITIONS = [
  { x: 50, y: 12, tilt: 0 },
  { x: 82, y: 58, tilt: 18 },
  { x: 18, y: 58, tilt: -18 },
];

const ROTATE_INTERVAL = 10000;

function App() {

  const [kards, setKards] = useState<Kard[]>([]);
  const [selectedKard, setSelectedKard] = useState<Kard | null>(null);
  const [chatGroup, setChatGroup] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const [posIndex, setPosIndex] = useState([0, 1, 2]);

  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  /* LOGIN CHECK */

  useEffect(() => {

    async function checkSession() {

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setLoggedIn(true);
      } else {
        setLoading(false);
      }

    }

    checkSession();

  }, []);

  /* LOAD KARDS */

  useEffect(() => {

    if (!loggedIn) return;

    async function init() {

      const { data: kardData } = await supabase
        .from("kard_summaries")
        .select("*")
        .order("group_id", { ascending: true });

      if (kardData) {

        const unique: Record<number, Kard> = {};

        kardData.forEach((k: Kard) => {
          unique[k.group_id] = k;
        });

        setKards(Object.values(unique).slice(0, 3));

      }

      setLoading(false);

      startSummarizer();

    }

    init();

  }, [loggedIn]);

  /* INTRO SCREEN TIMER */

  useEffect(() => {

    if (!loggedIn) return;

    const timer = setTimeout(() => {

      setShowIntro(false);

    }, 7000); // 7 seconds

    return () => clearTimeout(timer);

  }, [loggedIn]);

  /* KARD ROTATION */

  useEffect(() => {

    if (loading || showIntro) return;

    const interval = setInterval(() => {

      setPosIndex(prev => [
        prev[2],
        prev[0],
        prev[1],
      ]);

    }, ROTATE_INTERVAL);

    return () => clearInterval(interval);

  }, [loading, showIntro]);

  /* REALTIME KARD UPDATES */

  useEffect(() => {

    if (!loggedIn) return;

    const channel = supabase
      .channel("kard_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kard_summaries" },
        (payload) => {

          const updated = payload.new as Kard;

          setKards(prev => {

            const filtered = prev.filter(
              k => k.group_id !== updated.group_id
            );

            return [...filtered, updated].slice(0, 3);

          });

        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);

  }, [loggedIn]);

  /* INTERACTION */

  const openKard = (kard: Kard) => setSelectedKard(kard);
  const closeKard = () => setSelectedKard(null);
  const enterChat = () => {
    if (selectedKard) setChatGroup(selectedKard.group_id);
  };

  /* AUTH SCREEN */

  if (!loggedIn && !loading) {
    return <Auth onLogin={() => setLoggedIn(true)} />;
  }

  /* INTRO SCREEN */

  if (showIntro) {

    return (

      <div className="intro-screen">

        <h1 className="intro-title">
          Welcome to Kochi's Kards
        </h1>

        <p className="intro-subtitle">
          Anonymous group chats to meet new people and sharpen your social skills.
        </p>

      </div>

    );

  }

  /* CHAT SCREEN */

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

  /* MAIN UI */

  return (

    <div className="app">

      {!selectedKard && (

        <div className="arc-scene">

          <svg className="arc-svg" viewBox="0 0 400 400">
            <ellipse
              cx="200"
              cy="195"
              rx="138"
              ry="122"
              fill="none"
              stroke="rgba(30,28,25,0.12)"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
          </svg>

          {kards.map((kard, index) => {

            const slot = POSITIONS[posIndex[index] ?? 0];

            return (

              <div
                key={kard.group_id}
                className="arc-kard"
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  transform: `translate(-50%, -50%) rotate(${slot.tilt}deg)`
                }}
                onClick={() => openKard(kard)}
              >
                <p>{kard.summary}</p>
              </div>

            );

          })}

          <div className="arc-title-wrap">
            <h1 className="arc-title">KARDS</h1>
          </div>

        </div>

      )}

      {selectedKard && (

        <div className="expanded-kard">

          <p className="summary">{selectedKard.summary}</p>

          <div className="buttons">

            <button onClick={closeKard}>
              Back
            </button>

            <button className="primary" onClick={enterChat}>
              Enter Chat
            </button>

          </div>

        </div>

      )}

    </div>

  );

}

export default App;