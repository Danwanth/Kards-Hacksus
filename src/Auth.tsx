import { useState } from "react";
import { supabase } from "./supabase";
import { generateUsername } from "./utils/username";

export default function Auth({ onLogin }: any) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      alert(error.message);
      return;
    }

    const username = generateUsername();

    localStorage.setItem("kards_username", username);

    onLogin();

  }

  async function login() {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!localStorage.getItem("kards_username")) {
      const username = generateUsername();
      localStorage.setItem("kards_username", username);
    }

    onLogin();

  }

  return (
    <div style={{ padding:40, textAlign:"center" }}>

      <h1>KARDS</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <br/><br/>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <br/><br/>

      <button onClick={login}>
        Login
      </button>

      <button onClick={signUp}>
        Sign Up
      </button>

    </div>
  );
}