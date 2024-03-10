let express = require("express");
let config = require("../config");
let router = express.Router();

let events = [];

router.get('/getEvents', (req, res) => {
    res.json(events);
});

router.post('/addEvents', (req, res) => {
    let event = req.body;
    events.push(event);
    res.json(events);
});


router.put('/modifyEvents/:id', (req, res) => {
    const { id } = req.params;
    console.log(req.params)
    const index = events.findIndex(event => event.id === id);
    if (index >= 0) {
      // Update the event at index
      events[index] = { ...events[index], ...req.body };
      console.log(events)
      res.json(events);
    } else {
      res.status(404).send('Event not found');
    }
  });
  
  router.delete('/deleteEvents/:id', (req, res) => {
    const { id } = req.params;
    events = events.filter(event => event.id !== id);
    res.json(events)
  });

module.exports = router;


