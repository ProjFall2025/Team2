import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link> |{' '}
      <Link to="/events">Events</Link> |{' '}
      <Link to="/login">Login</Link> |{' '}
      <Link to="/register">Register</Link>
    </nav>
  );
}