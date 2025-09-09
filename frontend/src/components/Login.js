"use client"
import { useState } from "react";
import { login } from "../api";

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await login(username, password);
      onSuccess?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"#f5f5f5", padding:"1rem"
    }}>
      <div style={{
        width:"100%", maxWidth:420, background:"#fff", borderRadius:12, 
        boxShadow:"0 10px 30px rgba(0,0,0,.1)", padding:"24px"
      }}>
        {/* logo alfamart */}
        <div style={{display:"flex", justifyContent:"center", marginBottom:12}}>
          <img 
            src="/logoalfamart.png" 
            alt="Alfamart Logo" 
            style={{height:30, objectFit:"contain"}} 
          />
        </div>

        <h2 style={{textAlign:"center", margin:"4px 0", color:"#111"}}>Building & Maintenance</h2>
        <p style={{textAlign:"center", margin:"0 0 25px", color:"#6b7280"}}>
          Foto Dokumentasi Bangunan Toko Baru
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom:12}}>
            <label>Username</label>
            <input
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
            />
          </div>
          <div className="form-group" style={{marginBottom:16}}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>

          {err && (
            <div style={{background:"#fee2e2", color:"#b91c1c", border:"1px solid #fecaca",
              padding:"8px 10px", borderRadius:8, marginBottom:12, fontSize:14}}>
              {err}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={busy} style={{width:"100%"}}>
            {busy ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
