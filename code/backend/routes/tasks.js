let express = require("express");
let config = require("../config");
let router = express.Router();
const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');


router.get('/getSingleTask/:id', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const id = req.query.id;
            const tasksCollection = clientMDB.db("SelfieGD").collection('Tasks');
            tasksCollection.findOne({ _id: new ObjectId(id) }).then((task) => {
                //task.id = task._id.toString();
                res.json(task);
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Error getting task');
            });
        } catch (err) {
            reject(err);
        }
    });
}
);

router.get('/getTasksGeneric', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const username = req.query.username;
            const tasksCollection = clientMDB.db("SelfieGD").collection('Tasks');

            tasksCollection.find({
                name: username,
            }).toArray().then((tasks) => {
                // Converti _id in stringa per ogni evento
                const tasksWithCorrectId = tasks.map((task) => {
                    //task.id = task._id.toString();
                    return task;
                });

                res.json(tasksWithCorrectId);
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Error getting tasks');
            });
        } catch (err) {
            reject(err);
        }
    });
}
);


router.get('/getTasks', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
        const username = req.query.username;
        const tasksCollection = clientMDB.db("SelfieGD").collection('Tasks');
        const query = {
            $or: [
                { name: username },
                { users: username }
            ]
        };
        tasksCollection.find(query).toArray().then((tasks) => {
            const tasksWithCorrectId = tasks.map((task) => {
                task.id = task._id.toString();
                return task;
            });

            res.json(tasksWithCorrectId);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Error getting tasks');
        });
        } catch (err) {
            reject(err);
        }
    }
    );
}
);


function saveTasktoDB(task){
    return new Promise((resolve, reject) => {
        try {
            const tasksCollection = clientMDB.db("SelfieGD").collection('Tasks');
            tasksCollection.insertOne(task).then((result) => {
                task.id = result.insertedId.toString();
                resolve(task);
            }).catch((error) => {
                console.log(error);
                reject('Error adding task');
            });
        } catch (error) {
            reject(error);
        }
    });

}

router.post('/addTask', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            console.log('Adding task backend:', req.body);
            const task = req.body;
            saveTasktoDB(task).then((savedTask) => {
                res.json(savedTask);
            }).catch((error) => {
                console.log(error);
                res.status(500).send('Error adding task');
            });
        }
        catch (error) {
            reject(error);
        }
    }
    );
}
);

router.put('/modifyTask/:id', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const id = req.params.id;
            const task = req.body;
            const tasksCollection = clientMDB.db("SelfieGD").collection('Tasks');
            tasksCollection.updateOne({ _id: new ObjectId(id) }, { $set: task }).then((result) => {
                if (result.matchedCount === 0) {
                    res.status(404).send('No task found with that id');
                } else {
                    res.json(task);
                }
            }).catch((error) => {
                console.log(error);
                res.status(500).send('Error modifying task');
            });
        } catch (error) {
            reject(error);
        }
    });
}
);

router.delete('/deleteTask/:id', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const id = req.params.id;
            
            const tasksCollection = clientMDB.db("SelfieGD").collection('Tasks');
            tasksCollection.deleteOne({ _id: new ObjectId(id) }).then((result) => {
                res.json(result);
            }).catch((error) => {
                
                res.status(500).send('Error deleting task');
            });
        } catch (error) {
            
            res.status(500).send('Error deleting task');
        }
    });
});

module.exports = router;
