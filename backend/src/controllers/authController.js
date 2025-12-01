const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');
require('dotenv').config();

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role: { type: DataTypes.ENUM('guest', 'user', 'admin'), defaultValue: 'user' }
}, { tableName: 'users', timestamps: false });

const jwtSecret = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
