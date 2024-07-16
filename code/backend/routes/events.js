let express = require("express");
let config = require("../config");
let router = express.Router();
const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

router.get('/getEventsGeneric', authenticateJWT, (req, res) => {
  return new Promise((resolve, reject) => {
    try {
      const username = req.query.username;
      const calendarCollection = clientMDB.db("SelfieGD").collection('Events');

      calendarCollection.find({
        name: username,
      }).toArray().then((events) => {
        
        // Converti _id in stringa per ogni evento
        const eventsWithCorrectId = events.map((event) => {
          event.id = event._id.toString();
          return event;
        });

        res.json(eventsWithCorrectId);
      }).catch((err) => {
        console.log(err);
        res.status(500).send('Error getting events');
      });
    } catch (err) {
      reject(err);
    }
  });
});

router.get('/getEvents', authenticateJWT, (req, res) => {
  try {
    const calendars = req.query.calendars;
    const username = req.query.username;
    const calendarCollection = clientMDB.db("SelfieGD").collection('Events');

    // Base query to find events by username or shared with the user
    let query = { name: username };

    // If "shared" calendar is in the list, modify the query to include shared events
    if (calendars.includes("shared")) {
      query = {
        $or: [
          { name: username },
          { shared: username }
        ]
      };
    }

    calendarCollection.find(query).toArray().then((events) => {
      let filteredEvents;

      // If only "shared" is in calendars, filter only shared events
      if (calendars.length === 1 && calendars.includes("shared")) {
        filteredEvents = events.filter((event) => event.shared && event.shared.includes(username));
      } else {
        // Otherwise, filter based on both calendars and shared status
        filteredEvents = events.filter((event) => {
          return event.calendar.some(cal => calendars.includes(cal)) || (event.shared && event.shared.includes(username));
        });
      }

      

      // Convert _id to string for each event
      const eventsWithCorrectId = filteredEvents.map((event) => {
        event.id = event._id.toString();
        return event;
      });

      res.json(eventsWithCorrectId);
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Error getting events');
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing request');
  }
});

function getInvitedEvents(username) {
  return new Promise((resolve, reject) => {
    try {
      const calendarCollection = clientMDB.db("SelfieGD").collection('Events');
      calendarCollection.find({}).toArray().then((events) => {
        // Filtra gli eventi per quelli in cui invitedUsers include l'username
        const filteredEvents = events.filter((event) => event.invitedUsers.includes(username));
        
        // Converti _id in stringa per ogni evento
        const eventsWithCorrectId = filteredEvents.map((event) => {
          event.id = event._id.toString();
          return event;
        });

        resolve(eventsWithCorrectId);
      }).catch((err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};



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

function acceptInvitedEvents(username, selectedEvents) {
  return new Promise((resolve, reject) => {
    try {
      const calendarCollection = clientMDB.db("SelfieGD").collection('Events');

      calendarCollection.find({ invitedUsers: username }).toArray().then((events) => {
        if (events.length === 0) {
          return resolve({ message: "No events found for the invited user" });
        }

        // Filter the events to include only those that are in selectedEvents
        const filteredEvents = events.filter(event => selectedEvents.includes(event.title));

        if (filteredEvents.length === 0) {
          return resolve({ message: "No selected events found for the invited user" });
        }

        // Update only the filtered events
        const updatePromises = filteredEvents.map(event =>
          calendarCollection.updateOne(
            { title: event.title },
            { $push: { shared: username } }
          )
        );

        Promise.all(updatePromises).then((results) => {
          resolve(results);
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function declineInvitedEvents(username, event) {
  return new Promise((resolve, reject) => {
    try {
      const calendarCollection = clientMDB.db("SelfieGD").collection('Events');
      return calendarCollection.updateOne(
        { title: event },
        { $pull: { invitedUsers: username } }
      )
      .then((result) => {
        console.log("Declined event", event);
        console.log(result);
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
    } catch (err) {
      reject(err);
    }
  });
}



router.post('/declineInvitedEvents', authenticateJWT, (req, res) => {
  return new Promise((resolve, reject) => {
    const event = req.body.event;
    const username = req.query.username;
    declineInvitedEvents(username, event).then((result) => {
      res.json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Error declining event');
    });
  });
});

router.post('/acceptInvitedEvents', authenticateJWT, (req, res) => {
  return new Promise((resolve, reject) => {
    const username = req.query.username;
    const selectedEvents = req.body.selectedInvitedEvents;
    acceptInvitedEvents(username, selectedEvents).then((result) => {
      res.json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Error accepting event');
    });
  });
});




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

router.get('/getInvitedEvents', authenticateJWT, (req, res) => {
  return new Promise((resolve, reject) => {
    const username = req.query.username;
    getInvitedEvents(username).then((events) => {
      res.json(events);
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Error getting invited events');
    });
  });
});
  
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


