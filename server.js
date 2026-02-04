
// Importa o framework Express para criar o servidor web
const express = require("express");
// Importa o middleware CORS para permitir requisições de diferentes origens
const cors = require("cors");
// Importa o driver MySQL2 para conexão com banco de dados MySQL
const mysql = require("mysql2");

// Cria uma instância do aplicativo Express
const app = express();
// Habilita o CORS para todas as rotas (permite frontend acessar o backend)
app.use(cors());
// Configura o middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Configura a conexão com o banco de dados MySQL
// Conexão com MySQL - database: "crud"
const db = mysql.createConnection({
  host: "localhost",        // Endereço do servidor MySQL (local)
  user: "root",             // Usuário do MySQL
  password: "",             // Senha do MySQL (vazia no seu caso)
  database: "crud"          // Nome do banco de dados a ser usado
});

// Conectar e criar tabela se não existir
db.connect((err) => {
  // Verifica se houve erro na conexão
  if (err) {
    // Se erro, exibe no console e para a execução
    console.log("Erro MySQL:", err);
    return;
  }
  // Se conexão bem sucedida, exibe mensagem
  console.log("Conectado ao MySQL!");
  
  // Cria a tabela 'items' se ela não existir
  // Criar tabela items se não existir
  db.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,      // Coluna ID com auto-incremento e chave primária
      name VARCHAR(255) NOT NULL              // Coluna nome com tamanho máximo 255 e não nula
    )
  `, (err) => {
    // Verifica se houve erro na criação da tabela
    if (err) console.log("Erro criar tabela:", err);
    else console.log("Tabela items pronta!"); // Se sucesso, exibe mensagem
  });
});

// Rota GET /items - Listar todos os itens do banco
// GET - Listar itens
app.get("/items", (req, res) => {
  // Executa query SQL para selecionar todos os registros da tabela items
  db.query("SELECT * FROM items", (err, results) => {
    // Se erro na query, retorna status 500 com o erro
    if (err) return res.status(500).json(err);
    // Se sucesso, retorna os resultados em formato JSON
    res.json(results);
  });
});

// Rota POST /items - Criar um novo item no banco
// POST - Criar item  
app.post("/items", (req, res) => {
  // Extrai o nome do corpo da requisição
  const name = req.body.name;
  // Executa query SQL para inserir novo registro na tabela
  // O ? será substituído pelo valor do array [name]
  db.query("INSERT INTO items (name) VALUES (?)", [name], (err, results) => {
    // Se erro na query, retorna status 500 com o erro
    if (err) return res.status(500).json(err);
    // Se sucesso, retorna mensagem e o ID do item inserido
    res.json({ message: "Item adicionado", id: results.insertId });
  });
});

// Rota PUT /items/:id - Atualizar um item existente
// PUT - Editar item
app.put("/items/:id", (req, res) => {
  // Pega o ID da URL (parâmetro da rota)
  const id = req.params.id;
  // Extrai o novo nome do corpo da requisição
  const name = req.body.name;
  // Executa query SQL para atualizar registro específico
  // Os ? serão substituídos pelos valores do array [name, id]
  db.query("UPDATE items SET name = ? WHERE id = ?", [name, id], (err) => {
    // Se erro na query, retorna status 500 com o erro
    if (err) return res.status(500).json(err);
    // Se sucesso, retorna mensagem de confirmação
    res.json({ message: "Item editado" });
  });
});

// Rota DELETE /items/:id - Remover um item do banco
// DELETE - Deletar item
app.delete("/items/:id", (req, res) => {
  // Pega o ID da URL (parâmetro da rota)
  const id = req.params.id;
  // Executa query SQL para deletar registro específico
  // O ? será substituído pelo valor do array [id]
  db.query("DELETE FROM items WHERE id = ?", [id], (err) => {
    // Se erro na query, retorna status 500 com o erro
    if (err) return res.status(500).json(err);
    // Se sucesso, retorna mensagem de confirmação
    res.json({ message: "Item deletado" });
  });
});

// Configura o Express para servir arquivos estáticos (HTML, CSS, JS, imagens)
// SERVIR O FRONTEND
app.use(express.static('.')); // Serve arquivos HTML, CSS, JS da pasta atual

// Inicia o servidor na porta 3001
app.listen(3001, () => console.log(" Servidor rodando porta 3001"));
// Quando servidor inicia, exibe esta mensagem no console
