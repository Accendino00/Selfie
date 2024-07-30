let express = require("express");
let config = require("../config");
let router = express.Router();
const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

router.get('/getCalendars', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
      try {
        const userId = req.query.userId;
        const calendarCollection = clientMDB.db("SelfieGD").collection('Calendars');
        calendarCollection.find({ user: userId }).toArray().then((calendars) => {
          const calendarsWithCorrectId = calendars.map((calendar) => {
            calendar.id = calendar._id.toString();
            return calendar;
          });
          res.json(calendarsWithCorrectId);
        }).catch((err) => {
          console.log(err);
          res.status(500).send('Error getting calendars');
        }
      );
      } catch (err) {
        reject(err);
      }
    }
  )}
);

function saveCalendarToDB(calendar) {
  return new Promise((resolve, reject) => {
    try {
      const calendarCollection = clientMDB.db("SelfieGD").collection('Calendars');
      calendarCollection.insertOne(calendar).then((result) => {
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

router.post('/createCalendars', authenticateJWT, (req, res) => {
    return new Promise((resolve, reject) => {
      const calendar = req.body;
      saveCalendarToDB(calendar).then((savedCalendar) => {
        res.json(savedCalendar);
      }).catch((err) => {
        console.log(err);
        res.status(500).send('Error adding calendar');
      });
    }
  )}
);

router.delete('/deleteCalendar', authenticateJWT, async (req, res) => {
    try {
      const calendarCollection = clientMDB.db("SelfieGD").collection('Calendars');
      const result = await calendarCollection.deleteOne({ _id: new ObjectId(req.body.id) });
  
      if (result.deletedCount === 1) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'Calendar not found' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Error deleting calendar');
    }
  });

router.get('/getCalendar', authenticateJWT, async (req, res) => {
  try {
    const response = await fetch('https://calendar.google.com/calendar/ical/38d6a54381102a45fedc744e87204280d3df7ca63f7aa9216c7ffa5536ec33c9%40group.calendar.google.com/public/basic.ics');
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
    res.status(500).send('Failed to fetch calendar');
  }
}
);

module.exports = router;
