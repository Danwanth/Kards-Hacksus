import { useState, useEffect } from "react";
import "./Densel.css";

export default function Densel({ text, messages, isTyping }: any){

  const [open,setOpen] = useState(false);
  const [blink,setBlink] = useState(false);
  const [look,setLook] = useState("center");

  /*
  ==========================
  BLINK WHEN QUESTION
  ==========================
  */

  useEffect(()=>{

    if(!messages || messages.length === 0) return;

    const last = messages[messages.length-1]?.content || "";

    if(last.includes("?")){

      setBlink(true);

      setTimeout(()=>setBlink(false),200);

    }

  },[messages]);

  /*
  ==========================
  LOOK AT INPUT WHEN TYPING
  ==========================
  */

  useEffect(()=>{

    if(isTyping){

      setLook("down");

    }else{

      const interval = setInterval(()=>{

        const dirs = ["left","right","center"];
        setLook(dirs[Math.floor(Math.random()*dirs.length)]);

      },3000);

      return ()=>clearInterval(interval);

    }

  },[isTyping]);

  return(

    <div className={`densel ${open ? "active" : "idle"}`}>

      {/* LIGHTBULB */}

      {open && (
        <div className="densel-bulb">
          💡
        </div>
      )}

      {/* FACE */}

      <div
        className={`densel-face ${blink ? "blink" : ""}`}
        onClick={()=>setOpen(!open)}
      >

        <div className={`eye ${look}`}>
          <div className="pupil"></div>
        </div>

        <div className={`eye ${look}`}>
          <div className="pupil"></div>
        </div>

      </div>

      {/* PANEL */}

      {open && (

        <div className="densel-panel">

          <div className="densel-title">
            Densel
          </div>

          <div className="densel-text">
            {text || "I'm watching the conversation..."}
          </div>

        </div>

      )}

    </div>
  )

}