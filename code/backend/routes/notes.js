let express = require('express');
let router = express.Router();

const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

function saveNoteToDatabase(note) {
    return new Promise((resolve, reject) => {
        try { 
            const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
            notesCollection.insertOne({ title: note.title, note: note }).then((result) => {
                resolve({ 
                    id: result.insertedId.toString(), // Ottieni l'ID inserito e convertilo in stringa
                    ...note 
                });
            }).catch((error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    }
    );
}

function deleteNoteFromDatabase(id) {
    return new Promise((resolve, reject) => {
        const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
        notesCollection.deleteOne({ _id: new ObjectId(id) })
        .then(result => {
            if (result.deletedCount === 0) {
                reject(new Error('No note found with that id'));
            } else {
                resolve();
            }
        })
        .catch((error) => {
            reject(error);
        });
    });
}

function getNotesFromDatabase() {
    return new Promise((resolve, reject) => {
        const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
        notesCollection.find().toArray()
        .then((notes) => {
            const notesWithCorrectId = notes.map(note => ({ 
                id: note._id.toString(), // Assicurati di convertire ObjectId in stringa
                title: note.title,
                note: note.note
            }));
            resolve(notesWithCorrectId);
        }).catch((error) => {
            reject(error);
        });
    });
}

router.post("/notes", authenticateJWT, function (req, res) {
    if (res.statusCode != 200) return;  // If the middleware didn't authenticate the user, return

    const note = req.body.note;
    if (!note) {
        res.status(400).send({ message: "Note is required" });
        return;
    }

        // Nel tuo endpoint POST
    saveNoteToDatabase(note).then((savedNote) => {
        res.status(201).send(savedNote); // Assicurati che savedNote includa l'id generato dal MongoDB
    }).catch((error) => {
        console.error("Failed to save the note", error);
        res.status(500).send({ message: "Failed to save the note" });
    });
});

router.delete("/notes/:id", authenticateJWT, function (req, res) {
    if (res.statusCode != 200) return;  // If the middleware didn't authenticate the user, return

    const id = req.params.id;
    if (!id) {
        res.status(400).send({ message: "ID is required" });
        return;
    }

    deleteNoteFromDatabase(id).then(() => {
        res.status(204).send();
    }).catch((error) => {
        console.error("Failed to delete the note", error);
        res.status(500).send({ message: "Failed to delete the note" });
    });
});

router.get("/notes", authenticateJWT, function (req, res) {
    if (res.statusCode != 200) return;  // If the middleware didn't authenticate the user, return

    const notes = getNotesFromDatabase().then((notes) => {
        res.status(200).send(notes);
    }).catch((error) => {
        console.error("Failed to fetch notes", error);
        res.status(500).send({ message: "Failed to fetch notes" });
    });
});

module.exports = router;
