import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

import apiRoutes from './routes';
import { CommunicationServer } from './utils/CommunicationServer';

app.use('/api/v1', apiRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'erp-backend' });
});

CommunicationServer.initialize().then(() => {
  app.listen(port, () => {
    console.log(`📦 ERP Backend running on port ${port}`);
  });
}).catch(console.error);
