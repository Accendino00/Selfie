import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardActionArea, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import useTokenChecker from '../../utils/useTokenChecker.jsx';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsIcon from '@mui/icons-material/Settings';


const HomePage = () => {
  const navigate = useNavigate();
  const { loginStatus, isTokenLoading, username } = useTokenChecker();
  const token = Cookies.get('token');
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [studyEvents, setStudyEvents] = useState([]);
  const [calendarSettings, setCalendarSettings] = useState(false);
  const [eventsToDisplay, setEventsToDisplay] = useState(0);
  const [tasksToDisplay, setTasksToDisplay] = useState(0);
  const [studyEventsToDisplay, setStudyEventsToDisplay] = useState(0);


  useEffect(() => {
    if (!isTokenLoading) {
      if (!loginStatus) {
        navigate("/login");
      }
    }
  }, [loginStatus, isTokenLoading]);

  useEffect(() => {
    const storedEventsToDisplay = localStorage.getItem('eventsToDisplay');
    const storedTasksToDisplay = localStorage.getItem('tasksToDisplay');
    const storedStudyEventsToDisplay = localStorage.getItem('studyEventsToDisplay');

    if (storedEventsToDisplay) {
      setEventsToDisplay(parseInt(storedEventsToDisplay));
    }
    if (storedTasksToDisplay) {
      setTasksToDisplay(parseInt(storedTasksToDisplay));
    }
    if (storedStudyEventsToDisplay) {
      setStudyEventsToDisplay(parseInt(storedStudyEventsToDisplay));
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/getEventsGeneric?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setEvents(data);

      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/getTasksGeneric?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setTasks(data);

      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    const fetchStudyEvents = async () => {
      try {
        const response = await fetch(`/api/getStudyEventsGeneric?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setStudyEvents(data);

      } catch (error) {
        console.error('Error fetching study events:', error);
      }
    };

    fetchTasks();
    fetchStudyEvents();
    fetchEvents();
  }, [token, username, eventsToDisplay, tasksToDisplay, studyEventsToDisplay, events]);


  function getNextYear() {
    const currentDate = new Date();
    const nextYear = currentDate.getFullYear() + 1;
    return nextYear;
  };

  function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
    let day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function stringToDate(dateString) {
    let [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date
  }

  function calculateAllRecurrencies(event, finalDate) {
    const recurrencies = [];

    let nextStartDate = new Date(event.start);
    let nextEndDate = null;

    if (event.end && !event.isTask) {
      nextEndDate = new Date(event.end);
    } else if (event.endRecur && event.isTask || event.isStudyEvent) {
      nextEndDate = new Date(event.endRecur);
    }

    let counter = 0; // Counter to track the number of repetitions

    // Determine the maximum number of recurrences, if specified
    const maxRecurrences = event.timesToRepeat ? Math.min(event.timesToRepeat, 52) : 52; // Assuming a limit of 52 repetitions or one year

    // Loop until the maximum repetitions are met or the date exceeds the finalDate
    while ((event.timesToRepeat ? counter < maxRecurrences : true) && nextStartDate.getFullYear() <= finalDate) {
      let startDate = formatDate(nextStartDate)
      let endDate = nextEndDate ? formatDate(nextEndDate) : null
      let newEvent = {};

      if (!event.isTask) {
        newEvent = {
          title: event.title,
          description: event.description,
          color: event.color,
          allDay: event.allDay,
          start: startDate,
          end: endDate,
          calendar: event.calendar,
          name: event.name,
          location: event.location,
          invitedUsers: event.invitedUsers,
          shared: event.shared,
          isRecurring: event.isRecurring
        };
        // else da rivedere boh
      } else {
        newEvent = {
          title: event.title,
          description: event.description,
          color: event.color,
          allDay: event.allDay,
          start: startDate,
          end: endDate,
          name: event.name,
          location: event.location,
          completed: event.completed,
          isTask: event.isTask,
          isRecurring: event.isRecurring,
          timesToRepeat: event.timesToRepeat,
          endRecur: event.endRecur
        };
      }

      recurrencies.push(newEvent);
      counter++; // Increment the repetition counter

      // Increment the date by 1 week
      nextStartDate.setDate(nextStartDate.getDate() + 7);
      if (nextEndDate) {
        nextEndDate.setDate(nextEndDate.getDate() + 7);
      }
    }

    return recurrencies;
  }

  function getFirstUsefulDate(event) {
    const recurrencies = calculateAllRecurrencies(event, getNextYear())
    const currentDate = new Date()
    return recurrencies.filter(event => stringToDate(event.start) > currentDate)
      .sort((a, b) => stringToDate(a.start) - stringToDate(b.start))[0] || null;

  }

  function recurrenceMath(event) {
    const currentDate = new Date()

    if (event.isRecurring) {
      if (event.isTask || event.isStudyEvent) {
        if (event.endRecur && (stringToDate(event.endRecur) < currentDate)) {
          return null
        }
        else {
          return getFirstUsefulDate(event)
        }
      }
      if (event.end && (stringToDate(event.end) < currentDate)) return null
      else {
        return getFirstUsefulDate(event)
      }
    }

  }

  const handleCalendarSettingsClick = (event) => {
    setCalendarSettings(true);
    console.log('calendarSettings', calendarSettings)
    event.stopPropagation()

  }

  const isNotifiable = (event) => {
    const eventEndDate = new Date(event.end);
    const eventStartDate = new Date(event.start);
    const currentDate = new Date();
    return eventStartDate > currentDate || recurrenceMath(event);
  };

  function convertRecurringEventToFirstUsefulDate(event) {
    if (!event.isRecurring) {
      return event
    }
    return recurrenceMath(event);
  }

  const renderEvents = (events, tasks, studyEvents) => {
    // Helper function to render each category of items
    const renderItems = (items, title, noItemsMessage, number) => {

      if (!items || items.length === 0) {
        return <Typography variant="body2" color="#ffffff5f" align="center">{noItemsMessage}</Typography>;
      }
      if (number === 0) {
        return <Typography variant="body2" color="#ffffff5f" align="center">Did you set your settings yet?</Typography>;
      }

      const notifiableItems = items.filter(isNotifiable);
      if (notifiableItems.length === 0) {
        return <Typography variant="body2" color="#ffffff5f" align="center">No current {title.toLowerCase()}.</Typography>;
      }


      return notifiableItems.map(item => {
        return item.isRecurring ? convertRecurringEventToFirstUsefulDate(item) : item;
      }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).slice(0, number).map((item, index) => (
        <Grid container key={index} direction="row" alignItems="center" justifyContent="center">
          <div style={{
            width: '10px',
            height: '10px',
            backgroundColor: item.color,
            marginRight: '10px',
          }} />
          <Typography variant="body2" color="#ffffffbf" align="center">
            {item.title} - {new Date(item.start).toLocaleDateString()}
            {item.end && ` to ${new Date(item.end).toLocaleDateString()}`}
          </Typography>
        </Grid>
      ));
    };


    return (
      <Box sx={{ padding: "5px" }}>
        <Typography variant="body2" color="#53ddf0" align="center">Events: </Typography>
        {renderItems(events, 'Events', 'No events found.', eventsToDisplay)}
        <Typography variant="body2" color="#53ddf0" align="center">Tasks: </Typography>
        {renderItems(tasks, 'Tasks', 'No tasks found.', tasksToDisplay)}
        <Typography variant="body2" color="#53ddf0" align="center">Study Events: </Typography>
        {renderItems(studyEvents, 'Study Events', 'No study events found.', studyEventsToDisplay)}
      </Box>
    );
  };

  const handleChange = (prop) => (event) => {
    if (prop === 'eventsToDisplay') {
      setEventsToDisplay(event.target.value);
    } else if (prop === 'tasksToDisplay') {
      setTasksToDisplay(event.target.value);
    } else if (prop === 'studyEventsToDisplay') {
      setStudyEventsToDisplay(event.target.value);
    }
  }

  const handleCalendarSettingsClose = () => {
    setCalendarSettings(false);
  }

  const handleCalendarSettingsSave = () => {
    setCalendarSettings(false);
    localStorage.setItem('eventsToDisplay', eventsToDisplay);
    localStorage.setItem('tasksToDisplay', tasksToDisplay);
    localStorage.setItem('studyEventsToDisplay', studyEventsToDisplay);
  }


  if (isTokenLoading || loginStatus === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (loginStatus) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 40, 0.5)',
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Dialog open={calendarSettings} onClose={handleCalendarSettingsClose}>
          <DialogTitle>Configure Your Settings</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Number of events to display"
              type="number"
              fullWidth
              variant="outlined"
              value={eventsToDisplay}
              onChange={handleChange('eventsToDisplay')}
            />
            <TextField
              margin="dense"
              label="Number of tasks to display"
              type="number"
              fullWidth
              variant="outlined"
              value={tasksToDisplay}
              onChange={handleChange('tasksToDisplay')}
            />
            <TextField
              margin="dense"
              label="Number of study events to display"
              type="number"
              fullWidth
              variant="outlined"
              value={studyEventsToDisplay}
              onChange={handleChange('studyEventsToDisplay')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCalendarSettingsClose}>Cancel</Button>
            <Button onClick={handleCalendarSettingsSave} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 30, 0.99)',
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
        >
          <img
            src="../../../public/background.jpg"
            alt="background"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <Box display="flex" align="center" justifyContent="center" marginTop="1vh">
          <img src="/selfie.png" alt="Selfie" style={{ width:'60vw', maxWidth: '320px', height: '15vh', minHeight:'10vh', maxHeight: '60vh' }} />
        </Box>
        <Grid container sx={{ display: 'flex', position: 'relative', zIndex: 1, alignItems: 'center', justifyContent: 'center', height: '75vh', gap: "2vh"}}>
          <Grid item xs={10} md={3}>
            <Card variant="outlined" sx={{
              backgroundColor: '#ffffff15',
              minHeight: '20vh',
              maxHeight: '60vh',
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              align: "center",
              borderRadius: "24px",
              backdropFilter: "blur(10px)",
              boxShadow: "0px 0px 10px 0px #00000006"
            }}>
              <CardActionArea onClick={() => navigate('/calendar/')}>
                <CardContent>
                  <Typography variant="h5" component="div" align="center" sx={{
                    fontSize: "45px",
                    background: "-webkit-linear-gradient(45deg, #333b96, #9f4f84 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Work Sans, Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif",
                    fontWeight: "800",
                    filter: "brightness(1.5)"
                  }}>
                    Calendar
                  </Typography>
                  <Typography variant="body2" color="#ffffffdf" align="center">
                    View and manage your calendar events.
                  </Typography>
                  {renderEvents(events, tasks, studyEvents)}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={10} md={3}>
            <Card variant="outlined" sx={{
              backgroundColor: '#ffffff15',
              minHeight: '20vh',
              maxHeight: '60vh',
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              align: "center",
              borderRadius: "24px",
              backdropFilter: "blur(10px)",
              boxShadow: "0px 0px 10px 0px #00000006"
            }}>
              <CardActionArea onClick={() => navigate('/timer/')}>
                <CardContent>
                  <Typography variant="h5" component="div" align="center" sx={{
                    fontSize: "45px",
                    background: "-webkit-linear-gradient(165deg, #eed06a, #9f4f84 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Work Sans, Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif",
                    fontWeight: "800",
                    filter: "brightness(1.5)"
                  }}>
                    Pomodoro
                  </Typography>
                  <Typography variant="body2" color="#ffffffdf" align="center">
                    Manage your time using the Pomodoro technique.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          <Grid item xs={10} md={3}>
            <Card variant="outlined" sx={{
              backgroundColor: '#ffffff15',
              minHeight: '20vh',
              maxHeight: '60vh',
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              align: "center",
              borderRadius: "24px",
              backdropFilter: "blur(10px)",
              boxShadow: "0px 0px 10px 0px #00000006"
            }}>
              <CardActionArea onClick={() => navigate('/notes/')}>
                <CardContent>
                  <Typography variant="h5" component="div" align="center" sx={{
                    fontSize: "45px",
                    background: "-webkit-linear-gradient(45deg, #0b1439, #4a8dda 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Work Sans, Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif",
                    fontWeight: "800",
                    filter: "brightness(1.5)"
                  }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" color="#ffffffdf" align="center">
                    Create and organize your notes.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box >
    );
  }
};

export default HomePage;
