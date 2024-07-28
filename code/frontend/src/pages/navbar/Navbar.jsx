import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotesIcon from '@mui/icons-material/Notes';
import TimerIcon from '@mui/icons-material/Timer';
import { useNavigate } from 'react-router-dom';
import useTokenChecker from '../../utils/useTokenChecker';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState } from 'react';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, FormControlLabel, Checkbox } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import SettingsIcon from '@mui/icons-material/Settings';
import { Grid } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import TimeMachineIcon from '../common/components/TimeMachineIcon';
import { set } from 'date-fns';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';

const Navbar = ({ setSeedTwo, showTimeMachine, setShowTimeMachine }) => {
  const navigate = useNavigate();
  const { loginStatus, isTokenLoading, username } = useTokenChecker();
  const [anchorEl, setAnchorEl] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const token = Cookies.get('token');
  const [shownNotifications, setShownNotifications] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState("");
  const [tasks, setTasks] = useState([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [shownEventNotifications, setShownEventNotifications] = useState(0);
  const [shownTaskNotifications, setShownTaskNotifications] = useState(0);
  const [studyEvents, setStudyEvents] = useState([]);

  const notificationOptions = [
    '30 min', '1 hour', '6 hours', '12 hours', '1 day', '3 days',
    '1 week', '2 weeks', '1 month', '3 months', '6 months', '1 year'
  ];


  const handleLogout = () => {
    Cookies.remove('token');
    navigate('/');
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/getEventsGeneric?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (JSON.stringify(data) !== JSON.stringify(events)) {
          setEvents(data);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Error fetching events');
        setEvents([]);
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/getTasksGeneric?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (JSON.stringify(data) !== JSON.stringify(tasks)) {
          setTasks(data);
        }
        setError(null);
      }
      catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Error fetching tasks');
        setTasks([]);
      }
    };

    const fetchStudyEvents = async () => {
      try {
        const response = await fetch(`/api/getStudyEventsGeneric?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (JSON.stringify(data) !== JSON.stringify(studyEvents)) {
          setStudyEvents(data);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching study events:', error);
        setError('Error fetching study events');
        setStudyEvents([]);
      }
    };


    const combinedItems = [...events, ...tasks, ...studyEvents];

    setTotalNotifications(combinedItems
      .filter(isNotifiable)
      .map(item => item.isRecurring ? convertRecurringEventToFirstUsefulDate(item) : item)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).length);

    fetchTasks();
    fetchEvents();
    fetchStudyEvents();
  }, [token, username, selectedNotification, events, shownNotifications, tasks]);

  useEffect(() => {
    if (totalNotifications > 0) {
      playNotificationSound();

    }
  }, [totalNotifications]);

  // carica tempo di preavviso per le notifiche degli eventi selezionato
  useEffect(() => {
    const savedSelectedNotification = localStorage.getItem('notificationCount');
    if (savedSelectedNotification) {
      setSelectedNotification(savedSelectedNotification);
    }
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio('../../notification-sound.mp3');
    audio.volume = 0.5;
    audio.play();
  };

  const showBrowserNotification = (event, count) => {
    console.log('showBrowserNotification');
    if (Notification.permission === "granted") {
      console.log('Showing notification');
      new Notification(event.title, {
        body: `${event.start ? new Date(event.start).toLocaleString() : ''} to ${event.end ? new Date(event.end).toLocaleString() : ''}`,
        badge: '../../public/icon-browser.png',
      });

      // Update badge count if there are multiple notifications
      if (count > 0) {
        //navigator.setAppBadge(count).catch(error => console.error("Failed to set app badge: ", error));
      }
    }
  };


  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    if (!isTokenLoading) {
      if (!loginStatus) {
        navigate("/login");
      }
    }
  }, [loginStatus, isTokenLoading]);

  if (isTokenLoading || loginStatus === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }


  const handleNotificationChange = (event) => {
    setSeedTwo((prev) => prev + 1);
    const value = event.target.value;
    localStorage.setItem('notificationCount', value);
    setSelectedNotification(value);
  };


  function convertRecurringEventToFirstUsefulDate(event) {
    if (!event.isRecurring) {
      return event
    }
    return recurrenceMath(event);
  }

  const renderNotifications = () => {
    // Merge tasks and events into one array
    const combinedItems = [...events, ...tasks, ...studyEvents];

    if (error) {
      return <Typography variant="body2" color="error" align="center">{error}</Typography>;
    }
    if (combinedItems.length === 0) {
      return <Typography variant="body2" color="text.secondary" align="center">No tasks or events found.</Typography>;
    }

    return combinedItems
      .filter(isNotifiable)
      .map(item => {
        return item.isRecurring ? convertRecurringEventToFirstUsefulDate(item) : item;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))  // Assuming startDate is a date string
      .map((item, index) => (
        <MenuItem key={index}>
          <Grid container alignItems="center" justifyContent="center">
            <Box width="10px" height="10px" bgcolor={item.color} marginRight="4px" />
            <Grid item xs>
              <Typography variant="body2" color="text.secondary" align="center" style={{ marginLeft: "5px", marginRight: "5px", borderRadius: "10px" }}>
                {selectedNotification === "30 min" || selectedNotification === "1 hour" && <WarningIcon />}
                {selectedNotification === "12 hours" || selectedNotification === "6 hours" && <NotificationImportantIcon /> }
                {item.title}
              </Typography>
              <Typography align="center" sx={{ marginBottom: '5px' }}>
                {item.start && new Date(item.start).toLocaleDateString()}
                {(!item.isTask && !item.isStudyEvent) ? (item.end && ` to ${new Date(item.end).toLocaleDateString()}`) : null}
              </Typography>
            </Grid>
          </Grid>
        </MenuItem>

      ));
  };

  const NotificationSettingsDialog = () => {
    return (
      <Dialog open={settingsOpen} onClose={handleCloseSettings}>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <RadioGroup value={selectedNotification} onChange={handleNotificationChange}>
            {notificationOptions.map(option => (
              <ListItem key={option}>
                <FormControlLabel
                  control={<Radio />}
                  label={option}
                  value={option}
                />
              </ListItem>
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Close</Button>
        </DialogActions>
      </Dialog>
    );
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

  function formatDate(date) {
    // Helper function to format the date as required
    return date.toISOString().split('T')[0];
  }


  function getFirstUsefulDate(event) {
    const recurrencies = calculateAllRecurrencies(event, getNextYear());
    const currentDate = new Date();

    // Calculate the upper boundary for event dates using the notice period
    const maxNoticeDate = new Date(currentDate.getTime() + noticeTimeToMilliseconds());

    // Filter events that are between the current date and the max notice date
    const validEvents = recurrencies.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate > currentDate && eventDate <= maxNoticeDate;
    });

    // Sort events by date and return the first one, or null if none are suitable
    validEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    return validEvents[0] || false;
  }


  function getNextYear() {
    const currentDate = new Date();
    const nextYear = currentDate.getFullYear() + 1;
    return nextYear;
  };

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

      if (event.end && (stringToDate(event.end) < currentDate)) {
        return null
      }
      else {
        return getFirstUsefulDate(event)
      }
    }

  }

  function isNotifiable(event) {
    const eventStartDate = new Date(event.start);

    const noticeDate = new Date(eventStartDate.getTime() - noticeTimeToMilliseconds());

    const currentDate = new Date();


    return (currentDate > noticeDate && eventStartDate > currentDate) || recurrenceMath(event);
  };

  function noticeTimeToMilliseconds() {
    const timeUnits = {
      'min': 60000,
      'hour': 60000 * 60,
      'hours': 60000 * 60,
      'day': 60000 * 60 * 24,
      'days': 60000 * 60 * 24,
      'week': 60000 * 60 * 24 * 7,
      'weeks': 60000 * 60 * 24 * 7,
      'month': 60000 * 60 * 24 * 7 * 30,
      'months': 60000 * 60 * 24 * 7 * 30,
      'year': 60000 * 60 * 24 * 7 * 30 * 365,
      'years': 60000 * 60 * 24 * 7 * 30 * 365
    };

    const [number, unit] = selectedNotification?.split(' ') ?? [30, 'min'];

    const milliseconds = parseInt(number) * timeUnits[unit];

    return milliseconds;
  }

  if (loginStatus) {
    return (
      <AppBar position="static" sx={{ height: '7vh', color: "#ffffff", backgroundColor: '#7d5ffc' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="home"
            onClick={() => navigate('/home/')}
          >
            <img
              src="../../selfie.png"
              alt="Home"
              style={{ width: 100, height: 48, marginRight: 15 }}
            />

          </IconButton>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="calendar"
            onClick={() => navigate('/calendar/')}
          >
            <CalendarTodayIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="timer"
            onClick={() => navigate('/timer/')}
          >
            <TimerIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="notes"
            onClick={() => navigate('/notes/')}
          >
            <NotesIcon />
          </IconButton>
          {!showTimeMachine && <TimeMachineIcon setShowTimeMachine={setShowTimeMachine} />}
          <IconButton
            color="inherit"
            aria-label="notifications"
            aria-controls="notification-menu"
            aria-haspopup="true"
            onClick={handleNotificationClick}
            sx={{ marginLeft: 'auto' }}
          >
            <Badge badgeContent={totalNotifications} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="logout"
            onClick={handleLogout}
          >
            <ExitToAppIcon />
          </IconButton>
          <Menu
            id="notification-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <NotificationSettingsDialog />
            <MenuItem onClick={handleSettingsClick} sx={{ margin: '0' }}>
              <Grid container direction="row" alignItems="center" justifyContent="center">
                <SettingsIcon />
                <Typography fontSize={14}>Settings</Typography>
              </Grid>
            </MenuItem>
            {renderNotifications()}
          </Menu>

        </Toolbar>
      </AppBar>
    );
  } else {
    <></>;
  }
};

export default Navbar;
