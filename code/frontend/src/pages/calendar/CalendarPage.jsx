import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Navbar from '../navbar/Navbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import useTokenChecker from '../../utils/useTokenChecker';
import Cookies from 'js-cookie';

const CalendarPage = () => {
  const [create, setCreate] = useState(false);
  const [openCalendars, setOpenCalendars] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [chosenCalendars, setChosenCalendars] = useState([]);
  const [createCalendarButton, setCreateCalendarButton] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const token = Cookies.get('token');
  const { loginStatus, isTokenLoading, username } = useTokenChecker();

  useEffect(() => {
    const fetchCalendars = () => {
      fetch(`/api/getCalendars?userId=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => setCalendars(data))
        .catch(error => console.error('Error fetching calendars:', error));
    };

    // Start polling on component mount
    const intervalId = setInterval(fetchCalendars, 1000); // 10 seconds
    fetchCalendars();
    // Cleanup: stop polling on component unmount
    return () => clearInterval(intervalId);
  }, [token, username]);

  const toggleCalendars = () => {
    setOpenCalendars(!openCalendars);
  };

  const createCalendar = () => {
    if (!username) {
      console.error('User ID not found');
      return;
    }

    fetch('/api/createCalendars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newCalendarName, user: username }),
    })
      .then(response => response.json())
      .then(data => {
        setCalendars([...calendars, { _id: data.id, name: newCalendarName }]);
        setNewCalendarName('');
        setCreateCalendarButton(false);
      })
      .catch(error => console.error('Error creating calendar:', error));
  };

  const deleteCalendar = (id) => {
    fetch('/api/deleteCalendar', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setCalendars(calendars.filter(calendar => calendar._id !== id));
        } else {
          console.error('Failed to delete calendar:', data.message);
        }
      })
      .catch(error => console.error('Error deleting calendar:', error));
  };

  const handleCheckboxChange = (calendarName) => {
    setChosenCalendars(prevChosenCalendars => {
      if (prevChosenCalendars.includes(calendarName)) {
        // If the calendar is already chosen, remove it
        return prevChosenCalendars.filter(name => name !== calendarName);
      } else {
        // If the calendar is not chosen, add it
        return [...prevChosenCalendars, calendarName];
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <Navbar />
      <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
        <Box sx={{ width: '15vw', height: '100%' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onMouseDown={() => setCreate(true)} onMouseUp={() => setCreate(false)} onMouseLeave={() => setCreate(false)}>
                <ListItemText primary="Create Event" />
              </ListItemButton>
              <ListItemButton onMouseDown={() => setCreateCalendarButton(true)} onMouseUp={() => setCreate(false)} onMouseLeave={() => setCreate(false)}>
                <ListItemText primary="Create Calendar" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={toggleCalendars}>
                <ListItemText primary="My Calendars" />
              </ListItemButton>
            </ListItem>
            <Collapse in={openCalendars} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {calendars.map((calendar) => (
                  <ListItem key={calendar._id} sx={{ pl: 4 }}>
                    <FormControlLabel
                      control={<Checkbox defaultChecked={false} onChange={() => handleCheckboxChange(calendar.name)} />}
                      label={calendar.name}
                    />
                    <Button onClick={() => deleteCalendar(calendar._id)} endIcon={<DeleteIcon />}>
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
        </Box>
        <Box sx={{ width: '100%' }}>
          <Calendar createButton={create} chosenCalendars={chosenCalendars} calendars={calendars} />
        </Box>
      </Box>

      <Dialog open={createCalendarButton} onClose={() => setCreateCalendarButton(false)}>
        <DialogTitle>Create Calendar</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Calendar Name"
            type="text"
            fullWidth
            value={newCalendarName}
            onChange={(e) => setNewCalendarName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateCalendarButton(false)}>Cancel</Button>
          <Button onClick={createCalendar}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;