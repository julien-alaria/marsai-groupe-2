import jwt from "jsonwebtoken";
import db from "../models/index.js";
const User = db.User;

export default function AuthMiddleware(roles = []) {

  return async function(req, res, next) {

    const authHeader = req.header("Authorization");
    const [prefix, token] = authHeader?.split(" ") || [null, undefined];

    if (prefix !== "Bearer") {
      return res.status(401).json({ error: "No Bearer token" });
    }

    if (!token) {
      return res.status(401).json({ error: "You must be authenticated to access this resource" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.id) {
        return res.status(401).json({ error: "Invalid Payload" });
      }

      const user = await User.findOne({
        where: { id_user: decoded.id },
      });


      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // FIX: Return 403 (Forbidden) when authenticated but missing required role,
      // instead of 401 (Unauthenticated). This allows the frontend to distinguish
      // "not logged in" from "logged in but not allowed".
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          error: "Permission denied, you are not authorized to access this resource",
        });
      }

      req.user = user;
      return next();

    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  };
}