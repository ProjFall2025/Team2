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

const Registration = sequelize.define('Registration', {
  user_id: DataTypes.INTEGER,
  event_id: DataTypes.INTEGER
}, { tableName: 'registrations', timestamps: false });

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: DataTypes.STRING
}, { tableName: 'users', timestamps: false });

Registration.belongsTo(User, { foreignKey: 'user_id' });

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
    const events = await Event.findAll({
      where: { date: { [Op.gt]: now } },
      order: [['date', 'ASC']]
    });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { category_id, title, description, date, location, capacity } = req.body;
    const event = await Event.create({ category_id, title, description, date, location, capacity });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

exports.getParticipants = async (req, res) => {
  try {
    const registrations = await Registration.findAll({
      where: { event_id: req.params.id },
      include: [{ model: User, attributes: ['name'] }]
    });
    res.json({ success: true, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
