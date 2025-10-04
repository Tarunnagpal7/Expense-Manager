

/**
 * Role-based access middleware
 * Usage:
 *   router.post("/admin-route", auth, roleCheck(["ADMIN"]), controllerFn);
 */
export const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userRole = req.user.role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: `Access denied. Requires role: ${allowedRoles.join(", ")}`,
        });
      }

      next();
    } catch (err) {
      console.error("Role check error:", err.message);
      return res.status(403).json({ error: "Access denied" });
    }
  };
};
