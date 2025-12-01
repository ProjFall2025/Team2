const sequelize = require('../config/db');
const { DataTypes, Op } = require('sequelize');

const Event = sequelize.define('Event', {
  category_id: DataTypes.INTEGER,
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  date: DataTypes.DATE,
  location: DataTypes.STRING,
  capacity: DataTypes.INTEGER
}, { tableName: 'events', timestamps: false });

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

exports.getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.findAll({ where: { date: { [Op.gt]: now } }, order: [['date', 'ASC']] });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
