import "../css/header.css";
import logo from "../assets/SeqUoh_Logo.png";

function Header() {
  return (
    <header className="header">
      <img src={logo} alt="SeqUOH Logo" className="header-logo" />
    </header>
  );
}

export default Header;