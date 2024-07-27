let express = require('express');
let router = express.Router();

const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

function saveNoteToDatabase(title, category, note, userId, characters, access, users, creationDate, modificationDate) {
    return new Promise((resolve, reject) => {
        try {
            const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
            notesCollection.insertOne({ title: title, category: category, note: note, userId: userId, characters: characters, access: access, users: users, creationDate: creationDate, modificationDate: modificationDate }).then((result) => {
                resolve({
                    id: result.insertedId.toString(), // Convert inserted ID to string
                    title: title,
                    category: category,
                    note: note,
                    userId: userId,
                    characters: characters,
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
    });
}

function deleteNoteFromDatabase(id) {
    return new Promise((resolve, reject) => {
        if (!ObjectId.isValid(id)) {
            return reject(new Error('Invalid ID format'));
        }
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
    return new Promise((resolve, reject) => {
        const notesCollection = clientMDB.db("SelfieGD").collection("Notes");

        let query;
        if (showSharedNotes === 'true') {
            query = {
                $or: [
                    { userId: userId },
                    { users: username }
                ]
            };
        } else {
            query = { userId: userId };
        }

        notesCollection.find(query).toArray().then((notes) => {
            resolve(notes.map((note) => {
                return {
                    id: note._id.toString(), // Convert ObjectId to string
                    title: note.title,
                    category: note.category,
                    note: note.note,
                    userId: note.userId,
                    characters: note.characters,
                    access: note.access,
                    users: note.users,
                    creationDate: note.creationDate,
                    modificationDate: note.modificationDate
                };
            }));
        }).catch((error) => {
            reject(error);
        });
    });
}

router.post("/notes", authenticateJWT, function (req, res) {
    if (res.statusCode != 200) return;  // If the middleware didn't authenticate the user, return

    const title = req.body.title;
    const category = req.body.category;
    const note = req.body.note;
    const userId = req.body.userId;
    const characters = req.body.characters;
    const access = req.body.access;
    const users = req.body.users;
    const creationDate = req.body.creationDate;
    const modificationDate = req.body.modificationDate;
    if (!note) {
        res.status(400).send({ message: "Note is required" });
        return;
    }

    // Save the note to the database
    saveNoteToDatabase(title, category, note, userId, characters, access, users, creationDate, modificationDate).then((savedNote) => {
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
    if (!id || !ObjectId.isValid(id)) {
        res.status(400).send({ message: "Valid ID is required" });
        return;
    }

    const userAdded = req.body.userAdded;
    if (!userAdded) {
        res.status(400).send({ message: "User to add is required" });
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
                                characters: updatedNote.characters,
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
});

router.delete("/notes/:id", authenticateJWT, function (req, res) {
    if (res.statusCode != 200) return;  // If the middleware didn't authenticate the user, return

    const id = req.params.id;
    if (!id || !ObjectId.isValid(id)) {
        res.status(400).send({ message: "Valid ID is required" });
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
    if (!id || !ObjectId.isValid(id)) {
        res.status(400).send({ message: "Valid ID is required" });
        return;
    }

    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.findOne({ _id: new ObjectId(id) })
        .then((note) => {
            if (!note) {
                res.status(404).send({ message: "Note not found" });
            } else {
                res.status(200).send({
                    id: note._id.toString(), // Convert ObjectId to string
                    title: note.title,
                    category: note.category,
                    note: note.note,
                    userId: note.userId,
                    characters: note.characters,
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
    if (!id || !ObjectId.isValid(id)) {
        res.status(400).send({ message: "Valid ID is required" });
        return;
    }

    const title = req.body.title;
    const category = req.body.category;
    const note = req.body.note;
    const userId = req.body.userId;
    const characters = req.body.characters;
    const access = req.body.access;
    const users = req.body.users;
    const creationDate = req.body.creationDate;
    const modificationDate = req.body.modificationDate;

    if (!note) {
        res.status(400).send({ message: "Note is required" });
        return;
    }

    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, category: category, note: note, userId: userId, characters: characters, access: access, users: users, creationDate: creationDate, modificationDate: modificationDate } })
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
                                characters: updatedNote.characters,
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

router.get("/getLastCreatedNote", authenticateJWT, function (req, res) {
    const userId = req.query.userId;
    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.find({ userId: userId }).sort({ creationDate: -1 }).limit(1).toArray()
        .then((lastNote) => {
            if (lastNote.length > 0) {
                res.status(200).send({
                    id: lastNote[0]._id.toString(), // Convert ObjectId to string
                    title: lastNote[0].title,
                    category: lastNote[0].category,
                    note: lastNote[0].note,
                    userId: lastNote[0].userId,
                    characters: lastNote[0].characters,
                    access: lastNote[0].access,
                    users: lastNote[0].users,
                    creationDate: lastNote[0].creationDate,
                    modificationDate: lastNote[0].modificationDate
                });
            } else {
                res.status(404).send({ message: "No note found for this user" });
            }
        })
        .catch((error) => {
            console.error("Failed to get last note", error);
            res.status(500).send({ message: "Failed to get last note" });
        });
});

router.get("/getFirstCreatedNote", authenticateJWT, function (req, res) {
    const userId = req.query.userId;
    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.find({ userId: userId }).sort({ creationDate: 1 }).limit(1).toArray()
        .then((firstNote) => {
            if (firstNote.length > 0) {
                res.status(200).send({
                    id: firstNote[0]._id.toString(), // Convert ObjectId to string
                    title: firstNote[0].title,
                    category: firstNote[0].category,
                    note: firstNote[0].note,
                    userId: firstNote[0].userId,
                    characters: firstNote[0].characters,
                    access: firstNote[0].access,
                    users: firstNote[0].users,
                    creationDate: firstNote[0].creationDate,
                    modificationDate: firstNote[0].modificationDate
                });
            } else {
                res.status(404).send({ message: "No note found for this user" });
            }
        })
        .catch((error) => {
            console.error("Failed to get first note", error);
            res.status(500).send({ message: "Failed to get first note" });
        });
});

router.get("/getLastModifiedNote", authenticateJWT, function (req, res) {
    const userId = req.query.userId;
    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.find({ userId: userId }).sort({ modificationDate: -1 }).limit(1).toArray()
        .then((lastNote) => {
            if (lastNote.length > 0) {
                res.status(200).send({
                    id: lastNote[0]._id.toString(), // Convert ObjectId to string
                    title: lastNote[0].title,
                    category: lastNote[0].category,
                    note: lastNote[0].note,
                    userId: lastNote[0].userId,
                    characters: lastNote[0].characters,
                    access: lastNote[0].access,
                    users: lastNote[0].users,
                    creationDate: lastNote[0].creationDate,
                    modificationDate: lastNote[0].modificationDate
                });
            } else {
                res.status(404).send({ message: "No note found for this user" });
            }
        })
        .catch((error) => {
            console.error("Failed to get last note", error);
            res.status(500).send({ message: "Failed to get last note" });
        });
});

router.get("/getFirstModifiedNote", authenticateJWT, function (req, res) {
    const userId = req.query.userId;
    const notesCollection = clientMDB.db("SelfieGD").collection("Notes");
    notesCollection.find({ userId: userId }).sort({ modificationDate: 1 }).limit(1).toArray()
        .then((firstNote) => {
            if (firstNote.length > 0) {
                res.status(200).send({
                    id: firstNote[0]._id.toString(), // Convert ObjectId to string
                    title: firstNote[0].title,
                    category: firstNote[0].category,
                    note: firstNote[0].note,
                    userId: firstNote[0].userId,
                    characters: firstNote[0].characters,
                    access: firstNote[0].access,
                    users: firstNote[0].users,
                    creationDate: firstNote[0].creationDate,
                    modificationDate: firstNote[0].modificationDate
                });
            } else {
                res.status(404).send({ message: "No note found for this user" });
            }
        })
        .catch((error) => {
            console.error("Failed to get first note", error);
            res.status(500).send({ message: "Failed to get first note" });
        });
});

module.exports = router;
