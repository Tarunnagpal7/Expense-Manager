import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('⚠️ JWT_SECRET not set in environment');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret);
    if (!decoded?.userId) return res.status(401).json({ error: 'Invalid token' });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { company: true },
    });
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      company: user.company,
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
