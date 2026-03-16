import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenBlacklist } from "../models/tokenBlacklist";
import { Login } from "../models/login";

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; jti: string; tokenVersion: number };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: number; email: string; role: string; jti: string; tokenVersion: number };

    const isBlacklisted = await TokenBlacklist.findOne({ where: { jti: decoded.jti } });
    if (isBlacklisted) return res.status(401).json({ message: "Token revoked" });

    const user = await Login.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: "Token revoked" });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      jti: decoded.jti,
      tokenVersion: decoded.tokenVersion,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorize = (allowedRoles: string[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated" });

    if (allowedRoles.length === 0) return next();

    const userRole = req.user.role ?? "";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    return next();
  };
};