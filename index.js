// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('📚 Bookstore API is running');
});

// Get all books
app.get('/books', (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add a book
app.post('/books', (req, res) => {
  const { title, author, price, quantity } = req.body;
  const sql = 'INSERT INTO books (title, author, price, quantity) VALUES (?, ?, ?, ?)';
  db.query(sql, [title, author, price, quantity], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId, title, author, price, quantity });
  });
});

// Update book
app.put('/books/:id', (req, res) => {
  const { title, author, price, quantity } = req.body;
  const sql = 'UPDATE books SET title = ?, author = ?, price = ?, quantity = ? WHERE id = ?';
  db.query(sql, [title, author, price, quantity, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ id: req.params.id, title, author, price, quantity });
  });
});

// Delete book
app.delete('/books/:id', (req, res) => {
    db.query('DELETE FROM books WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).send(err);
  
      // Check if table is now empty
      db.query('SELECT COUNT(*) AS count FROM books', (err, results) => {
        if (err) return res.status(500).send(err);
  
        const count = results[0].count;
        if (count === 0) {
          // Reset AUTO_INCREMENT if table is empty
          db.query('ALTER TABLE books AUTO_INCREMENT = 1', (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'All books deleted, ID reset to 1', id: req.params.id });
          });
        } else {
          res.json({ message: 'Book deleted', id: req.params.id });
        }
      });
    });
  });

// Start server
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
