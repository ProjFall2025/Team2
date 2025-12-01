import React, { useState } from 'react';
import axios from 'axios';

export default function AddEvent() {
  const [form, setForm] = useState({
    category_id: '',
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/events/create', form);
      alert('Event created!');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create event');
    }
  };

  return (
    <div className="container">
      <h2>Add New Event</h2>
      <form onSubmit={handleSubmit}>
        <input name="category_id" placeholder="Category ID" onChange={handleChange} required />
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} required />
        <input name="date" type="datetime-local" onChange={handleChange} required />
        <input name="location" placeholder="Location" onChange={handleChange} required />
        <input name="capacity" type="number" placeholder="Capacity" onChange={handleChange} required />
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}
