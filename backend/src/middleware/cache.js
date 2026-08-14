// In-memory cache store
const memoryCache = new Map();

export const memoryCacheMiddleware = (ttlSeconds = 60) => (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const key = `${req.originalUrl || req.url}`;
  const cached = memoryCache.get(key);

  if (cached && Date.now() < cached.expireAt) {
    res.set('X-Cache', 'HIT');
    res.set('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=120`);
    return res.status(cached.status || 200).json(cached.data);
  }

  // Intercept json response to save into cache
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      memoryCache.set(key, {
        data: body,
        status: res.statusCode,
        expireAt: Date.now() + ttlSeconds * 1000,
      });
      res.set('X-Cache', 'MISS');
    }
    return originalJson(body);
  };

  res.set('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=120`);
  next();
};

export const clearMemoryCache = () => {
  memoryCache.clear();
};

export const setCacheHeaders = (maxAge = 60, sMaxAge = 300) => (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=600`);
  }
  next();
};

