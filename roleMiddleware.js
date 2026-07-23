// middleware/roleMiddleware.js
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      message: "Forbidden: Admin access required."
    });
  }
  next();
};

module.exports = { requireAdmin };