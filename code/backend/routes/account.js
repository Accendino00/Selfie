let express = require("express");
let config = require("../config");
let router = express.Router();

let { clientMDB } = require("../utils/dbmanagement");
let {
  authenticateJWT,
  nonBlockingAutheticateJWT,
  getUserId,
} = require("../middleware/authorization");

/**
 * Gestione della richiesta "/api/account/getAccountData"
 * 
 * La richista sarà del tipo:
    GET /api/login HTTP/1.1
    User-Agent: Mozilla/4.0 (compatible; MSIE5.01; Windows NT)  // Questo potrebbe essere diverso
    Host:                                    // Per ora localhost:8000
    Content-Type: json
    Content-Length: <lenght calcolata>
    Authentication: Bearer <token>                              // Da qui possiamo determinare il suo username
 * 
 */
router.get("/getAccountData", authenticateJWT, function (req, res) {
  // req.user dovrebbe essere impostato con il nome utente che dobbiamo cercare nel DB
  const username = req.user.username;
  // Se username non è definito allo ritorniamo 403 e un messaggio di errore
  if (!username) {
    res.status(403).send({
      success: false,
      message: "Non sei autorizzato",
    });
  }

  getAccountData(username, res);
});

// Questa è la versione che va a ricercare gli account dal db dato l'username
router.get("/getAccountData/:username", function (req, res) {
  let username = req.params.username;
  // Se username non è definito allo ritorniamo 403 e un messaggio di errore
  if (!username) {
    res.status(403).send({
      success: false,
      message:
        "Non sei autorizzato a richiedere questo URL senza essere loggato",
    });
  }

  getAccountData(username, res);
});

function getAccountData(username, res) {
  // Prendiamo il profilo utente dal database
  const usersCollection = clientMDB.db("SelfieGD").collection("Users");
  usersCollection
    .findOne({ username: username })
    .then((user) => {
      if (!user) {
        res.status(404).send({
          success: false,
          message: "Utente non trovato",
        });
      } else {
        res.status(200).send({
          success: true,
          message: "Utente trovato",
          data: username,
        });
      }
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: "Errore interno",
      });
    });
}


module.exports = router;
