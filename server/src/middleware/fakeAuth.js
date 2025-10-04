// middleware/fakeAuth.js
export function fakeAuth(req, res, next) {
  // Hardcode a test user (e.g., manager or CFO from seed data)
  req.user = { id: "manager_user_id" };
  next();
}
