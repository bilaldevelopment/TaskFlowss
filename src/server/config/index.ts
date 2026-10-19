import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'taskflow_jwt_secure_development_secret_key_2026',
  jwtExpiresIn: '7d',
  mongodbUri: process.env.MONGODB_URI || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  isDev: (process.env.NODE_ENV || 'development') !== 'production',
};
