import winston from 'winston';
import path from 'path';

const SENSITIVE_FIELDS = ['password', 'passwordHash', 'token', 'secret', 'key', 'authorization', 'accessToken', 'refreshToken', 'mfaSecret'];

const redactSensitive = winston.format((info) => {
  const redacted = { ...info };
  for (const field of SENSITIVE_FIELDS) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]';
    }
  }
  if (typeof redacted.message === 'string') {
    for (const field of SENSITIVE_FIELDS) {
      const regex = new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi');
      redacted.message = redacted.message.replace(regex, `"${field}":"[REDACTED]"`);
    }
  }
  return redacted;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    redactSensitive(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mailvault-api' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length > 2
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `${timestamp} ${level}: ${message}${metaStr}`;
        })
      ),
    })
  );
}

export default logger;
