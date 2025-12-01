const bcrypt = require('bcrypt');
const sequelize = require('../src/config/db');
const { DataTypes } = require('sequelize');

require('dotenv').config();

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role: { type: DataTypes.ENUM('guest', 'user', 'admin'), defaultValue: 'user' },
  xp: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'users', timestamps: false });

const Admin = sequelize.define('Admin', {
  username: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING
}, { tableName: 'admins', timestamps: false });

const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, unique: true },
  description: DataTypes.TEXT
}, { tableName: 'categories', timestamps: false });

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

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    // Optional: clear tables first
    await sequelize.sync({ force: true });

    // Hash passwords
    const password1 = await bcrypt.hash('password123', 10);
    const password2 = await bcrypt.hash('password456', 10);
    const adminPass = await bcrypt.hash('adminpass', 10);

    // Create users
    const user1 = await User.create({ name: 'Kelly M', email: 'kelly@example.com', password: password1 });
    const user2 = await User.create({ name: 'Yashaswini A', email: 'yash@example.com', password: password2 });

    // Create admin
    const admin = await Admin.create({ username: 'admin', password: adminPass });

    // Create categories
    const cat1 = await Category.create({ name: 'Winter Sports', description: 'Snowboarding, skiing, and more' });
    const cat2 = await Category.create({ name: 'Festivals', description: 'Carnivals and winter fairs' });
    const cat3 = await Category.create({ name: 'Workshops', description: 'DIY crafts and cooking' });

    // Create events
    const event1 = await Event.create({
      category_id: cat1.id,
      title: 'Snow Marathon 2025',
      description: 'A 5K snow run in the park',
      date: new Date('2025-12-15T10:00:00'),
      location: 'Liberty State Park',
      capacity: 100
    });

    const event2 = await Event.create({
      category_id: cat2.id,
      title: 'Winter Carnival',
      description: 'Games, food, and music',
      date: new Date('2025-12-20T14:00:00'),
      location: 'Downtown Plaza',
      capacity: 200
    });

    const event3 = await Event.create({
      category_id: cat3.id,
      title: 'Hot Cocoa Workshop',
      description: 'Learn to make gourmet hot chocolate',
      date: new Date('2025-12-10T17:00:00'),
      location: 'Community Center',
      capacity: 30
    });

    // Create registrations
    await Registration.create({ user_id: user1.id, event_id: event1.id });
    await Registration.create({ user_id: user2.id, event_id: event2.id });

    console.log('✅ Seed data inserted!');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seed();
