import React, { useState } from 'react';
import axios from 'axios';

export default function ViewParticipants() {
  const [eventId, setEventId] = useState('');
  const [participants, setParticipants] = useState([]);

  const fetchParticipants = async () => {
    try {
      const res = await axios.get(`YOUR_BACKEND_URL/events/${eventId}/participants`);
      setParticipants(res.data.data);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to fetch participants');
    }
  };

  return (
    <div className="container">
      <h2>View Event Participants</h2>
      <input
        placeholder="Enter Event ID"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
      />
      <button onClick={fetchParticipants}>Fetch Participants</button>
      <ul>
        {participants.map((p, index) => (
          <li key={index}>{p.User?.name || 'Unknown'}</li>
        ))}
      </ul>
    </div>
  );
}
