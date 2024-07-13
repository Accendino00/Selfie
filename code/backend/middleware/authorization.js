const jwt = require("jsonwebtoken");
let config = require("../config");

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, config.SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).send({
          success: false,
          message: "Unauthorized",
        });
      }

      req.user = user;
      next();
    });
  } else {
    return res.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }
};

const nonBlockingAutheticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, config.SECRET_KEY, (err, user) => {
      if (err) {
        // Si blocca solo se si prova a fare l'autorizzazione ma non si ha i permessi di farla
        return res.status(403).send({
          success: false,
          message: "Unauthorized",
        });
      }

      req.user = user;
    });
  }
  next();
};

// Funzione per ottenere l'ID dell'utente
const getUserId = (req, res) => {
  res.json({ userId: req.user });
};

module.exports = {
  authenticateJWT: authenticateJWT,
  nonBlockingAutheticateJWT: nonBlockingAutheticateJWT,
  getUserId: getUserId,
};
