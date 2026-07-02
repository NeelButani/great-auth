import express from 'express'
import helmet from 'helmet';
import cors from 'cors'
import { env } from './config/env.js';
import morgan from 'morgan';


const app = express();

// Middlewares 

// 1. Security Header
app.use(helmet);

// 2. Cors
app.use(cors({
    origin : env.NODE_ENV === 'development' ? '*' : [],
    methods : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// 3. request logging
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))

// 4. Parse incoming JSON bodies
app.use(express.json())

// --- 404 Handler (after all routes) ---
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` })
})

export default app;