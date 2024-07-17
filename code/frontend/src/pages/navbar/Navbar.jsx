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
        setEvents(data);
        setError(null);  // Reset error state if data fetch is successful
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Error fetching events');
        setEvents([]);  // Reset events if there's an error
      }
    };

    fetchEvents();
  }, [token, username]);

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

  const renderSettingsMenu = () => (
    <Menu
      id="settings-menu"
      anchorEl={settingsAnchorEl}
      open={Boolean(settingsAnchorEl)}
      onClose={handleClose}
      MenuListProps={{ 'aria-labelledby': 'settings-button' }}
    >
      {notificationTimes.map((time, index) => (
        <MenuItem key={index} onClick={() => console.log(`Notification set for ${time}`)}>
          {time}
        </MenuItem>
      ))}
    </Menu>
  );

  const renderNotifications = () => {
    if (error) {
      return <Typography variant="body2" color="error" align="center">{error}</Typography>;
    }
    if (events.length === 0) {
      return <Typography variant="body2" color="text.secondary" align="center">No events found.</Typography>;
    }
    return events.filter(isNotifiable).slice(0, 3).map((event, index) => (
      <MenuItem key={index}>
        <Box bgcolor={event.color}>
          <Typography key={index} variant="body2" color="text.secondary" align="center" style={{ marginLeft: "5px", marginRight: "5px", borderRadius: "10px" }}>
            {event.title}
          </Typography>
          <Typography align="center" sx={{ marginBottom: '5px' }}>
            {event.start && new Date(event.start).toLocaleDateString()}
            {event.end && ` to ${new Date(event.end).toLocaleDateString()}`}
          </Typography>
        </Box>
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

  const isNotifiable = (event) => {
    const eventEndDate = new Date(event.end);

    const noticeDate = new Date(eventEndDate.getTime() - noticeTimeToMilliseconds());

    const currentDate = new Date();

    console.log("isNotifiable returns: ", noticeDate)

    return currentDate > noticeDate && eventEndDate > currentDate;
  };

  const noticeTimeToMilliseconds = () => {
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

    console.log("selectedNotificatoin: ", selectedNotification)

    const [number, unit] = selectedNotification?.split(' ') ?? [30, 'min'];

    const milliseconds = parseInt(number) * timeUnits[unit];

    return milliseconds;
  }

  if (loginStatus) {
    return (
      <AppBar position="static" sx={{ height: '8vh' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="home"
            onClick={() => navigate('/home/')}
          >
            <img
              src="../../public/image-logo2.png"
              alt="Home"
              style={{ width: 48, height: 48 }}
            />
            <Typography sx={{ marginRight: '1rem' }}>Selfie</Typography>
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
            aria-label="notes"
            onClick={() => navigate('/notes/')}
          >
            <NotesIcon />
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
