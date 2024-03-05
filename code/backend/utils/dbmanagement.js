/**
 * @file dbmanagement.js
 * @version 1.0.0
 */

// Librerie di MongoDB
const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require("../config"); // Contiene variabili utili per il server
const e = require("express");

let dbs = ["SelfieGD"];
let collections = {
  SelfieGD: ["Users", "Calendar", "Notes"],
};

// Client per MongoDB
const clientMDB = new MongoClient(config.DATABASE_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Funzione che gestisce la connessione al database
async function connectToDatabase() {
  try {
    // Connettiamo il cliente al server
    await clientMDB.connect();
    console.log("Connesso con successo a MongoDB");

    ensureDbAndCollectionsExist(dbs, collections);

  } catch (error) {
    console.error("Connessione a MongoDB fallita:", error);

    // Riproviamo a connetterci dopo 5 secondi
    setTimeout(() => {
      connectToDatabase.catch((error) =>
        console.error("Errore nell riconessione: ", error)
      );
    }, 5000);
  }
}

// Funzione che gestisce la disconnessione dal database
async function disconnectFromDatabase() {
  try {
    await clientMDB.close();
    console.log("Disconnesso con successo da MongoDB");
  } catch (error) {
    console.error("Disconnessione da MongoDB fallita:", error);
  }
}

// In caso di disconnessione, proviamo a riconnetterci
clientMDB.on("disconnected", () => {
  console.log("Disconnesso da MongoDB");

  // Riproviamo a connetterci dopo 5 secondi
  setTimeout(() => {
    connectToDatabase.catch((error) =>
      console.error("Errore nell riconessione: ", error)
    );
  }, 5000);
});

/**
 * Assicurarsi che il dabatase e le collezioni esistano
 *
 * @param {string[]} dbs - Array dei nomi dei database da creare
 * @param {Object} collections - Array delle collezioni da controllare.
 */
async function ensureDbAndCollectionsExist(dbs, collections) {
  try {
    for (const dbName of dbs) {
      const db = clientMDB.db(dbName);

      // Check if the database exists by listing its collections
      const existingCollections = await db
        .listCollections({}, { nameOnly: true })
        .toArray();

      if (existingCollections.length === 0) {
        // If no collections exist, create and then drop a dummy collection to ensure the database is created
        await db.createCollection("dummyCollection");
        await db.collection("dummyCollection").drop();
      }

      // Create specified collections if they don't exist
      const existingCollectionNames = existingCollections.map((c) => c.name);
      if (collections[dbName]) {
        for (const collectionName of collections[dbName]) {
          if (!existingCollectionNames.includes(collectionName)) {
            await db.createCollection(collectionName);
            console.log(`Collezione ${collectionName} creata in ${dbName}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(
      "Errore nell'assicurarsi che tutti i DB e le collezioni esistano:",
      error
    );
  }

  console.log("DB e collezioni confermati tutti esistenti");
}



/** MODULE EXPORTS **/

module.exports = {
  clientMDB,
  connectToDatabase,
  disconnectFromDatabase,
};
