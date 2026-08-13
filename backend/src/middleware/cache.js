export const setCacheHeaders = (maxAge = 60, sMaxAge = 300) => (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=600`);
  }
  next();
};
