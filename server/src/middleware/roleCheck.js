export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Insufficient permissions", 
        required: allowedRoles,
        current: req.user.role 
      });
    }

    next();
  };
};

// Specific role checkers for convenience
export const requireAdmin = requireRole(['ADMIN']);
export const requireManager = requireRole(['MANAGER']);
export const requireManagerOrAbove = requireRole(['ADMIN', 'MANAGER']);