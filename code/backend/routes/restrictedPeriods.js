let express = require("express");
let config = require("../config");
let router = express.Router();
const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

// Get restricted periods for a specific user
router.get('/restrictedPeriods', authenticateJWT, (req, res) => {
  return new Promise((resolve, reject) => {
    try {
      const username = req.query.username;
      const restrictedPeriodsCollection = clientMDB.db("SelfieGD").collection('RestrictedPeriods');
      restrictedPeriodsCollection.find({ username }).toArray().then((restrictedPeriods) => {
        res.json(restrictedPeriods);
      }).catch((err) => {
        console.log(err);
        res.status(500).send('Error getting restricted periods');
      });
    } catch (err) {
      reject(err);
    }
  });
});

// Add restricted period
router.post('/restrictedPeriods', authenticateJWT, (req, res) => {
  return new Promise((resolve, reject) => {
    try {
      const restrictedPeriod = {
        start: new Date(req.body.start),
        end: new Date(req.body.end),
        username: req.body.username
      };
      const restrictedPeriodsCollection = clientMDB.db("SelfieGD").collection('RestrictedPeriods');
      restrictedPeriodsCollection.insertOne(restrictedPeriod).then((result) => {
        res.status(201).json(restrictedPeriod);
      }).catch((err) => {
        console.log(err);
        res.status(500).send('Error adding restricted period');
      });
    } catch (err) {
      reject(err);
    }
  });
});

// Delete restricted period
router.delete('/restrictedPeriods/:id', authenticateJWT, (req, res) => {
  return new Promise((resolve, reject) => {
    try {
      const restrictedPeriodsCollection = clientMDB.db("SelfieGD").collection('RestrictedPeriods');
      restrictedPeriodsCollection.deleteOne({ _id: new ObjectId(req.params.id) }).then((result) => {
        if (result.deletedCount === 1) {
          res.json({ success: true });
        } else {
          res.status(404).json({ success: false, message: 'Restricted period not found' });
        }
      }).catch((err) => {
        console.log(err);
        res.status(500).send('Error deleting restricted period');
      });
    } catch (err) {
      reject(err);
    }
  });
});

module.exports = router;
