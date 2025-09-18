import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: reemplaza por tu backend real (Django u otro)
      // const res = await fetch("/api/login", { method:"POST", headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      // if (!res.ok) throw new Error("Credenciales inválidas");
      await new Promise(r => setTimeout(r, 700)); // demo
      alert("Login OK (demo)");
      // navigate("/") si quieres redirigir
    } catch (err) {
      alert(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login" data-nav-theme="light">
      <div className="login-card">
        <h1>Inicia Sesión</h1>
        <p className="login-sub">Accede a tus reportes genéticos</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>Correo</span>
            <input
              type="email"
              name="email"
              placeholder="tucorreo@dominio.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </label>

          <label className="pwd-field">
            <span>Contraseña</span>
            <div className="pwd-wrap">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd(s => !s)}
                aria-label="Mostrar/ocultar contraseña"
              >
                {showPwd ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>

          <div className="login-help">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
        </form>
      </div>
    </section>
  );
}
