import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel, Box, FormControlLabel, Checkbox, ListItemText } from '@mui/material';
import cyberpunkColors from './CalendarStyles';
import Cookies from 'js-cookie';
import useTokenChecker from '../../utils/useTokenChecker';
import { Typography } from '@mui/material';
import './calendarCSS.css';
import Tasks from './Tasks';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Drawer from '@mui/material/Drawer';
import StudyComponent from './components/StudyComponent';
import { useRef } from 'react';
import "bootswatch/dist/Vapor/bootstrap.min.css"
import { useNavigate } from 'react-router-dom';
import TimeMachine from '../common/TimeMachine';
import { CircularProgress }  from '@mui/material';

export default function Calendar({ createButton, chosenCalendars, calendars}) {
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
  const [tasks, setTasks] = useState([]);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [taskToModify, setTaskToModify] = useState('');
  const [studyTime, setStudyTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [isStudyEvent, setIsStudyEvent] = useState(false);
  const calendarRef = useRef(null);


  const token = Cookies.get('token');
  const navigate = useNavigate();


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
          console.log(calendarRef.current.getApi().getDate())
        })
        .catch(error => {
          console.error("Error fetching events:", error)
          
    });
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
      isRecurring: isRecurring,
      studyTime: studyTime,
      breakTime: breakTime,
      cycles: cycles,
      totalMinutes: totalMinutes,
      isStudyEvent: isStudyEvent

    };

    if (isRecurring) {
      console.log('ao')
      if (recurringDays.length !== 0) {
        console.log('ao2')
        eventData.daysOfWeek = recurringDays;
        console.log('recurringDays', recurringDays)
        console.log(eventData.daysOfWeek)
      } else {
        eventData.daysOfWeek = null;
      }
      eventData.startRecur = startDate;
      eventData.start = startDate;
      eventData.end = endDate;
      if (endDate !== '' && endDate !== null) {
        eventData.endRecur = endDate;
        console.log('ciao2')
      } else if (timesToRepeat !== "0" && eventData.daysOfWeek !== null) {
        console.log('ciao')
        console.log(eventData.start)
        console.log(eventData.end)
        eventData.endRecur = calculateRepeatEndDate(startDate, timesToRepeat);
      } else {
        eventData.endRecur = null;
        eventData.end = null;
        console.log('ciao3')
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
      if (timesToRepeat !== "0" && eventData.daysOfWeek === null && eventData.endRecur === null && eventData.end === null) {
        console.log('asdasd')
        eventData.endRecur = calculateRepeatEndDate(startDate, timesToRepeat);
        eventData.timesToRepeat = timesToRepeat;
        eventData.daysOfWeek = getDayOfWeek(startDate, eventData.end);
      } else if (timesToRepeat === "0") {
        eventData.timesToRepeat = null;
      }
      console.log(eventData.end)
    } else {
      eventData.daysOfWeek = null;
      eventData.startTime = null;
      eventData.endTime = null;
      eventData.startRecur = null;
      eventData.endRecur = null;
    }

    if (modifying) {
      console.log("modifying", eventData.daysOfWeek)
      if (!validateDates()) {
        return;
      }

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
    if (date === null) {
      console.log('date is null')
      return null;
    }
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
    date.setDate(date.getDate() + (7 * (parseInt(timesToRepeat))));
    return date;
  }

  const getDayOfWeek = (startDate, endDate) => {
    console.log('imin');
    console.log(startDate, endDate);

    // Check if startDate is a Date object, if not convert from string
    let start = startDate instanceof Date ? startDate : new Date(startDate);
    let daysOfWeek = [];

    if (endDate === null) {
      // If endDate is null, only use startDate
      daysOfWeek.push(start.getDay());
      console.log('Only start date provided, calculated day of week.');
    } else {
      // Check if endDate is a Date object, if not convert from string
      let end = endDate instanceof Date ? endDate : new Date(endDate);

      // Iterate over each day between the start date and the end date
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        // Get the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
        daysOfWeek.push(date.getDay());
      }
    }

    // Return an array of unique day of the week indices
    return [...new Set(daysOfWeek)];
  }


  function convertDaysToIntegers(dayNames) {
    console.log('dayNames', dayNames)

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

    if (event.extendedProps.isTask) {

      setTasksDialogOpen(true);
      setTaskToModify({
        title: event.title,
        description: event.extendedProps.description,
        start: event.start,
        end: event.start,
        color: event.backgroundColor,
        allDay: event.allDay,
        isTask: event.extendedProps.isTask,
        name: event.extendedProps.name,
        isRecurring: event.extendedProps.isRecurring,
        timesToRepeat: event.extendedProps.timesToRepeat,
        _id: event.id
      });

      return;
    }

    setSelectedCalendars(event._def.extendedProps.calendar);
    if (event.end !== null) {
      setEndDate(dateToUsable(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()));
    } else {
      setEndDate('')
    }
    if (event._def.extendedProps.isRecurring) {
      setIsRecurring(true);
      if (event._def.recurringDef.typeData.daysOfWeek !== null) {
        setRecurringDays(getDayOfWeek(event.start, event.end));

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

    setCurrentId(event.id);
    console.log(event.id)
    if (event._def.extendedProps.isRecurring) {
      setIsRecurring(true);
      // if event is recurring then I might have clicked on a "fake" event renderized by fullcalendar, so I need to check
      // the event.id and get the actual event from the database.
      fetch(`/api/getSingleEvent/${currentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          event = data;
          console.log(event)
        })
        .catch(error => console.error('Error fetching event:', error));



      if (event.extendedProps.daysOfWeek !== null) {
        console.log(getDayOfWeek(event.start, event.end))
        setRecurringDays(getDayOfWeek(event.start, event.end));
        console.log(recurringDays)
      }
    }
    setSelectedCalendars(event._def.extendedProps.calendar);
    if (event.end !== null) {
      setEndDate(dateToUsable(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()));
    } else {
      setEndDate(null)
    }
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
      setStartDate(null)
    }
    if (event.extendedProps.timesToRepeat !== null) {
      setTimesToRepeat(event.extendedProps.timesToRepeat);
    }
    setLocation(event.extendedProps.location);
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

  const handleTasksFromTasks = (tasks) => {
    setTasks(tasks);
  }

  const handleTaskFinish = (tasksDialogOpen, taskToModify) => {
    setTasksDialogOpen(false)
    if (taskToModify) {
      setTaskToModify('');
    }
  }

  const displayEventsAndTasks = () => {
    let eventsAndTasks = [];
    for (let i = 0; i < events.length; i++) {
      eventsAndTasks.push(events[i]);
      //  if(events[i].isStudyEvent){
      //    
    }
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].completed === false) {
        eventsAndTasks.push(tasks[i]);
      }
    }
    return eventsAndTasks
  }

  const handleStudyNow = () => {
    navigate(`/timer/${studyTime}/${breakTime}/${cycles}/${totalMinutes}`);
  }

  /*const handleEventContent = (event) => {
    console.log(event)
    return (
      <Box display="flex" sx={{ height: "2vh" }}>

        {event.event.timeText}
        {event.event.title}
      </Box>
    )
  }*/

  const validateDates = () => {
    if (endDate === null) {
      return true;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("End date must be after the start date.");
      return false;
    }
    return true;
  };

  const validateTimes = () => {
    if (startDate === endDate && startTime && endTime && (new Date(`1970/01/01 ${startTime}`) >= new Date(`1970/01/01 ${endTime}`))) {
      alert("End time must be after the start time on the same day.");
      return false;
    }
    return true;
  };


  const handleGetEvents = () => {
    const calendarApi = calendarRef.current.getApi();
    const events = calendarApi.getEvents();
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
      events={displayEventsAndTasks()}
      ref={calendarRef}
      select={(e) => addEvent(e)}
      editable={true}
      eventClick={(e) => modifyEvent(e.event)}
      eventStartEditable={true}
      eventReceive={(e) => draggedEvents(e.event)}
      eventDragStart={(e) => setDragVariable(true)}
      eventDragStop={(e) => setDragVariable(false)}
      //eventContent={handleEventContent}
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
                onChange={(e) => setEndTime((isStudyEvent) ? startTime + totalMinutes : e.target.value)}
                InputProps={{
                  inputProps: {
                    min: startDate === endDate ? startTime : undefined,
                  }
                }}
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
                  value={convertIntegersToDays(recurringDays)}
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
            InputProps={{
              inputProps: {
                min: startDate
              }
            }}
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
              {cyberpunkColors.map((color) => (
                <MenuItem key={color.hex} value={color.hex}>
                  <Box display="flex" alignItems="center">
                    <Box width={14} height={14} marginRight={1} bgcolor={color.hex} style={{ display: 'inline-block' }}></Box>
                    {color.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Checkbox checked={isStudyEvent} onChange={(e) => setIsStudyEvent(e.target.checked)} />}
            label="Study ?"
            />
          {isStudyEvent &&
            <StudyComponent studyTime={studyTime} setStudyTime={setStudyTime} breakTime={breakTime} setBreakTime={setBreakTime} cycles={cycles} setCycles={setCycles} totalMinutes={totalMinutes} setTotalMinutes={setTotalMinutes} />}
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
          {modifying && isStudyEvent && <Button onClick={handleStudyNow}>Study Now</Button>}
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!validateDates() || !validateTimes()) {
                return;
              }
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
      {/* Lo metto anche qua perche i dati vengono passati lo stesso senza aspettare che il Drawer venga aperto */}
      <Tasks tasksToSend={handleTasksFromTasks} tasksDialog={tasksDialogOpen} taskToModify={taskToModify} taskFinish={handleTaskFinish} />

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
        backgroundColor: '#7d5ffc',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
      }}
      >
        <ArrowBackIosIcon />
      </IconButton>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box p={2} width="250px" role="presentation">
          <button onClick={handleGetEvents}>Get Events</button>
          <Tasks tasksToSend={handleTasksFromTasks} tasksDialog={tasksDialogOpen} taskToModify={taskToModify} taskFinish={handleTaskFinish} />
        </Box>
      </Drawer>
    </>

  );
}

