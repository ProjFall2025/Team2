import React from 'react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-hero">
      <div className="home-overlay">
        <div className="home-content">
          <h1>❄️The Winter Arc❄️</h1>
          <p>Your Redemption Arc starts here.</p>
          <a href="/events" className="home-button">Explore Events</a>
        </div>
      </div>
    </div>
  );
}
