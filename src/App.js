import "./css/App.css";

// Componentes
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";

// Imagen de fondo
import background from "./assets/login.png";

function App() {
  return (
    <div className="app-container">
      {/* Panel Izquierdo */}
      <div className="left-panel">
        <Header />
        <div className="login-section">
          <h1 className="login-title">Ingresa a tu Cuenta</h1>
          <p className="login-subtitle">con las credenciales entregadas</p>
          <hr className="login-divider" />
          <div className="login-box">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="right-panel">
        <img src={background} alt="Background" className="bg-image" />
      </div>
    </div>
  );
}

export default App;
