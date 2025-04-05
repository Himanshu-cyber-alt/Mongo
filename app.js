
// index.js
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import pool from './models/db.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Create table if not exists
const initQuery = `
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  course VARCHAR(100) NOT NULL,
  grade INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
pool.query(initQuery);

// Routes
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.render('index', { students: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/add', async(req, res) => {
  const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
  res.render('add.ejs',{students : result.rows});
});

app.post('/add', async (req, res) => {
  const { name, course, grade } = req.body;
  try {
    await pool.query(
      'INSERT INTO students (name, course, grade) VALUES ($1, $2, $3)',
      [name, course, grade]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
