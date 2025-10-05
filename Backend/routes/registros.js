import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const router = express.Router();

// Ajuste do __dirname no ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registrosPath = path.join(__dirname, '../registros.json');

// Função para ler os registros
const lerRegistros = () => {
  if (!fs.existsSync(registrosPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(registrosPath, 'utf-8'));
  } catch (err) {
    return [];
  }
};

// Função para salvar os registros
const salvarRegistros = (registros) => {
  fs.writeFileSync(registrosPath, JSON.stringify(registros, null, 2));
};

// GET /registros
router.get('/', (req, res) => {
  const registros = lerRegistros();
  return res.status(200).json(registros);
});

// POST /registros
router.post('/', (req, res) => {
  const { time } = req.body;
  if (time === undefined) return res.status(400).json({ error: 'O campo "tempo" é obrigatório.' });

  const novoRegistro = {
    id: nanoid(),
    time,
    data: new Date().toISOString()
  };

  const registros = lerRegistros();
  registros.push(novoRegistro);
  salvarRegistros(registros);

  const { id, ...registroSeguro } = novoRegistro;
  return res.status(201).json(registroSeguro);
});

// DELETE /registros/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  let registros = lerRegistros();

  const index = registros.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Registro não encontrado.' });

  const registroRemovido = registros.splice(index, 1)[0];
  salvarRegistros(registros);

  return res.json({ message: 'Registro removido com sucesso.', registro: registroRemovido });
});

export default router;
