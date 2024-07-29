let express = require('express');
let router = express.Router();

const { authenticateJWT } = require('../middleware/authorization');
const { clientMDB } = require('../utils/dbmanagement');
const { ObjectId } = require('mongodb');

router.get('/getMessages', authenticateJWT, async (req, res) => {
    const username = req.query.username;
    const messagesCollection = clientMDB.db("SelfieGD").collection('Messages');
    try {
        const messages = await messagesCollection.find({ receiver: username }).toArray();
        console.log('Messages fetched:', messages);
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting messages');
    }
});

router.post('/sendMessage', authenticateJWT, async (req, res) => {
    const message = req.body;
    const messagesCollection = clientMDB.db("SelfieGD").collection('Messages');
    try {
        const result = await messagesCollection.insertOne(message);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending message');
    }
});

router.delete('/deleteMessage', authenticateJWT, async (req, res) => {
    const messageId = req.query.messageId;
    const messagesCollection = clientMDB.db("SelfieGD").collection('Messages');
    console.log('Deleting message with id:', messageId);
    try {
        const result = await messagesCollection.deleteOne({ _id: new ObjectId(messageId) });
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting message');
    }
});


module.exports = router;