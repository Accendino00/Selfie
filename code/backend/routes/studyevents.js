let express = require("express");
let config = require("../config");
let router = express.Router();
const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

router.put('/modifyAndDeleteStudyEventsFromPomodoro', authenticateJWT, (req, res) => {
    // I save the titles of the study events from current date, then I delete them
    // and create a single unified study events with the sum of the pomodoros parameters
    // that are passed in the body
    return new Promise((resolve, reject) => {
        try {
            const username = req.body.username;
            const dates = req.body.dates; // Ensure dates are Date objects
            const studyTime = req.body.studyTime;
            const breakTime = req.body.breakTime;
            const totalMinutes = req.body.totalMinutes;
            const cycles = req.body.cycles;
            console.log('Modifying and deleting StudyEvents from Pomodoro:', req.body);
            const StudyEventsCollection = clientMDB.db("SelfieGD").collection('StudyEvents');
            StudyEventsCollection.find({
                name: username,
                start: { $in: dates } // Find documents where date is in the provided dates array
            }).toArray().then((StudyEvents) => {
                console.log(StudyEvents);
                const titles = StudyEvents.map((StudyEvent) => {
                    return StudyEvent.title;
                });
                console.log(titles);
                StudyEventsCollection.deleteMany({
                    name: username,
                    start: { $in: dates }, // Delete documents where date is in the provided dates array
                }).then((result) => {
                    const newStudyEvent = {
                        name: username,
                        description: "Unification of Study Events",
                        title: titles.join(' + '),
                        studyTime: studyTime,
                        breakTime: breakTime,
                        totalMinutes: totalMinutes,
                        cycles: cycles,
                        isStudyEvent: true,
                        borderColor: '#FF007F',
                        isLate: true,
                        start: new Date().toISOString(),
                        end: new Date().toISOString(),
                        completed: false,
                        allDay: true
                    };
                    saveStudyEventtoDB(newStudyEvent).then((savedStudyEvent) => {
                        res.json(savedStudyEvent);
                    }).catch((error) => {
                        console.log(error);
                        res.status(500).send('Error adding StudyEvent');
                    });
                }).catch((error) => {
                    console.log(error);
                    res.status(500).send('Error deleting StudyEvents');
                });
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Error getting StudyEvents');
            });
        } catch (err) {
            reject(err);
        }
    });
});



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
