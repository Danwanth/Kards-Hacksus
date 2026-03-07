import { useState } from "react";
import "./Densel.css";

export default function Densel({ text }: any){

  const [open,setOpen] = useState(false);

  return(

    <div className="densel">

      {!open && (
        <div
          className="densel-bubble"
          onClick={()=>setOpen(true)}
        >
          👀
        </div>
      )}

      {open && (
        <div className="densel-box">

          <h4>Hi I am Densel</h4>

          <p>{text}</p>

          <button onClick={()=>setOpen(false)}>
            close
          </button>

        </div>
      )}

    </div>
  )
}