import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";

import router from "./api/index";

const app = express();

const allowedOrigins = process.env.FRONTEND_URLS?.split(',') || [
  'http://localhost:3000', 
  'http://localhost:5173', 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(helmet()); 
app.use(helmet.hidePoweredBy()); 

// ERP Proxy setup
const ERP_SERVER = process.env.ERP_REST_SERVER || 'http://localhost:4000';
const erpRoutePrefixes = [
  '/api/v1/categories', 
  '/api/v1/products', 
  '/api/v1/warehouses', 
  '/api/v1/suppliers', 
  '/api/v1/po', 
  '/api/v1/invoices', 
  '/api/v1/movements', 
  '/api/v1/stock',
  '/api/v1/inventory',
  '/api/v1/uom',
  '/erp-health'
];

const erpProxy = createProxyMiddleware({
  target: ERP_SERVER,
  changeOrigin: true,
  pathRewrite: {
    '^/erp-health': '/api/v1/health'
  }
});

app.use((req, res, next) => {
  if (erpRoutePrefixes.some(route => req.originalUrl.startsWith(route))) {
    return erpProxy(req, res, next);
  }
  next();
});

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// EMR API routes
app.use('/api/v1', router);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;
