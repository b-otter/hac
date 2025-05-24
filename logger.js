// logger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });
const errorStream = fs.createWriteStream(path.join(logsDir, 'errors.log'), { flags: 'a' });

const getCurrentTime = () => new Date().toISOString();

// Создаем объект logger
const logger = {
  info: (message, data = {}) => {
    const logEntry = `[${getCurrentTime()}] INFO: ${message} ${JSON.stringify(data)}\n`;
    process.stdout.write(logEntry);
    logStream.write(logEntry);
  },
  
  error: (message, error = {}) => {
    const errorEntry = `[${getCurrentTime()}] ERROR: ${message} ${error.stack || JSON.stringify(error)}\n`;
    process.stderr.write(errorEntry);
    errorStream.write(errorEntry);
  },
  
  warn: (message, data = {}) => {
    const warnEntry = `[${getCurrentTime()}] WARN: ${message} ${JSON.stringify(data)}\n`;
    process.stdout.write(warnEntry);
    logStream.write(warnEntry);
  },
  
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const debugEntry = `[${getCurrentTime()}] DEBUG: ${message} ${JSON.stringify(data)}\n`;
      process.stdout.write(debugEntry);
      logStream.write(debugEntry);
    }
  }
};

// Экспортируем объект logger по умолчанию
export {logger};