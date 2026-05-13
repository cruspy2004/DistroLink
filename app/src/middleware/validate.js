function validateUrl(req, res, next) {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    new URL(url);
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
}

module.exports = { validateUrl };
