const express = require('express');
const sequelize = require('./src/config/db');
require('dotenv').config();

const app = express();
app.use(express.json());


app.use('/auth', require('./src/routes/auth'));
app.use('/events', require('./src/routes/events'));


app.get('/', (req, res) => {
  res.send('The Winter Arc backend is running!');
});

const PORT = process.env.PORT || 4000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to MySQL database');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err);
  });
