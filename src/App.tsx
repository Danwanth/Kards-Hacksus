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

// Fixed positions on the circle (top, bottom-right, bottom-left)
const POSITIONS = [
  { x: 50, y: 12, tilt: 0 },       // top center
  { x: 82, y: 58, tilt: 18 },      // bottom right
  { x: 18, y: 58, tilt: -18 },     // bottom left 
];

const ROTATE_INTERVAL = 10000; // ms

function App() {
  const [kards, setKards] = useState<Kard[]>([]);
  const [selectedKard, setSelectedKard] = useState<Kard | null>(null);
  const [chatGroup, setChatGroup] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  // posIndex[i] = which POSITION slot card i currently occupies
  const [posIndex, setPosIndex] = useState([0, 1, 2]);

  /* ── Clockwise rotation every 5s ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setPosIndex(prev => [
        // each card moves to the next position clockwise
        (prev[0] + 1) % 3,
        (prev[1] + 1) % 3,
        (prev[2] + 1) % 3,
      ]);
    }, ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  /* ── Check Login ── */
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) setLoggedIn(true);
    }
    checkSession();
  }, []);

  /* ── Load Kards ── */
  useEffect(() => {
    if (!loggedIn) return;
    async function init() {
      const { data: kardData, error } = await supabase
        .from("kard_summaries")
        .select("*")
        .order("group_id", { ascending: true });
      console.log("Loaded kard summaries:", kardData, error);
      if (!kardData) return;
      const unique: Record<number, Kard> = {};
      kardData.forEach((k: Kard) => { unique[k.group_id] = k; });
      setKards(Object.values(unique).slice(0, 3));
    }
    init();
    startSummarizer();
  }, [loggedIn]);

  /* ── Realtime updates ── */
  useEffect(() => {
    if (!loggedIn) return;
    const channel = supabase
      .channel("kard_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "kard_summaries" },
        (payload) => {
          const updated = payload.new as Kard;
          setKards((prev) => {
            const filtered = prev.filter((k) => k.group_id !== updated.group_id);
            return [...filtered, updated].slice(0, 3);
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loggedIn]);

  const openKard = (kard: Kard) => setSelectedKard(kard);
  const closeKard = () => setSelectedKard(null);
  const enterChat = () => { if (selectedKard) setChatGroup(selectedKard.group_id); };

  if (!loggedIn) return <Auth onLogin={() => setLoggedIn(true)} />;

  if (chatGroup) {
    return (
      <Chat groupId={chatGroup} goBack={() => { setChatGroup(null); setSelectedKard(null); }} />
    );
  }

  return (
    <div className="app">

      {!selectedKard && (
        <div className="arc-scene">

          <svg className="arc-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <ellipse
              cx="200" cy="195"
              rx="138" ry="122"
              fill="none"
              stroke="rgba(30,28,25,0.12)"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
          </svg>

          {kards.length === 0 && (
            <p className="loading-text">Loading summaries…</p>
          )}

          {kards.map((kard, index) => {
            const slot = POSITIONS[posIndex[index]];
            return (
              <div
                key={kard.group_id}
                className="arc-kard"
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  transform: `translate(-50%, -50%) rotate(${slot.tilt}deg)`,
                }}
                onClick={() => openKard(kard)}
              >
                <p>{kard.summary.substring(0, 60)}…</p>
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
            <button onClick={closeKard}>Back</button>
            <button className="primary" onClick={enterChat}>Enter Chat</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;