import prisma from '../lib/prisma.js';
import { AuthService } from '../services/authService.js';

export class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, companyName, country } = req.body;

      // Validation
      if (!name || !email || !password || !companyName || !country) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Get currency for country
      const currency = await AuthService.getCountryCurrency(country);

      // Create company and admin in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
          data: {
            name: companyName,
            country: country,
            currency: currency,
          }
        });

        // Hash password
        const passwordHash = await AuthService.hashPassword(password);

        // Create admin user
        const user = await tx.user.create({
          data: {
            companyId: company.id,
            email: email,
            name: name,
            role: 'ADMIN',
            passwordHash: passwordHash,
            isManagerApprover: true,
          },
          include: {
            company: true
          }
        });

        // Create audit logs
        await tx.auditLog.create({
          data: {
            companyId: company.id,
            userId: user.id,
            action: 'COMPANY_CREATED',
            meta: {
              companyName: company.name,
              country: company.country,
              currency: company.currency,
            }
          }
        });

        await tx.auditLog.create({
          data: {
            companyId: company.id,
            userId: user.id,
            action: 'USER_CREATED',
            meta: {
              userName: user.name,
              userEmail: user.email,
              role: user.role,
            }
          }
        });

        return user;
      });

      // Generate token
      const token = AuthService.generateToken(result.id);

      res.status(201).json({
        message: "Company and admin user created successfully",
        user: {
          id: result.id,
          name: result.name,
          email: result.email,
          role: result.role,
          company: result.company,
        },
        token,
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user with company
      const user = await prisma.user.findUnique({
        where: { email },
        include: { 
          company: true,
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await AuthService.comparePassword(
        password,
        user.passwordHash
      );

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate token
      const token = AuthService.generateToken(user.id);

      // Create audit log
      await prisma.auditLog.create({
        data: {
          companyId: user.companyId,
          userId: user.id,
          action: 'USER_LOGIN',
          meta: {
            loginTime: new Date().toISOString(),
          }
        }
      });

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          manager: user.manager,
          isManagerApprover: user.isManagerApprover,
        },
        token,
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          company: true,
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          },
          directReports: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          manager: user.manager,
          directReports: user.directReports,
          isManagerApprover: user.isManagerApprover,
          createdAt: user.createdAt,
        }
      });

    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async logout(req, res) {
    try {
      // Create audit log for logout
      await prisma.auditLog.create({
        data: {
          companyId: req.user.companyId,
          userId: req.user.id,
          action: 'USER_LOGOUT',
          meta: {
            logoutTime: new Date().toISOString(),
          }
        }
      });

      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}