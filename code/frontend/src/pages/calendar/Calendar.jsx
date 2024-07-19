import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel, Box, FormControlLabel, Checkbox, ListItemText } from '@mui/material';
import commonColors from './CalendarStyles';
import Cookies from 'js-cookie';
import useTokenChecker from '../../utils/useTokenChecker';
import { Typography } from '@mui/material';
import './calendarCSS.css';
import Tasks from './Tasks';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Drawer from '@mui/material/Drawer';

export default function Calendar({ createButton, chosenCalendars, calendars }) {
  const { loginStatus, isTokenLoading, username } = useTokenChecker();
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventColor, setEventColor] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState([]);
  const [modifying, setModifying] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [inviteUser, setInviteUser] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [shared, setShared] = useState([]);
  const [timesToRepeat, setTimesToRepeat] = useState(0);
  const [location, setLocation] = useState('');
  const [draggedOpen, setDraggedOpen] = useState(false);
  const [dragVariable, setDragVariable] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const token = Cookies.get('token');



  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/getEvents?calendars=${chosenCalendars}&username=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          setEvents(data);
        })
        .catch(error => console.error("Error fetching events:", error));
    }, 500);

    // Pulizia: interrompe il polling quando il componente viene smontato
    return () => clearInterval(interval);
  }, [chosenCalendars, draggedOpen, dragVariable, modifying, token, username]);


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (createButton) {
      addEvent(null);
    }
  }, [createButton])


  const addEvent = (info) => {
    resetForm();
    if (info) {
      setStartDate(info.startStr);
      setEndDate(info.endStr);
    }
    handleOpen();
  };

  const deleteEvent = () => {
    fetch(`/api/deleteEvents/${currentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        {
          setEvents(data);
          resetForm();
          handleClose();
        }
      })
      .catch(error => console.error('Error deleting event:', error));
  };




  const saveEvent = () => {

    let eventData = {
      title: eventTitle,
      description: description,
      color: eventColor,
      allDay: allDay,
      start: combineDateAndTime(startDate, startTime),
      end: combineDateAndTime(endDate, endTime),
      timesToRepeat: timesToRepeat,
      calendar: selectedCalendars,
      name: username,
      location: location,
      invitedUsers: invitedUsers,
      shared: shared,
      isRecurring: isRecurring

    };

    if (isRecurring) {
      if (recurringDays.length !== 0) {
        eventData.daysOfWeek = convertDaysToIntegers(recurringDays);
      } else {
        eventData.daysOfWeek = null;
      }
      eventData.startRecur = startDate;
      eventData.start = startDate;
      if (endDate !== '' || endDate !== null) {
        eventData.endRecur = endDate;
        eventData.end = endDate;
      }
      if (startTime !== '') {
        eventData.startTime = startTime;
      } else {
        eventData.startTime = null;
      }
      if (endTime !== '') {
        eventData.endTime = endTime;
      } else {
        eventData.endTime = null;
      }
      if (timesToRepeat !== 0) {
        eventData.endRecur = calculateRepeatEndDate(startDate, timesToRepeat);
        eventData.timesToRepeat = timesToRepeat;
      }
    } else {
      eventData.daysOfWeek = null;
      eventData.startTime = null;
      eventData.endTime = null;
      eventData.startRecur = null;
    }

    if (modifying) {

      fetch(`/api/modifyEvents/${currentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      })
        .then(response => response.json())
        .then(data => {

          setEvents(data);
          resetForm();
          handleClose();
        })

    } else {

      fetch('/api/addEvents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      })
        .then(response => response.json())
        .then(data => {
          setEvents(...events, data);
          resetForm();
          handleClose();

        })
        .catch(error => console.error('Error saving event:', error));
    }
  };

  const handleAllDayChange = (event) => {
    setAllDay(event.target.checked);
  };

  const handleTimesToRepeatChange = (event) => {
    setTimesToRepeat(event.target.value)
  }


  const dateToUsable = (year, month, day) => {
    month = month + 1;
    if (month < 10) {
      var month = '0' + (month);
    }
    if (day < 10) {
      var day = '0' + (day);
    }
    return year + '-' + month + '-' + day;
  }

  const timeToUsable = (hours, minutes) => {
    if (hours < 10) {
      var hours = '0' + (hours);
    }
    if (minutes < 10) {
      var minutes = '0' + (minutes);
    }
    return hours + ':' + minutes;

  }

  const combineDateAndTime = (date, time) => {
    let [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    if (time !== '') {
      let [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
      return date = new Date(year, month - 1, day, hours, minutes);
    } else {
      return date = new Date(year, month - 1, day);
    }

  }

  const calculateRepeatEndDate = (startDate, timesToRepeat) => {
    let [year, month, day] = startDate.split('-').map(num => parseInt(num, 10));
    let date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + (7 * timesToRepeat));
    return date;
  }

  function convertDaysToIntegers(dayNames) {
    const dayMap = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };

    return dayNames.map(dayName => dayMap[dayName]);
  }

  function convertIntegersToDays(dayIntegers) {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];

    return dayIntegers.map(dayIndex => days[dayIndex]);
  }

  const modifyEvent = (event) => {
    setSelectedCalendars(event._def.extendedProps.calendar);
    if (event.end !== null) {
      setEndDate(dateToUsable(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()));
    } else {
      setEndDate('')
    }
    if (event._def.recurringDef !== null) {
      setIsRecurring(true);
      if (event._def.recurringDef.typeData.daysOfWeek !== null) {
        setRecurringDays(convertIntegersToDays(event._def.recurringDef.typeData.daysOfWeek));

      }
    }
    setCurrentId(event.id);
    setAllDay(event.allDay);
    if (!event.allDay) {
      // mi serve timeToUsable perche getHours() e getMinutes() mi ritornano tipo 2 se e' sono le 02:00, invece mi serve 02
      if (event.start === null) {
        setStartTime('');
      } else if (event.end === null) {
        setEndTime('');
      } else {

        setStartTime(timeToUsable(event.start.getHours(), event.start.getMinutes()));
        setEndTime(timeToUsable(event.end.getHours(), event.end.getMinutes()));
      }
    }
    setEventTitle(event.title);
    setDescription(event.extendedProps.description);
    // mi serve dateToUsable perche getMonth() mi ritorna 1 se e' gennaio, invece mi serve 01
    if (event.start !== null) {
      setStartDate(dateToUsable(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()));
    } else {
      setStartDate('')
    }
    if (event.extendedProps.timesToRepeat !== null) {
      setTimesToRepeat(event.extendedProps.timesToRepeat);
    }
    setLocation(event.extendedProps.location);
    setEventColor(event.backgroundColor);
    setModifying(true);
    handleOpen();

  }

  const draggedEvents = (event) => {

    setSelectedCalendars(event._def.extendedProps.calendar);
    if (event.end !== null) {
      setEndDate(dateToUsable(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()));
    } else {
      setEndDate('')
    }
    if (event._def.recurringDef !== null) {
      setIsRecurring(true);
      if (event.extendedProps.daysOfWeek !== null) {
        setRecurringDays(convertIntegersToDays(event._def.recurringDef.typeData.daysOfWeek));
      }
    }
    setCurrentId(event.id);
    setAllDay(event.allDay);
    if (!event.allDay && event.start !== null && event.end !== null) {
      // mi serve timeToUsable perche getHours() e getMinutes() mi ritornano tipo 2 se e' sono le 02:00, invece mi serve 02

      setStartTime(timeToUsable(event.start.getHours(), event.start.getMinutes()));
      setEndTime(timeToUsable(event.end.getHours(), event.end.getMinutes()));
    }
    setEventTitle(event.title);
    setDescription(event.extendedProps.description);
    // mi serve dateToUsable perche getMonth() mi ritorna 1 se e' gennaio, invece mi serve 01
    if (event.start !== null) {
      setStartDate(dateToUsable(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()));
    } else {
      setStartDate('')
    }
    if (event.extendedProps.timesToRepeat !== null) {
      setTimesToRepeat(event.extendedProps.timesToRepeat);
    }

    setEventColor(event.backgroundColor);
    setModifying(true);

    handleDraggedOpen();
  }

  const handleDraggedOpen = () => {
    setDraggedOpen(true);
  }

  const handleDraggedClose = () => {
    setDraggedOpen(false);
  }

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const resetForm = () => {
    setEventTitle('');
    setStartDate('');
    setEndDate('');
    setEventColor('');
    setAllDay(false);
    setStartTime('');
    setEndTime('');
    setRecurringDays([]);
    setIsRecurring(false);
    setDescription('');
    setModifying(false);
    setCurrentId('');
    setShared([]);
  };

  const addInvitedUser = () => {
    setInvitedUsers([...invitedUsers, inviteUser]);
    setInviteUser('');
  };

  const removeInvitedUser = (user) => {
    setInvitedUsers(invitedUsers.filter(u => u !== user));
  };

  return (
    <>
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="dayGridMonth"
        selectable={true}
        events={events}
        select={(e) => addEvent(e)}
        editable={true}
        eventClick={(e) => modifyEvent(e.event)}
        eventStartEditable={true}
        eventReceive={(e) => draggedEvents(e.event)}
        eventDragStart={(e) => setDragVariable(true)}
        eventDragStop={(e) => setDragVariable(false)}
        themeSystem='bootstrap5'
        height='100%'
        aspectRatio={1}
      />
      <Dialog open={draggedOpen} onClose={handleDraggedClose}>
        <DialogTitle>Modify Event</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <Typography> Are you sure you want to modify this event?</Typography>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDraggedClose}>Cancel</Button>
          <Button
            onClick={() => {
              saveEvent();
              handleDraggedClose();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="calendar-select-label">Select Calendars</InputLabel>
            <Select
              labelId="calendar-select-label"
              id="calendars"
              multiple
              value={selectedCalendars}
              onChange={(e) => setSelectedCalendars(e.target.value)}
              label="Select Calendars"
              variant="standard"
              renderValue={(selected) => selected.join(', ')}
            >
              {calendars.map((calendar) => (
                <MenuItem key={calendar.id} value={calendar.name}>
                  <Checkbox checked={selectedCalendars.indexOf(calendar.name) > -1} />
                  <ListItemText primary={calendar.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Ensure a calendar is selected */}
          {selectedCalendars.length === 0 && (
            <Typography color="error">Please select at least one calendar.</Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Event Title"
            type="text"
            fullWidth
            variant="standard"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          {!eventTitle && (
            <Typography color="error">Please insert a Title for your event.</Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Description"
            type="text"
            fullWidth
            variant="standard"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox checked={allDay} onChange={handleAllDayChange} />}
            label="All Day Event"
          />
          {!allDay && (
            <>
              <TextField
                margin="dense"
                id="start-time"
                label="Start Time"
                type="time"
                fullWidth
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <TextField
                margin="dense"
                id="end-time"
                label="End Time"
                type="time"
                fullWidth
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </>
          )}
          <FormControlLabel
            control={<Checkbox checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />}
            label="Recurring"
          />
          {isRecurring && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel id="recurring-day-label">Days of the Week</InputLabel>
                <Select
                  labelId="recurring-day-label"
                  id="recurring-day"
                  multiple
                  value={recurringDays}
                  onChange={(e) => {
                    setRecurringDays(e.target.value);

                    // Automatically update start date based on recurring days
                    if (e.target.value.length > 0) {
                      const today = new Date();
                      const nextDay = new Date(
                        today.setDate(
                          today.getDate() +
                          ((7 - today.getDay() + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(e.target.value[0])) % 7)
                        )
                      );
                      setStartDate(nextDay.toISOString().split('T')[0]);

                      // Reset end date if it doesn't make sense
                      if (new Date(endDate) < new Date(nextDay)) {
                        setEndDate('');
                      }
                    }
                  }}
                  label="Days of the Week"
                  variant="standard"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <MenuItem key={day} value={day}>
                      <Checkbox checked={recurringDays.indexOf(day) > -1} />
                      <ListItemText primary={day} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Number of Repeats"
                type="number"
                fullWidth
                margin="dense"
                value={timesToRepeat}
                onChange={handleTimesToRepeatChange}
                inputProps={{ min: 0 }}
              />
            </>
          )}

          <TextField
            margin="dense"
            id="start"
            label="Start Date"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          {/* Error message for no start date selected */}
          {!startDate && (
            <Typography color="error">Please select a start date.</Typography>
          )}
          <TextField
            margin="dense"
            id="end"
            label="End Date"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required={!isRecurring}
          />
          {/* Error message for no end date selected when not recurring */}
          {!endDate && !isRecurring && (
            <Typography color="error">Please select an end date.</Typography>
          )}
          <TextField
            margin="dense"
            id="location"
            label="Location"
            type="text"
            fullWidth
            variant="standard"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="color-select-label">Event Color</InputLabel>
            <Select
              labelId="color-select-label"
              id="color"
              value={eventColor}
              label="Event Color"
              onChange={(e) => setEventColor(e.target.value)}
              variant="standard"
            >
              {commonColors.map((color) => (
                <MenuItem key={color.hex} value={color.hex}>
                  <Box display="flex" alignItems="center">
                    <Box width={14} height={14} marginRight={1} bgcolor={color.hex} style={{ display: 'inline-block' }}></Box>
                    {color.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="username"
            label="Invite User"
            type="text"
            fullWidth
            variant="standard"
            value={inviteUser}
            onChange={(e) => setInviteUser(e.target.value)}
          />
          <Button onClick={addInvitedUser}>Add User</Button>
          <div>
            {invitedUsers.map((user, index) => (
              <div key={index}>
                {user}
                <Button onClick={() => removeInvitedUser(user)}>Remove</Button>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          {modifying && <Button onClick={deleteEvent}>Delete</Button>}
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!startDate || (endDate === "" && !isRecurring)) {
                alert("Please enter both start and end dates.");
                return;
              }
              if (selectedCalendars.length === 0) {
                alert("Please select at least one calendar.");
                return;
              }
              saveEvent()
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <IconButton
        onClick={toggleDrawer(true)}
        style={{
          position: 'fixed',
          right: '-15px', 
          top: 'calc(45% - 24px)', 
          width: '34px', 
          height: '34px',
          zIndex: 1000, 
          color: 'white',
          backgroundColor: '#0d6efd', 
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)', 
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box p={2} width="250px" role="presentation">
          <Tasks />
        </Box>
      </Drawer>
    </>

  );
}