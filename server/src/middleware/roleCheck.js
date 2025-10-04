<<<<<<< HEAD
/**
 * Role-based access middleware
 * Usage:
 *   router.post("/admin-route", auth, roleCheck(["ADMIN"]), controllerFn);
 */
export const roleCheck = (allowedRoles = []) => {
=======
export const requireRole = (allowedRoles) => {
>>>>>>> 3023fd8417ea886bf7feab55f53ed296dd25fe0f
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