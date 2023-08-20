const jwt = require("jsonwebtoken");
const JWT_SECRET = "LakhaniFamily!";

const useMiddleware = (req, res, next) => {
  // GET the user from the jwt token and add  id to req object
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Unauthorized user!" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Unauthorized user!" });
  }
};

module.exports = useMiddleware;
