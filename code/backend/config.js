/*
    Configurazione del server e dei dati utili.
*/
require('dotenv').config();

let configData = {
    // Dati per il server
    PORT : 8000,
    DATABASE_URL : "mongodb+srv://admin:admin@selfiegd.f09rafy.mongodb.net/?retryWrites=true&w=majority&appName=SelfieGD",
    SECRET_KEY: "censored", // Per JWT
    
    // Directory usate
    FRONTEND_DIST_PATH : __dirname + "/../frontend/dist/",
    ROUTESERVIZI : __dirname + "/routes",
    
}


module.exports = configData;