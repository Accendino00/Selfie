let express = require('express');
let router = express.Router();

const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

function saveNoteToDatabase(title, category, note, userId, access, users, creationDate, modificationDate) {
    return new Promise((resolve, reject) => {
        try { 
            const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
            notesCollection.insertOne({ title: title, category: category, note: note, userId: userId, access: access, users: users, creationDate: creationDate, modificationDate: modificationDate }).then((result) => {
                resolve({ 
                    id: result.insertedId.toString(), // Ottieni l'ID inserito e convertilo in stringa
                    title: title,
                    category: category,
                    note: note,
                    userId: userId,
                    access: access,
                    users: users,
                    creationDate: creationDate,
                    modificationDate: modificationDate,
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

function getNotesFromDatabase(userId, showSharedNotes, username) {
    if(showSharedNotes === 'true') {
        return new Promise((resolve, reject) => {
            const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
            notesCollection.find({ users: username}).toArray().then((notes) => {
                resolve(notes.map((note) => {
                    return { 
                        id: note._id.toString(), // Convert ObjectId to string
                        title: note.title,
                        category: note.category,
                        note: note.note,
                        userId: note.userId,
                        access: note.access,
                        users: note.users,
                        creationDate: note.creationDate,
                        modificationDate: note.modificationDate
                    };
                }));
            }
            ).catch((error) => {
                reject(error);
            });
        }
        );
    }
    return new Promise((resolve, reject) => {
        const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
        notesCollection.find({ userId: userId }).toArray().then((notes) => {
            resolve(notes.map((note) => {
                return { 
                    id: note._id.toString(), // Convert ObjectId to string
                    title: note.title,
                    category: note.category,
                    note: note.note,
                    userId: note.userId,
                    access: note.access,
                    users: note.users,
                    creationDate: note.creationDate,
                    modificationDate: note.modificationDate
                };
            }));
        }
        ).catch((error) => {
            reject(error);
        });
    }
    );
};

router.post("/notes", authenticateJWT, function (req, res) {
    if (res.statusCode != 200) return;  // If the middleware didn't authenticate the user, return

    const title = req.body.title;
    const category = req.body.category;
    const note = req.body.note;
    const userId = req.body.userId;
    const access = req.body.access;
    const users = req.body.users;
    const creationDate = req.body.creationDate;
    const modificationDate = req.body.modificationDate;
    if (!note) {
        res.status(400).send({ message: "Note is required" });
        return;
    }

        // Nel tuo endpoint POST
    saveNoteToDatabase(title, category, note, userId, access, users, creationDate, modificationDate).then((savedNote) => {
        console.log("Note saved successfully", savedNote);
        res.status(201).send(savedNote); 
    }).catch((error) => {
        console.error("Failed to save the note", error);
        res.status(500).send({ message: "Failed to save the note" });
    });
});


router.post("/notes/:id", authenticateJWT, function (req, res) {
    if (res.statusCode != 200) return;  // If the middleware didn't authenticate the user, return

    const id = req.params.id;
    if (!id) {
        res.status(400).send({ message: "ID is required" });
        return;
    }

    const userAdded = req.body.userAdded;
    if (!users) {
        res.status(400).send({ message: "Users are required" });
        return;
    }

    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.updateOne({ _id: new ObjectId(id) }, { $push: { users: userAdded } })
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
                        category: updatedNote.category,
                        note: updatedNote.note,
                        userId: updatedNote.userId,
                        access: updatedNote.access,
                        users: updatedNote.users,
                        creationDate: updatedNote.creationDate,
                        modificationDate: updatedNote.modificationDate
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
}
);


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
    const userId = req.query.userId;
    const showSharedNotes = req.query.showSharedNotes;
    const username = req.query.username;
    getNotesFromDatabase(userId, showSharedNotes, username).then((notes) => {
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
                category: note.category,
                note: note.note,
                userId: note.userId,
                access: note.access,
                users: note.users,
                creationDate: note.creationDate,
                modificationDate: note.modificationDate
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
    const category = req.body.category;
    const note = req.body.note;
    const userId = req.body.userId;
    const access = req.body.access;
    const users = req.body.users;
    const creationDate = req.body.creationDate;
    const modificationDate = req.body.modificationDate;
    
    if (!note) {
        res.status(400).send({ message: "Note is required" });
        return;
    }

    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, category: category, note: note, userId: userId, access: access, users: users, creationDate: creationDate, modificationDate: modificationDate} })
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
                        category: updatedNote.category,
                        note: updatedNote.note,
                        userId: updatedNote.userId,
                        access: updatedNote.access,
                        users: updatedNote.users,
                        creationDate: updatedNote.creationDate,
                        modificationDate: updatedNote.modificationDate,
                        
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
