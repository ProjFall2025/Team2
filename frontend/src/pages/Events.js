import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/events/upcoming')
      .then(res => setEvents(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <h2>Upcoming Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            <strong>{event.title}</strong><br />
            {new Date(event.date).toLocaleString()} @ {event.location}
          </li>
        ))}
      </ul>
    </div>
  );
}
