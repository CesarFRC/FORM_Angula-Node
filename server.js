const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;


app.use(cors());


app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'lucas'
});

connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

app.post('/usuarios', (req, res) => {
  const { nombre, apellidos, email,edad,contrasena } = req.body;

  if (!nombre || !apellidos || !email) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const query = 'INSERT INTO usuarios (nombre, apellidos, email,edad,contrasena) VALUES (?, ?, ? , ? , ?)';
  connection.query(query, [nombre, apellidos, email, edad,contrasena], (err, results) => {
    if (err) {
      console.error('Error al insertar:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    res.json({ mensaje: 'Usuario insertado correctamente', id: results.insertId });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});



app.get('/usuarios', (req, res) => {
  connection.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(results);
  });
});