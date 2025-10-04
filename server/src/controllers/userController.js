import prisma from "../lib/prisma.js";
import { AuthService } from "../services/authService.js";
export class UserController {
  static async getUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        where: {
          companyId: req.user.companyId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isManagerApprover: true,
          createdAt: true,
          updatedAt: true,
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          directReports: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ users });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async createUser(req, res) {
    try {
      const {
        name,
        email,
        password,
        role,
        managerId,
        isManagerApprover = false,
      } = req.body;

      // Validation
      if (!name || !email || !password || !role) {
        return res
          .status(400)
          .json({ error: "Name, email, password, and role are required" });
      }

      // Validate role
      const validRoles = [
        "ADMIN",
        "MANAGER",
        "EMPLOYEE",
        "FINANCE",
        "DIRECTOR",
      ];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: "Invalid role",
          validRoles,
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Validate manager exists in same company if provided
      if (managerId) {
        const manager = await prisma.user.findFirst({
          where: {
            id: managerId,
            companyId: req.user.companyId,
          },
        });

        if (!manager) {
          return res
            .status(400)
            .json({ error: "Manager not found in your company" });
        }
      }
      // Hash password
      const passwordHash = await AuthService.hashPassword(password);

      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            companyId: req.user.companyId,
            email,
            name,
            role,
            managerId: managerId || null,
            passwordHash,
            isManagerApprover,
          },
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            companyId: req.user.companyId,
            userId: req.user.id,
            action: "USER_CREATED",
            meta: {
              targetUserId: newUser.id,
              targetUserName: newUser.name,
              targetUserEmail: newUser.email,
              role: newUser.role,
              managerId: newUser.managerId,
            },
          },
        });

        return newUser;
      });

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;

      res.status(201).json({
        message: "User created successfully",
        user: userResponse,
      });
    } catch (error) {
      console.error("Create user error:", error);

      if (error.code === "P2002") {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      if (error.message?.includes("Invalid value for argument `role`")) {
        return res.status(400).json({
          error: "Invalid role provided",
          validRoles: ["ADMIN", "MANAGER", "EMPLOYEE", "FINANCE", "DIRECTOR"],
        });
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, role, managerId, isManagerApprover } = req.body;

      // Check if target user exists in same company
      const targetUser = await prisma.user.findFirst({
        where: {
          id,
          companyId: req.user.companyId,
        },
      });

      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent self-update of role if it's the admin
      if (id === req.user.id && role && role !== targetUser.role) {
        return res.status(400).json({ error: "Cannot change your own role" });
      }

      // Validate role if provided
      if (role) {
        const validRoles = [
          "ADMIN",
          "MANAGER",
          "EMPLOYEE",
          "FINANCE",
          "DIRECTOR",
        ];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            error: "Invalid role",
            validRoles,
          });
        }
      }

      // Validate manager exists in same company if provided
      if (managerId) {
        const manager = await prisma.user.findFirst({
          where: {
            id: managerId,
            companyId: req.user.companyId,
          },
        });

        if (!manager) {
          return res
            .status(400)
            .json({ error: "Manager not found in your company" });
        }

        // Prevent circular manager relationships
        if (managerId === id) {
          return res
            .status(400)
            .json({ error: "User cannot be their own manager" });
        }
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(role && { role }),
            ...(managerId !== undefined && { managerId }),
            ...(isManagerApprover !== undefined && { isManagerApprover }),
          },
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            companyId: req.user.companyId,
            userId: req.user.id,
            action: "USER_UPDATED",
            meta: {
              targetUserId: user.id,
              targetUserName: user.name,
              changes: { name, role, managerId, isManagerApprover },
            },
          },
        });

        return user;
      });

      res.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update user error:", error);

      if (error.message?.includes("Invalid value for argument `role`")) {
        return res.status(400).json({
          error: "Invalid role provided",
          validRoles: ["ADMIN", "MANAGER", "EMPLOYEE", "FINANCE", "DIRECTOR"],
        });
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if target user exists in same company
      const targetUser = await prisma.user.findFirst({
        where: {
          id,
          companyId: req.user.companyId,
        },
      });

      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent self-deletion
      if (id === req.user.id) {
        return res
          .status(400)
          .json({ error: "Cannot delete your own account" });
      }

      await prisma.$transaction(async (tx) => {
        // Remove manager references from other users
        await tx.user.updateMany({
          where: {
            managerId: id,
            companyId: req.user.companyId,
          },
          data: { managerId: null },
        });

        // Delete user
        await tx.user.delete({
          where: { id },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            companyId: req.user.companyId,
            userId: req.user.id,
            action: "USER_DELETED",
            meta: {
              targetUserId: targetUser.id,
              targetUserName: targetUser.name,
              targetUserEmail: targetUser.email,
            },
          },
        });
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getManagers(req, res) {
    try {
      // First, let's check what roles actually exist in the database
      const distinctRoles = await prisma.user.findMany({
        where: { companyId: req.user.companyId },
        distinct: ["role"],
        select: { role: true },
      });

      console.log(
        "Available roles in database:",
        distinctRoles.map((r) => r.role)
      );

      // Build the OR condition safely
      const orConditions = [{ isManagerApprover: true }];

      // Only include role conditions for roles that exist in our enum
      const managerRoles = ["ADMIN", "MANAGER", "DIRECTOR"];

      // Check which manager roles actually exist in our database
      const existingManagerRoles = [];
      for (const role of managerRoles) {
        const roleExists = distinctRoles.some((r) => r.role === role);
        if (roleExists) {
          existingManagerRoles.push(role);
        }
      }

      // If we have existing manager roles, add them to OR condition
      if (existingManagerRoles.length > 0) {
        orConditions.push({
          role: { in: existingManagerRoles },
        });
      }

      const managers = await prisma.user.findMany({
        where: {
          companyId: req.user.companyId,
          OR: orConditions,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isManagerApprover: true,
        },
        orderBy: { name: "asc" },
      });

      res.json({ managers });
    } catch (error) {
      console.error("Get managers error:", error);

      // More detailed error logging
      if (error.message?.includes("Invalid value for argument `role`")) {
        console.error("Role validation error - checking available roles...");

        // Let's try a simpler approach as fallback
        try {
          const fallbackManagers = await prisma.user.findMany({
            where: {
              companyId: req.user.companyId,
              isManagerApprover: true,
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isManagerApprover: true,
            },
            orderBy: { name: "asc" },
          });

          return res.json({ managers: fallbackManagers });
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }

      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
