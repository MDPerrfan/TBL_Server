const isDangerousKey = (key) => key.startsWith("$") || key.includes(".");

const sanitizeInPlace = (obj) => {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    if (isDangerousKey(key)) {
      delete obj[key];
      continue;
    }
    if (obj[key] && typeof obj[key] === "object") {
      sanitizeInPlace(obj[key]);
    }
  }
};

// Mutates req.body / req.params / req.query IN PLACE.
// Never reassigns req.query directly — Express 4.21+ made it
// a getter-only property, and reassignment crashes the request.
const mongoSanitize = (req, res, next) => {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.params);
  sanitizeInPlace(req.query);
  next();
};

export default mongoSanitize;