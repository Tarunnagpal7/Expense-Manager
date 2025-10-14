/**
 * Role-based access middleware
 * Usage:
 *   router.post("/admin-route", auth, roleCheck(["ADMIN"]), controllerFn);
 */
export const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    console.log(allowedRoles);
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
};

// ✅ Specific role checkers for convenience
export const requireAdmin = roleCheck(["ADMIN"]);
export const requireManager = roleCheck(["MANAGER"]);
export const requireManagerOrAbove = roleCheck(["ADMIN", "MANAGER"]);
