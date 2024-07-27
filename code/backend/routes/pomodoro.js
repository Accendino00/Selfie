let express = require('express');
let router = express.Router();

const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

router.get('/getLastPomodoro', authenticateJWT, async (req, res) => {
    const userId = req.query.userId;
    const pomodoroCollection = clientMDB.db("SelfieGD").collection('Pomodoros');
    try {
        const lastPomodoro = await pomodoroCollection.find({ user: userId }).sort({ creationDate: -1 }).limit(1).toArray();
        if (lastPomodoro.length > 0) {
            res.json(lastPomodoro[0]);
        } else {
            res.status(404).send('No pomodoro found for this user');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting last pomodoro');
    }
});

router.get('/getFirstPomodoro', authenticateJWT, async (req, res) => {
    const userId = req.query.userId;
    const pomodoroCollection = clientMDB.db("SelfieGD").collection('Pomodoros');
    try {
        const firstPomodoro = await pomodoroCollection.find({ user: userId }).sort({ creationDate: 1 }).limit(1).toArray();
        if (firstPomodoro.length > 0) {
            res.json(firstPomodoro[0]);
        } else {
            res.status(404).send('No pomodoro found for this user');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting first pomodoro');
    }
});


router.post('/savePomodoro', authenticateJWT, async (req, res) => {
    const pomodoro = req.body;
    const pomodoroCollection = clientMDB.db("SelfieGD").collection('Pomodoros');
    try {
        const result = await pomodoroCollection.insertOne(pomodoro);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving pomodoro');
    }
});

module.exports = router;