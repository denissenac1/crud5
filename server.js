const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// Tenta usar a URL completa do Railway, ou cai para campos individuais
const dbConfig = process.env.MYSQL_URL || {
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "crud",
  port: process.env.MYSQLPORT || 3306
};

const db = mysql.createPool(dbConfig); // Usar Pool é melhor para produção

// Testar conexão e criar tabela
db.getConnection((err, connection) => {
  if (err) {
    console.error("Erro ao conectar no banco do Railway:", err);
    return;
  }
  console.log("Conectado ao MySQL do Railway!");
  
  connection.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    )
  `, (err) => {
    connection.release();
    if (err) console.log("Erro criar tabela:", err);
    else console.log("Tabela items pronta!");
  });
});

app.get("/items", (req, res) => {
  db.query("SELECT * FROM items", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post("/items", (req, res) => {
  const { name } = req.body;
  db.query("INSERT INTO items (name) VALUES (?)", [name], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item adicionado", id: results.insertId });
  });
});

app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query("UPDATE items SET name = ? WHERE id = ?", [name, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item editado" });
  });
});

app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM items WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item deletado" });
  });
});

app.use(express.static('.'));

// O Railway exige que a porta seja dinâmica
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));