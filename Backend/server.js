const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(cors());

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@123',
  database: 'Expense'
});

conn.connect((err) => {
  if (err) {
    console.log("Error connecting to DB", err);
  } else {
    console.log("Connected to DB");
  }
});

// Fetch all
app.get('/', (req, res) => {
  conn.query('SELECT * FROM expItem', (err, results) => {
    if (err) return res.status(500).send("DB Error");
    res.send(results);
  });
});

// Insert
app.post('/addExp', (req, res) => {
  const { expName, amount, category, date } = req.body;
  const sql = 'INSERT INTO expItem (expName, amount, category, da_te) VALUES (?, ?, ?, ?)';
  conn.query(sql, [expName, amount, category, date], (err, result) => {
    if (err) return res.status(500).send("Insert failed");
    res.json({ insertId: result.insertId });
  });
});

// Update
app.put('/updateExp/:id', (req, res) => {
  const { expName, amount, category, date } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE expItem SET expName=?, amount=?, category=?, da_te=? WHERE ID=?';
  conn.query(sql, [expName, amount, category, date, id], (err, result) => {
    if (err) return res.status(500).send("Update failed");
    res.send("Updated");
  });
});

// Delete
app.delete('/deleteExp/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM expItem WHERE ID=?';
  conn.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send("Delete failed");
    res.send("Deleted");
  });
});
app.get('/total', (req, res) => {
  const sql = `SELECT SUM(amount) AS total FROM expItem`;
  conn.query(sql, (err, result) => {
    if (err) {
      console.log("Error while calculating total:", err);
      return res.status(500).send("Error retrieving total.");
    }
    res.json(result[0]); // { total: 1234 }
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
