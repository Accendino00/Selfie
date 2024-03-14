let express = require('express');
let router = express.Router();

const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

function saveNoteToDatabase(title, note) {
    return new Promise((resolve, reject) => {
        try { 
            const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
            notesCollection.insertOne({ title: title, note: note }).then((result) => {
                resolve({ 
                    id: result.insertedId.toString(), // Ottieni l'ID inserito e convertilo in stringa
                    title: title,
                    note: note
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

    const title = req.body.title;
    const note = req.body.note;
    if (!note) {
        res.status(400).send({ message: "Note is required" });
        return;
    }

        // Nel tuo endpoint POST
    saveNoteToDatabase(title, note).then((savedNote) => {
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

    getNotesFromDatabase().then((notes) => {
        res.status(200).send(notes);
    }).catch((error) => {
        console.error("Failed to fetch notes", error);
        res.status(500).send({ message: "Failed to fetch notes" });
    });
});

router.get("/notes/:id", authenticateJWT, function (req, res) {
    if (res.statusCode != 200) return;  // If the middleware didn't authenticate the user, return

    const id = req.params.id;
    if (!id) {
        res.status(400).send({ message: "ID is required" });
        return;
    }

    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.findOne({ _id: new ObjectId(id) })
    .then((note) => {
        if (!note) {
            res.status(404).send({ message: "Note not found" });
        } else {
            res.status(200).send({ 
                id: note._id.toString(), // Assicurati di convertire ObjectId in stringa
                title: note.title,
                note: note.note
            });
        }
    })
    .catch((error) => {
        console.error("Failed to fetch the note", error);
        res.status(500).send({ message: "Failed to fetch the note" });
    });
});

router.put("/notes/:id", authenticateJWT, function (req, res) {
    if (res.statusCode != 200) return; // If the middleware didn't authenticate the user, return

    const id = req.params.id;
    if (!id) {
        res.status(400).send({ message: "ID is required" });
        return;
    }

    const title = req.body.title;
    const note = req.body.note;
    if (!note) {
        res.status(400).send({ message: "Note is required" });
        return;
    }

    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, note: note } })
    .then(result => {
        if (result.matchedCount === 0) {
            res.status(404).send({ message: "Note not found" });
        } else {
            // Fetch the updated document
            notesCollection.findOne({ _id: new ObjectId(id) })
            .then(updatedNote => {
                if (!updatedNote) {
                    res.status(404).send({ message: "Note not found after update" });
                } else {
                    res.status(200).send({ 
                        id: updatedNote._id.toString(), // Convert ObjectId to string
                        title: updatedNote.title,
                        note: updatedNote.note
                    });
                }
            })
            .catch(error => {
                console.error("Failed to fetch the updated note", error);
                res.status(500).send({ message: "Failed to fetch the updated note" });
            });
        }
    })
    .catch((error) => {
        console.error("Failed to update the note", error);
        res.status(500).send({ message: "Failed to update the note" });
    });
});


module.exports = router;
