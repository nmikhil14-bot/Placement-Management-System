import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "./models";

export const JWT_SECRET = process.env.JWT_SECRET || "university_campus_placement_secret_key_2026_2027";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: "student" | "admin" | "recruiter";
    name: string;
  };
}

export function generateToken(payload: { userId: string; email: string; role: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token is missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: "student" | "admin" | "recruiter";
      name: string;
    };
    
    // Check if user still exists
    const userExists = await User.findById(decoded.userId);
    if (!userExists) {
      res.status(403).json({ error: "User no longer exists" });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired access token" });
  }
}

export function authorizeRoles(...allowedRoles: ("student" | "admin" | "recruiter")[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: Insufficient privileges" });
      return;
    }

    next();
  };
}
