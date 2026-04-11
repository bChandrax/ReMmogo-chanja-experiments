import "./Navbar.css";



export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">⚡ Ampy</div>

      <div className="nav-links">
        <span>Home</span>
        <span>About</span>
        <span>Services</span>
        <span>Contact</span>
      </div>

      {/* iPhone Dynamic Island */}
      <div className="island">
        <div className="dot"></div>
        <a href="./PersonalDashboard" className="island-content">
        <span>Live Energy</span></a>
      </div>
    </nav>
  );
}