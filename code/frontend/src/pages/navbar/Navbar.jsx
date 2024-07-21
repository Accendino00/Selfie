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

const Navbar = () => {
  const navigate = useNavigate();
  const { loginStatus, isTokenLoading, username } = useTokenChecker();
  const [anchorEl, setAnchorEl] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const token = Cookies.get('token');
  const [shownNotifications, setShownNotifications] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState("");

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
        // Adjust the URL with any needed parameters for fetching next day's events
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
        if (JSON.stringify(data) !== JSON.stringify(events)) {  // Simple deep equality check
          setEvents(data);
          setShownNotifications(data.filter(isNotifiable).length);
        }
        setError(null);  // Reset error state if data fetch is successful
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Error fetching events');
        setEvents([]);  // Reset events if there's an error
      }
    };

    fetchEvents();
  }, [token, username, selectedNotification, events]);


  // carica tempo di preavviso per le notifiche degli eventi selezionato
  useEffect(() => {
    const savedSelectedNotification = localStorage.getItem('notificationCount');
    if (savedSelectedNotification) {
      setSelectedNotification(savedSelectedNotification);
    }
  }, []);

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
    if (error) {
      return <Typography variant="body2" color="error" align="center">{error}</Typography>;
    }
    if (events.length === 0) {
      return <Typography variant="body2" color="text.secondary" align="center">No events found.</Typography>;
    }
    return events.filter(isNotifiable).map(event => convertRecurringEventToFirstUsefulDate(event)).sort((a, b) => a.startDate - b.startDate).map((event, index) => (
      <MenuItem key={index}>
        <Grid container direction="column" bgcolor={event.color} alignItems="center" justifyContent="center">
          <Typography key={index} variant="body2" color="text.secondary" align="center" style={{ marginLeft: "5px", marginRight: "5px", borderRadius: "10px" }}>
            {event.title}
          </Typography>
          <Typography align="center" sx={{ marginBottom: '5px' }}>
            {event.start && new Date(event.start).toLocaleDateString()}
            {event.end && ` to ${new Date(event.end).toLocaleDateString()}`}
          </Typography>
        </Grid>
      </MenuItem>
    )

    );
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
    if (event.end) {
      nextEndDate = new Date(event.end);
    }
    // We'll use this to control the recurrence loop


    while (nextStartDate.getFullYear() <= finalDate) {
      let startDate = formatDate(nextStartDate)
      let endDate = nextEndDate ? formatDate(nextEndDate) : null



      const newEvent = {
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

      recurrencies.push(newEvent);

      // Increment the date by 1 week
      nextStartDate.setDate(nextStartDate.getDate() + 7);
      if (nextEndDate) {
        nextEndDate.setDate(nextEndDate.getDate() + 7);
      }
    }

    return recurrencies
  }

  function getFirstUsefulDate(event) {
    const recurrencies = calculateAllRecurrencies(event, getNextYear())
    const currentDate = new Date()
    return recurrencies.filter(event => stringToDate(event.start) > currentDate)
      .sort((a, b) => stringToDate(a.start) - stringToDate(b.start))[0] || null;

  }

  function getNextYear() {
    const currentDate = new Date();
    const nextYear = currentDate.getFullYear() + 1;
    return nextYear;
  };

  function recurrenceMath(event) {
    const currentDate = new Date()

    if (event.isRecurring) {
      if (event.end && (stringToDate(event.end) < currentDate)) return null
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
      <AppBar position="static" sx={{ height: '8vh', color: '#000000', backgroundColor:'#7d5ffc'}}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="home"
            onClick={() => navigate('/home/')}
          >
            <img
              src="../../public/selfie.png"
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
          <IconButton
            color="inherit"
            aria-label="notifications"
            aria-controls="notification-menu"
            aria-haspopup="true"
            onClick={handleNotificationClick}
            sx={{ marginLeft: 'auto' }}
          >
            <Badge badgeContent={shownNotifications} color="secondary">
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
