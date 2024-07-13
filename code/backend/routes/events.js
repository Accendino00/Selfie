let express = require("express");
let config = require("../config");
let router = express.Router();
const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');




router.get('/getEvents', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
      try {
        const calendarCollection = clientMDB.db("SelfieGD").collection('Events');
        calendarCollection.find({}).toArray().then((events) => {
          const eventsWithCorrectId = events.map((event) => {
            event.id = event._id.toString();
            return event;
          });
          res.json(eventsWithCorrectId);
        }).catch((err) => {
          console.log(err);
          res.status(500).send('Error getting events');
        }
      );
      } catch (err) {
        reject(err);
      }
    }
  )}
);

function saveEventToDB(event) {
  return new Promise((resolve, reject) => {
    try {
      const calendarCollection = clientMDB.db("SelfieGD").collection('Events');
      calendarCollection.insertOne(event).then((result) => {
        result.id = result.insertedId.toString();
        resolve(result);
      }) .catch((error) => {
        reject(error);
      }
    );
    } catch (err) {
      reject(err);
    }
  }
)};

router.post('/addEvents', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
      const event = req.body;
      saveEventToDB(event).then((savedEvent) => {
        res.json(savedEvent);
      }).catch((err) => {
        console.log(err);
        res.status(500).send('Error adding event');
      });
    }
  )}
);

router.put('/modifyEvents/:id', authenticateJWT, (req, res) => {
  return new Promise((resolve, reject) => {
    const id = req.params.id;
    const event = req.body;
    const calendarCollection = clientMDB.db("SelfieGD").collection('Events');
    calendarCollection.updateOne({ _id: new ObjectId(id) }, { $set: event }).then((result) => {
      res.json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Error modifying event');
    });
  }
)}
);


  
router.delete('/deleteEvents/:id', (req, res) => {
  return new Promise((resolve, reject) => {
    const id = req.params.id;
    const calendarCollection = clientMDB.db("SelfieGD").collection('Events');
    calendarCollection.deleteOne({ _id: new ObjectId(id) }).then((result) => {
      res.json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Error deleting event');
    });
  }
)}
);  

module.exports = router;


