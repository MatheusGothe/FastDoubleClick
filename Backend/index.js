import express from 'express';
import cors from 'cors';
import registrosRouter from './routes/registros.js';

const app = express();
const PORT = 3000;

//Habilita CORS apenas para localhost:8080
app.use(cors({
  origin: 'http://localhost:8080'
}));

app.use(express.json());

// Rotas
app.use('/registros', registrosRouter);


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
