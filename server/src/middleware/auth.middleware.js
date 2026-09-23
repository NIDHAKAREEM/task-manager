const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    const decoded = jwt.verify(token, 'secretkey');

    req.userId = decoded.userId;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;

// Without middleware, authentication logic would need to be repeated across all routes, 
// leading to code duplication and increased risk of missing security checks. 
// Middleware centralizes this logic, making the application more secure and maintainable.

// Extracts token
// Verifies JWT
// Adds req.userId