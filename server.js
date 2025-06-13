const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

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

//Clave de token
const SECRET_KEY = 'clave123'

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
     //Generar token con datos de usuario
     const tokenPayload = {
      id: results.insertId,
      nombre,
      email
     };

     const token = jwt.sign(tokenPayload,SECRET_KEY,{expiresIn: '2h'})
    res.json({ mensaje: 'Usuario insertado correctamente', id: results.insertId,token });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});





function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    req.usuario = usuario; 
    next(); 
  });
}


app.get('/usuarios' ,verificarToken, (req, res) => {
  connection.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(results);
  });
});