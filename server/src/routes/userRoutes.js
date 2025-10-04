import express from "express";
import { UserController } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Only admin can manage users
router.get("/", roleCheck(["ADMIN"]), UserController.getUsers);
router.post("/", roleCheck(["ADMIN"]), UserController.createUser);
router.put("/:id", roleCheck(["ADMIN"]), UserController.updateUser);
router.delete("/:id", roleCheck(["ADMIN"]), UserController.deleteUser);

// Managers and above can view managers list
router.get(
  "/managers",
  roleCheck(["ADMIN", "MANAGER"]),
  UserController.getManagers
);

export default router;
