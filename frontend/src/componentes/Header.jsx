import "../Header.css";

export default function Header() {
  return (
    <header className="header">
      
      <div className="logo"><img src="./logoWork2Day.png"></img></div>

      
      <nav className="nav">
        <a href="#" className="active">
          Home
        </a>
        <a href="#">About us</a>
        <a href="#">Jobs</a>
        <a href="#">Contact</a>
      </nav>

      <div className="buttons">
        <button className="btn-outline">Sign up</button>
        <button className="btn-primary">Sign in</button>
      </div>
    </header>
  );
}
