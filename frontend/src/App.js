import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import AddEvent from './pages/AddEvent';
import ViewParticipants from './pages/ViewParticipants';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/add-event" element={<AddEvent />} />
        <Route path="/view-participants" element={<ViewParticipants />} />
      </Routes>
    </Router>
  );
}

export default App;
