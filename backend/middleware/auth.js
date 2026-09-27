import jwt from "jsonwebtoken";
import { User } from "../models/Users.js";

// to create jwt token
export function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ sub: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
}

// to check user is logged in or not
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(400).json({ error: "Missing Token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(400).json({ error: "User not found" });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid Token" });
  }
}

export default requireAuth;

// if token is found attach it or else make it anonymous
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (user) req.user = user;
    }
  } catch (err) {
    // otherwise invalid
  }

  return next();
}