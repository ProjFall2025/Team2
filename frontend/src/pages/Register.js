import React, { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/auth/register', {
        name,
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      alert('Registration successful!');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Register</button>
    </form>
  );
}