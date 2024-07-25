let express = require("express");
let config = require("../config");
let router = express.Router();
const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');


router.get('/getSingleStudyEvent/:id', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const id = req.query.id;
            const StudyEventsCollection = clientMDB.db("SelfieGD").collection('StudyEvents');
            StudyEventsCollection.findOne({ _id: new ObjectId(id) }).then((StudyEvent) => {
                //StudyEvent.id = StudyEvent._id.toString();
                res.json(StudyEvent);
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Error getting StudyEvent');
            });
        } catch (err) {
            reject(err);
        }
    });
}
);

router.get('/getStudyEventsGeneric', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const username = req.query.username;
            const StudyEventsCollection = clientMDB.db("SelfieGD").collection('StudyEvents');

            StudyEventsCollection.find({
                name: username,
            }).toArray().then((StudyEvents) => {
                // Converti _id in stringa per ogni evento
                const StudyEventsWithCorrectId = StudyEvents.map((StudyEvent) => {
                    //StudyEvent.id = StudyEvent._id.toString();
                    return StudyEvent;
                });

                res.json(StudyEventsWithCorrectId);
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Error getting StudyEvents');
            });
        } catch (err) {
            reject(err);
        }
    });
}
);


router.get('/getStudyEvents', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
        const username = req.query.username;
        const StudyEventsCollection = clientMDB.db("SelfieGD").collection('StudyEvents');
        
        StudyEventsCollection.find({
            name: username,
        }).toArray().then((StudyEvents) => {
            const StudyEventsWithCorrectId = StudyEvents.map((StudyEvent) => {
                StudyEvent.id = StudyEvent._id.toString();
                return StudyEvent;
            });

            res.json(StudyEventsWithCorrectId);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Error getting StudyEvents');
        });
        } catch (err) {
            reject(err);
        }
    }
    );
}
);


function saveStudyEventtoDB(StudyEvent){
    return new Promise((resolve, reject) => {
        try {
            const StudyEventsCollection = clientMDB.db("SelfieGD").collection('StudyEvents');
            StudyEventsCollection.insertOne(StudyEvent).then((result) => {
                StudyEvent.id = result.insertedId.toString();
                resolve(StudyEvent);
            }).catch((error) => {
                console.log(error);
                reject('Error adding StudyEvent');
            });
        } catch (error) {
            reject(error);
        }
    });

}

router.post('/addStudyEvent', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            console.log('Adding StudyEvent backend:', req.body);
            const StudyEvent = req.body;
            saveStudyEventtoDB(StudyEvent).then((savedStudyEvent) => {
                res.json(savedStudyEvent);
            }).catch((error) => {
                console.log(error);
                res.status(500).send('Error adding StudyEvent');
            });
        }
        catch (error) {
            reject(error);
        }
    }
    );
}
);

router.put('/modifyStudyEvent/:id', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const id = req.params.id;
            const StudyEvent = req.body;
            const StudyEventsCollection = clientMDB.db("SelfieGD").collection('StudyEvents');
            StudyEventsCollection.updateOne({ _id: new ObjectId(id) }, { $set: StudyEvent }).then((result) => {
                if (result.matchedCount === 0) {
                    res.status(404).send('No StudyEvent found with that id');
                } else {
                    res.json(StudyEvent);
                }
            }).catch((error) => {
                console.log(error);
                res.status(500).send('Error modifying StudyEvent');
            });
        } catch (error) {
            reject(error);
        }
    });
}
);

router.delete('/deleteStudyEvent/:id', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const id = req.params.id;
            
            const StudyEventsCollection = clientMDB.db("SelfieGD").collection('StudyEvents');
            StudyEventsCollection.deleteOne({ _id: new ObjectId(id) }).then((result) => {
                res.json(result);
            }).catch((error) => {
                
                res.status(500).send('Error deleting StudyEvent');
            });
        } catch (error) {
            
            res.status(500).send('Error deleting StudyEvent');
        }
    });
});

module.exports = router;
