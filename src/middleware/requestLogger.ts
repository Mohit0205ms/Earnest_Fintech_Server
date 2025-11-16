import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip || req.connection.remoteAddress} - User-Agent: ${req.get('User-Agent') || 'Unknown'}`);

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '[FILTERED]';
    if (logBody.refreshToken) logBody.refreshToken = '[FILTERED]';
    console.log(`Request Body:`, JSON.stringify(logBody));
  }

  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    return originalJson.call(this, body);
  };

  next();
};
