import React, { useState } from "react";
import "../css/login.css";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    console.log("Login:", { username, password });
  };

  return (
    <form onSubmit={submit} className="login-form">
      <div className="uv-field">
        <span className="uv-icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-3.3 0-7 1.7-7 5v1h14v-1c0-3.3-3.7-5-7-5z"
              fill="currentColor"
            />
          </svg>
        </span>
        <input
          type="text"
          className="uv-input"
          placeholder="Correo Electrónico"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
      </div>
      <div className="uv-field">
        <span className="uv-icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zm-6 0V7a3 3 0 016 0v3H11z"
              fill="currentColor"
            />
          </svg>
        </span>
        <input
          type="password"
          className="uv-input"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <button className="login-button" type="submit">
        Ingresa tu cuenta
      </button>

      <a href="#" className="login-link">¿No te llegó el correo?</a>
    </form>
  );
}

export default LoginForm;
