const mysql = require('mysql2');
require('dotenv').config();  // This loads the variables from the .env file
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());  // Enable CORS
app.use(express.json());  // Middleware to parse JSON request bodies

// Use the MYSQL_URL environment variable
const mysqlUrl = process.env.MYSQL_URL;
const regex = /mysql:\/\/(.*):(.*)@(.*):(\d+)\/(.*)/;
const matches = mysqlUrl.match(regex);

const dbConfig = {
  user: matches[1],           // root
  password: matches[2],       // yourpassword
  host: matches[3],           // mysql.railway.internal
  port: matches[4],           // 3306
  database: matches[5],       // railway
};

// Create the connection to MySQL
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);  // Exit if there's an error
  } else {
    console.log('Connected to the MySQL database');
  }
});

// Example route to fetch data from MySQL (GET route)
app.get('/data', (req, res) => {
  const query = 'SELECT * FROM your_table_name';  // Adjust table name here
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Error querying the database');
    }
    res.json(results);  // Send back results as JSON
  });
});

// POST Route (Insert Data)
app.post('/data', (req, res) => {
  const { field1, field2 } = req.body;  // Adjust based on your table structure
  
  const query = 'INSERT INTO your_table_name (field1, field2) VALUES (?, ?)';  // Adjust columns
  
  connection.query(query, [field1, field2], (err, results) => {
    if (err) {
      console.error('Error inserting into the database:', err);
      return res.status(500).send('Error inserting into the database');
    }
    res.status(201).send('Data inserted successfully');
  });
});

// PUT Route (Update Data)
app.put('/data/:id', (req, res) => {
  const { id } = req.params;  // Get the ID from the URL (e.g., /data/1)
  const { field1, field2 } = req.body;  // Get updated data from the request body
  
  const query = 'UPDATE your_table_name SET field1 = ?, field2 = ? WHERE id = ?';  // Adjust the query
  
  connection.query(query, [field1, field2, id], (err, results) => {
    if (err) {
      console.error('Error updating the database:', err);
      return res.status(500).send('Error updating the database');
    }
    res.status(200).send('Data updated successfully');
  });
});

// DELETE Route (Remove/Delete Data)
app.delete('/data/:id', (req, res) => {
  const { id } = req.params;  // Get the ID from the URL (e.g., /data/1)
  
  const query = 'DELETE FROM your_table_name WHERE id = ?';  // Adjust the query
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting from the database:', err);
      return res.status(500).send('Error deleting from the database');
    }
    res.status(200).send('Data deleted successfully');
  });
});

// Graceful shutdown of MySQL connection
process.on('SIGINT', () => {
  console.log('Closing MySQL connection...');
  connection.end(() => {
    console.log('MySQL connection closed');
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
