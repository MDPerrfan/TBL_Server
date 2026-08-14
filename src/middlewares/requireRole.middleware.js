import ApiError from "../utils/ApiError.js";

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.dbUser) {
      throw new ApiError(401, "Unauthorized — please sign in");
    }

    if (!allowedRoles.includes(req.dbUser.role)) {
      throw new ApiError(403, "Forbidden — insufficient permissions");
    }

    next();
  };
};

export default requireRole;