// In-memory cache store with max capacity protection
const memoryCache = new Map();
const MAX_CACHE_ENTRIES = 500;

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
      if (memoryCache.size >= MAX_CACHE_ENTRIES) {
        // Evict oldest entry
        const firstKey = memoryCache.keys().next().value;
        if (firstKey) memoryCache.delete(firstKey);
      }
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

export const clearCacheByPattern = (pattern) => {
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
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


