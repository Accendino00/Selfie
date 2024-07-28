import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardActionArea, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu } from '@mui/material';
import useTokenChecker from '../../utils/useTokenChecker.jsx';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsIcon from '@mui/icons-material/Settings';
import { set } from 'date-fns';
import { Select, MenuItem } from '@mui/material';
import MessagingComponent from './components/MessagingComponent.jsx';
import IconButton from '@mui/material/IconButton';



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
  const [userId, setUserId] = useState('');
  const [lastCreatedNote, setLastCreatedNote] = useState('');
  const [firstCreatedNote, setFirstCreatedNote] = useState('');
  const [lastPomodoro, setLastPomodoro] = useState('');
  const [firstPomodoro, setFirstPomodoro] = useState('');
  const [lastModifiedNote, setLastModifiedNote] = useState('');
  const [firstModifiedNote, setFirstModifiedNote] = useState('');
  const [pomodoroSettings, setPomodoroSettings] = useState(false);
  const [noteSettings, setNoteSettings] = useState(false);
  const [pomodoroToShow, setPomodoroToShow] = useState('creationDate-last');
  const [noteToShow, setNoteToShow] = useState('creationDate-last');
  const [noPomodoro, setNoPomodoro] = useState(false);
  const [noNotes, setNoNotes] = useState(false);

  useEffect(() => {
    if (!isTokenLoading) {
      if (!loginStatus) {
        navigate("/login");
      }
    }
  }, [loginStatus, isTokenLoading]);

  useEffect(() => {
    if (loginStatus) {
      const fetchUserId = async () => {
        try {
          const response = await fetch(`/api/getUserId?username=${username}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const fetchedUserId = await response.json();
            setUserId(fetchedUserId);
          } else {
            console.error('Failed to fetch user id');
          }
        }
        catch (error) {
          console.error('Failed to fetch user id', error);
        }
      }
      fetchUserId();
    }
  }, [loginStatus, username, token]);

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


  const fetchLastCreatedNote = async () => {
    try {
      const response = await fetch(`/api/getLastCreatedNote?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Handle 404 or other errors
        if (response.status === 404) {
          setNoNotes(true);
        } else {
          console.error(`Error fetching last created note: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      setLastCreatedNote(data);
      setLastModifiedNote('');
      setFirstModifiedNote('');
      setFirstCreatedNote('');
      setNoNotes(false);

    } catch (error) {
      console.error('Error fetching last created note:', error);
      setNoNotes(true);
    }
  };

  const fetchLastPomodoro = async () => {
    try {
      const response = await fetch(`/api/getLastPomodoro?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Handle 404 or other errors
        if (response.status === 404) {
          setNoPomodoro(true);
        } else {
          console.error(`Error fetching last pomodoro: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      setLastPomodoro(data);
      setFirstPomodoro('');
      setNoPomodoro(false);

    } catch (error) {
      console.error('Error fetching last pomodoro:', error);
      setNoPomodoro(true);
    }
  };

  useEffect(() => {
    if (loginStatus) {
      fetchLastCreatedNote();
      fetchLastPomodoro();
    }
  }, [loginStatus, userId]);


  const fetchFirstCreatedNote = async () => {
    try {
      const response = await fetch(`/api/getFirstCreatedNote?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFirstCreatedNote(data);
      setLastModifiedNote('');
      setFirstModifiedNote('');
      setLastCreatedNote('');

    } catch (error) {
      console.error('Error fetching first created note:', error);
    }
  };

  const fetchFirstPomodoro = async () => {
    try {
      const response = await fetch(`/api/getFirstPomodoro?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFirstPomodoro(data);
      setLastPomodoro('');

    } catch (error) {
      console.error('Error fetching first pomodoro:', error);
    }
  };

  const fetchLastModifiedNote = async () => {
    try {
      const response = await fetch(`/api/getLastModifiedNote?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLastModifiedNote(data);
      setFirstModifiedNote('');
      setLastCreatedNote('');
      setFirstCreatedNote('');

    } catch (error) {
      console.error('Error fetching last modified note:', error);
    }
  };

  const fetchFirstModifiedNote = async () => {
    try {
      const response = await fetch(`/api/getFirstModifiedNote?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFirstModifiedNote(data);
      setLastModifiedNote('');
      setLastCreatedNote('');
      setFirstCreatedNote('');

    } catch (error) {
      console.error('Error fetching first modified note:', error);
    }
  };

  const handlePomodoroSettingsClick = () => {
    setPomodoroSettings(true);
  }

  const handlePomodoroSettingsClose = () => {
    setPomodoroSettings(false);
  }

  const handlePomodoroToShowChange = (event) => {
    setPomodoroToShow(event.target.value);
  }

  const handleNoteSettingsClick = () => {
    setNoteSettings(true);
  }

  const handleNoteSettingsClose = () => {
    setNoteSettings(false);
  }

  const handleNoteToShowChange = (event) => {
    setNoteToShow(event.target.value);
  }

  const handlePomodoroSettingsSave = async () => {
    setPomodoroSettings(false);
    localStorage.setItem('pomodoroToShow', pomodoroToShow);

    try {
      if (pomodoroToShow === 'creationDate-first') {
        await fetchFirstPomodoro();
      } else if (pomodoroToShow === 'creationDate-last') {
        await fetchLastPomodoro();
      }
    } catch (error) {
      console.error('Error fetching pomodoro:', error);
    }
  };

  const handleNoteSettingsSave = async () => {
    setNoteSettings(false);
    localStorage.setItem('noteToShow', noteToShow);

    try {
      if (noteToShow === 'creationDate-first') {
        await fetchFirstCreatedNote();
      } else if (noteToShow === 'creationDate-last') {
        await fetchLastCreatedNote();
      } else if (noteToShow === 'modifiedDate-first') {
        await fetchFirstModifiedNote();
      } else if (noteToShow === 'modifiedDate-last') {
        await fetchLastModifiedNote();
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    }
  };


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
    } else if (event.endRecur && (event.isTask || event.isStudyEvent)) {
      nextEndDate = new Date(event.endRecur);
    }

    let counter = 0; // Counter to track the number of repetitions

    // Determine the maximum number of recurrences, if specified
    const maxRecurrences = event.timesToRepeat ? Math.min(event.timesToRepeat, 52) : 52; // Assuming a limit of 52 repetitions or one year
    // Loop until the maximum repetitions are met or the date exceeds the finalDate
    while ((event.timesToRepeat ? counter < maxRecurrences : true) && nextStartDate.getFullYear() <= finalDate) {
      // Loop through each day of the week
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        let currentDay = (nextStartDate.getDay() + dayOffset) % 7;

        if (event.daysOfWeek && event.daysOfWeek.includes(currentDay)) {
          let eventDate = new Date(nextStartDate);
          eventDate.setDate(nextStartDate.getDate() + dayOffset);

          if (eventDate.getFullYear() > finalDate) {
            //console.log(event)
            break;
          }

          let startDate = formatDate(eventDate);
          let endDate = nextEndDate ? formatDate(new Date(eventDate.getTime() + (nextEndDate.getTime() - nextStartDate.getTime()))) : null;

          let newEvent = {};

          if (!event.isTask || !event.isStudyEvent) {
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
          } else {
            newEvent = {
              title: event.title,
              description: event.description,
              color: event.color,
              allDay: event.allDay,
              start: startDate,
              end: endDate,
              name: event.name,
              completed: event.completed,
              isTask: event.isTask,
              isRecurring: event.isRecurring,
              timesToRepeat: event.timesToRepeat,
              endRecur: event.endRecur
            };
          }

          recurrencies.push(newEvent);
          counter++; // Increment the repetition counter

          if (event.timesToRepeat && counter >= maxRecurrences) {
            break;
          }
        }
      }
      //console.log('newevent', recurrencies);
      // Move to the next week
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
    //console.log('recurrencies', recurrencies)
    return recurrencies.filter(event => stringToDate(event.start) > currentDate)
      .sort((a, b) => stringToDate(a.start) - stringToDate(b.start))[0] || false;

  }

  function recurrenceMath(event) {
    const currentDate = new Date()

    if (event.isRecurring) {
      if (event.isTask || event.isStudyEvent) {
        if (event.endRecur && (stringToDate(event.endRecur) < currentDate)) {
          return false
        }
        else {
          return getFirstUsefulDate(event)
        }
      }
      if (event.end && (stringToDate(event.end) < currentDate)) return false
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
    const eventStartDate = new Date(event.start);
    const currentDate = new Date();
    return eventStartDate >= currentDate || recurrenceMath(event);
  };

  function convertRecurringEventToFirstUsefulDate(event) {
    if (!event.isRecurring) {
      return event
    }
    return recurrenceMath(event);
  }

  const renderEvents = (events, tasks, studyEvents) => {
    //console.log('studyEvents', studyEvents)
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
            {(!item.isTask && !item.isStudyEvent) ? item.end && ` to ${new Date(item.end).toLocaleDateString()}` : null}
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
        <IconButton
          sx={{
            position: 'absolute',
            top: '1vh',
            right: '1vh',
            color: '#ffffffdf',
            zIndex: 1000
          }}
        >
          <MessagingComponent />
        </IconButton>
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
              inputProps={{
                min: 0
              }}
            />
            <TextField
              margin="dense"
              label="Number of tasks to display"
              type="number"
              fullWidth
              variant="outlined"
              value={tasksToDisplay}
              onChange={handleChange('tasksToDisplay')}
              inputProps={{
                min: 0
              }}
            />
            <TextField
              margin="dense"
              label="Number of study events to display"
              type="number"
              fullWidth
              variant="outlined"
              value={studyEventsToDisplay}
              onChange={handleChange('studyEventsToDisplay')}
              inputProps={{
                min: 0
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCalendarSettingsClose}>Cancel</Button>
            <Button onClick={handleCalendarSettingsSave} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={pomodoroSettings} onClose={handlePomodoroSettingsClose}>
          <DialogTitle>Configure Your Settings</DialogTitle>
          <DialogContent>
            <Select
              value={pomodoroToShow}
              onChange={handlePomodoroToShowChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}

              MenuProps={{
                PaperProps: {
                  style: {
                    color: '#53ddf0',
                    backgroundColor: '#111119',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    backgroundColor: '#111119',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }
                }
              }}
              sx={{
                '& .MuiSelect-select': {
                  color: '#7d5ffc',

                }
              }}
            >
              <MenuItem value="creationDate-first">Creation Date (First)</MenuItem>
              <MenuItem value="creationDate-last">Creation Date (Last)</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePomodoroSettingsClose}>Cancel</Button>
            <Button onClick={handlePomodoroSettingsSave} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={noteSettings} onClose={handleNoteSettingsClose}>
          <DialogTitle>Configure Your Settings</DialogTitle>
          <DialogContent>
            <Select
              value={noteToShow}
              onChange={handleNoteToShowChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}

              MenuProps={{
                PaperProps: {
                  style: {
                    color: '#53ddf0',
                    backgroundColor: '#111119',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    backgroundColor: '#111119',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }
                }
              }}
              sx={{
                '& .MuiSelect-select': {
                  color: '#7d5ffc',

                }
              }}
            >
              <MenuItem value="creationDate-first">Creation Date (First)</MenuItem>
              <MenuItem value="creationDate-last">Creation Date (Last)</MenuItem>
              <MenuItem value="modifiedDate-first">Modified Date (First)</MenuItem>
              <MenuItem value="modifiedDate-last">Modified Date (Last)</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleNoteSettingsClose}>Cancel</Button>
            <Button onClick={handleNoteSettingsSave} color="primary">Save</Button>
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
            src="../../../background.jpg"
            alt="background"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <Box display="flex" align="center" justifyContent="center" marginTop="1vh">
          <img src="/selfie.png" alt="Selfie" style={{ width: '60vw', maxWidth: '320px', height: '15vh', minHeight: '10vh', maxHeight: '60vh' }} />
        </Box>
        <Grid container sx={{ display: 'flex', position: 'relative', zIndex: 1, alignItems: 'center', justifyContent: 'center', height: '75vh', gap: "2vh" }}>
          <Grid item xs={10} md={3}>
            <Button onClick={handleCalendarSettingsClick} sx={{ position: 'absolute', padding: 0, marginTop: '1vh', zIndex: '1000' }}>
              <SettingsIcon sx={{ color: "white" }} />
            </Button>
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
            <Button onClick={handlePomodoroSettingsClick} sx={{ position: 'absolute', padding: 0, marginTop: '1vh', zIndex: '1000' }}>
              <SettingsIcon sx={{ color: "white" }} />
            </Button>
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
                  {lastPomodoro && (
                    <Box>
                      <Typography variant="body2" color="#53ddf0" align="center">Study Time: <span style={{ color: "#ffffffdf" }}>{lastPomodoro.studyTime}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Break Time: <span style={{ color: "#ffffffdf" }}>{lastPomodoro.breakTime}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Total Minutes: <span style={{ color: "#ffffffdf" }}>{lastPomodoro.totalMinutes}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Cycles: <span style={{ color: "#ffffffdf" }}>{lastPomodoro.cycles}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Remaining Cycles: <span style={{ color: "#ffffffdf" }}>{lastPomodoro.remainingCycles}</span></Typography>
                    </Box>
                  )}
                  {firstPomodoro && (
                    <Box>
                      <Typography variant="body2" color="#53ddf0" align="center">Study Time: <span style={{ color: "#ffffffdf" }}>{firstPomodoro.studyTime}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Break Time: <span style={{ color: "#ffffffdf" }}>{firstPomodoro.breakTime}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Total Minutes: <span style={{ color: "#ffffffdf" }}>{firstPomodoro.totalMinutes}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Cycles: <span style={{ color: "#ffffffdf" }}>{firstPomodoro.cycles}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Remaining Cycles: <span style={{ color: "#ffffffdf" }}>{firstPomodoro.remainingCycles}</span></Typography>
                    </Box>
                  )}
                  {noPomodoro && (
                    <Typography variant="body2" color="#53ddf0" align="center">No pomodoro found.</Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          <Grid item xs={10} md={3}>
            <Button onClick={handleNoteSettingsClick} sx={{ position: 'absolute', padding: 0, marginTop: '1vh', zIndex: '1000' }}>
              <SettingsIcon sx={{ color: "white" }} />
            </Button>
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
                  {lastCreatedNote && (
                    <Box>
                      <Typography variant="body2" color="#53ddf0" align="center">Title: <span style={{ color: "#ffffffdf" }}>{lastCreatedNote.title}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Category: <span style={{ color: "#ffffffdf" }}>{lastCreatedNote.category}</span></Typography>
                    </Box>
                  )}
                  {firstCreatedNote && (
                    <Box>
                      <Typography variant="body2" color="#53ddf0" align="center">Title: <span style={{ color: "#ffffffdf" }}>{firstCreatedNote.title}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Category: <span style={{ color: "#ffffffdf" }}>{firstCreatedNote.category}</span></Typography>
                    </Box>
                  )}
                  {lastModifiedNote && (
                    <Box>
                      <Typography variant="body2" color="#53ddf0" align="center">Title: <span style={{ color: "#ffffffdf" }}>{lastModifiedNote.title}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Category: <span style={{ color: "#ffffffdf" }}>{lastModifiedNote.category}</span></Typography>
                    </Box>
                  )}
                  {firstModifiedNote && (
                    <Box>
                      <Typography variant="body2" color="#53ddf0" align="center">Title: <span style={{ color: "#ffffffdf" }}>{firstModifiedNote.title}</span></Typography>
                      <Typography variant="body2" color="#53ddf0" align="center">Category: <span style={{ color: "#ffffffdf" }}>{firstModifiedNote.category}</span></Typography>
                    </Box>
                  )}
                  {noNotes && (
                    <Typography variant="body2" color="#53ddf0" align="center">No notes found.</Typography>
                  )}
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
