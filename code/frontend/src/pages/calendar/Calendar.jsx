import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
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
import { CircularProgress } from '@mui/material';
import StudyEvent from './StudyEvents';
import { ListItem } from '@mui/material';
import { ListItemIcon } from '@mui/material';
import { List } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Delete } from '@mui/icons-material';
import { set } from 'date-fns';

export default function Calendar({ createButton, chosenCalendars, calendars, studyEventCreateButton, taskCreateButton }) {

  // events
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventColor, setEventColor] = useState('');
  const [allDay, setAllDay] = useState(true);
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
  const [name, setName] = useState('');

 // const [view, setView] = useState('');



  // tasks
  const [tasks, setTasks] = useState([]);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [taskToModify, setTaskToModify] = useState('');
  const [taskToDrag, setTaskToDrag] = useState('');
  const [draggedTasksDialogOpen, setDraggedTasksDialogOpen] = useState(false);
  const [isTask, setIsTask] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState('');
  const [isTaskCheckBox, setIsTaskCheckBox] = useState(false);
  const [passLateTasks, setPassLateTasks] = useState([]);

  // studyevents
  const [isStudyEvent, setIsStudyEvent] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const [studyEvents, setStudyEvents] = useState([]);
  const [draggedStudyEventsDialogOpen, setDraggedStudyEventsDialogOpen] = useState(false);
  const [studyEventsDialogOpen, setStudyEventsDialogOpen] = useState(false);
  const [studyEventToModify, setStudyEventToModify] = useState('');
  const [studyEventToDrag, setStudyEventToDrag] = useState('');
  const [isStudyEventCheckBox, setIsStudyEventCheckBox] = useState(false);

  // misc
  const { loginStatus, isTokenLoading, username } = useTokenChecker();
  const token = Cookies.get('token');
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [validationError, setValidationError] = useState('');



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
    } else if (studyEventCreateButton) {

      setIsStudyEvent(true)
      setStudyEventsDialogOpen(true);

    } else if (taskCreateButton) {
      setIsTask(true);
      setTasksDialogOpen(true);
    }
  }, [createButton, studyEventCreateButton, taskCreateButton]);

  
  
  const addEvent = (info) => {
    resetForm();
    setAllDay(true);
    setIsTaskCheckBox(true);
    setIsStudyEventCheckBox(true);
    if (info) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view
      if(view){
        if(view.type === 'timeGridWeek' || view.type === 'timeGridDay'){
          console.log(view)
          setAllDay(false);
          setStartTime(timeToUsable(info.start.getHours(), info.start.getMinutes()));
          setEndTime(timeToUsable(info.end.getHours(), info.end.getMinutes()));
      }
    }
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
      isShared: shared.length > 0,
      isRecurring: isRecurring,

    };

    if (isRecurring) {

      eventData.startRecur = startDate;
      eventData.start = startDate;
      eventData.end = endDate;
      if (endDate !== '' && endDate !== null) {
        eventData.endRecur = endDate;

      } else if (timesToRepeat != "0" && eventData.daysOfWeek !== null) {

        eventData.endRecur = calculateRepeatEndDate(startDate, timesToRepeat);
      } else {

        eventData.endRecur = null;
        eventData.end = null;

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
      if (timesToRepeat != "0" && eventData.daysOfWeek === null && eventData.endRecur === null && eventData.end === null) {

        eventData.endRecur = calculateRepeatEndDate(startDate, timesToRepeat);
        eventData.timesToRepeat = timesToRepeat;

      }
      if (timesToRepeat == "0") {

        eventData.timesToRepeat = null;
      }

      eventData.daysOfWeek = getDayOfWeek(startDate, endDate);
      console.log('calculate days of week', getDayOfWeek(startDate, endDate))
      if (recurringDays.length !== 0) {
        console.log('recurring days', recurringDays)

        eventData.daysOfWeek = convertDaysToIntegers(recurringDays);

      } else {
        console.log('daysofweek is null')
        eventData.daysOfWeek = null;
      }

    } else {
      eventData.daysOfWeek = null;
      eventData.startTime = null;
      eventData.endTime = null;
      eventData.startRecur = null;
      eventData.endRecur = null;
    }
    console.log('eventdata', eventData)

    if (modifying) {

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


    // Check if startDate is a Date object, if not convert from string
    let start = startDate instanceof Date ? startDate : new Date(startDate);
    let daysOfWeek = [];

    if (endDate === null || endDate === '') {
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



    if (event.extendedProps.isStudyEvent) {
      setIsStudyEvent(true);
      setStudyEventsDialogOpen(true);
      setStudyEventToModify({
        title: event.title,
        description: event.extendedProps.description,
        start: event.start,
        end: event.start,
        color: event.backgroundColor,
        allDay: event.allDay,
        isStudyEvent: event.extendedProps.isStudyEvent,
        name: event.extendedProps.name,
        isRecurring: event.extendedProps.isRecurring,
        timesToRepeat: event.extendedProps.timesToRepeat,
        studyTime: event.extendedProps.studyTime,
        breakTime: event.extendedProps.breakTime,
        cycles: event.extendedProps.cycles,
        totalMinutes: event.extendedProps.totalMinutes,
        //daysOfWeek: event._def.recurringDef.typeData.daysOfWeek,
        completed: event.extendedProps.completed,
        mode: event.extendedProps.mode,
        _id: event.id
      });
      return;
    }

    if (event.extendedProps.isTask) {
      setIsTask(true)
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
        users: event.extendedProps.users,
        _id: event.id
      });
      console.log('swag', taskToModify)
      return;
    }

    setIsTaskCheckBox(false);
    setIsStudyEventCheckBox(false);

    setSelectedCalendars(event._def.extendedProps.calendar);
    if (event.end !== null) {
      setEndDate(dateToUsable(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()));
    } else {
      setEndDate('')
    }
    if (event._def.extendedProps.isRecurring) {
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
    setShared(event.extendedProps.shared);
    setInvitedUsers(event.extendedProps.invitedUsers);
    setName(event.extendedProps.name);

    console.log(event)

    setModifying(true);
    handleOpen();

  }

  const draggedEvents = (event) => {
    if (event.extendedProps.isStudyEvent) {
      setDraggedStudyEventsDialogOpen(true);
      setStudyEventToDrag({
        title: event.title,
        description: event.extendedProps.description,
        start: event.start,
        end: event.start,
        color: event.backgroundColor,
        allDay: event.allDay,
        isStudyEvent: event.extendedProps.isStudyEvent,
        name: event.extendedProps.name,
        isRecurring: event.extendedProps.isRecurring,
        timesToRepeat: event.extendedProps.timesToRepeat,
        studyTime: event.extendedProps.studyTime,
        breakTime: event.extendedProps.breakTime,
        cycles: event.extendedProps.cycles,
        totalMinutes: event.extendedProps.totalMinutes,
        //daysOfWeek: event._def.recurringDef.typeData.daysOfWeek,
        completed: event.extendedProps.completed,
        mode: event.extendedProps.mode,
        _id: event.id
      });

      return;
    }

    if (event.extendedProps.isTask) {

      setDraggedTasksDialogOpen(true);
      setTaskToDrag({
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
        users: event.extendedProps.users,
        _id: event.id
      });

      return;
    }

    setIsTaskCheckBox(false);
    setIsStudyEventCheckBox(false);

    setCurrentId(event.id);

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

          event = data;

        })
        .catch(error => console.error('Error fetching event:', error));


      console.log('wtf', event)
      if (event._def.recurringDef.typeData.daysOfWeek !== null) {

        setRecurringDays(convertIntegersToDays(event._def.recurringDef.typeData.daysOfWeek));

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
    setShared(event.extendedProps.shared);
    setInvitedUsers(event.extendedProps.invitedUsers);
    setName(event.extendedProps.name);

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
    setTimesToRepeat(0);
    setDescription('');
    setModifying(false);
    setCurrentId('');
    setShared([]);
    setIsStudyEvent(false);
    setIsTask(false);
    setInvitedUsers([]);
  };

  const addInvitedUser = async () => {
    const error = await checkRestrictedPeriods(inviteUser);
    console .log('error', error)  
    if (error) {
      setValidationError(error);
      setInviteUser('');
      
    } else {
      setInvitedUsers([...invitedUsers, inviteUser]);
      setInviteUser('');
      setValidationError('');
    }
  };


  

  const removeInvitedUser = (user) => {
    setInvitedUsers(invitedUsers.filter(u => u !== user));
    fetch(`/api/removeInvitedUser/${currentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ user: user })
    })
      .then(response => response.json())
      .then(data => {
        setEvents(data);
      })
      .catch(error => console.error('Error removing invited user:', error));
  };

  const removeSharedUser = (user) => {
    setShared(shared.filter(u => u !== user));
    fetch(`/api/removeSharedUser/${currentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ user: user })
    })
      .then(response => response.json())
      .then(data => {
        setEvents(data);
      })
      .catch(error => console.error('Error removing shared user:', error));
  };



  const handleTasksFromTasks = (tasks) => {
    setTasks(tasks);
  }

  const handleStudyEventsFromStudyEvents = (studyEvents) => {
    setStudyEvents(studyEvents);
  }

  const handleTaskFinish = (tasksDialogOpen, taskToModify, taskToDrag) => {
    setTasksDialogOpen(false)
    setDraggedTasksDialogOpen(false)
    setStudyEventsDialogOpen(false)
    setDraggedStudyEventsDialogOpen(false)
    if (taskToModify != '') {
      setTaskToModify('');
    }
    if (taskToDrag != '') {
      setTaskToDrag('');
    }
  }

  const handleStudyEventFinish = (studyEventsDialogOpen, studyEventToModify, studyEventToDrag) => {
    setStudyEventsDialogOpen(false)
    setDraggedStudyEventsDialogOpen(false)
    if (studyEventToModify != '') {
      setStudyEventToModify('');
    }
    if (studyEventToDrag != '') {
      setStudyEventToDrag('');
    }
  }

  const allEventsToDisplay = () => {
    let lateTasks = [];
    let nonLateTasks = [];
    let allEvents = [];
    for (let i = 0; i < events.length; i++) {
      allEvents.push(events[i]);
    }
    if (chosenCalendars.includes('tasks')) {
      for (let i = 0; i < tasks.length; i++) {
        if (!tasks[i].completed) {
          allEvents.push(tasks[i]);
        }

        // Check if the task is late
        if (!tasks[i].isRecurring && new Date(tasks[i].end) <= new Date()) {
          lateTasks.push(tasks[i]);

        } else if ((tasks[i].isRecurring && new Date(tasks[i].endRecur) <= new Date())) {
          //console.log((tasks[i].isRecurring && tasks[i].isLate))
          lateTasks.push(tasks[i]);

        } else {
          nonLateTasks.push(tasks[i]);
        }

      }
    }
    if (chosenCalendars.includes('pomodoro')) {

      for (let i = 0; i < studyEvents.length; i++) {
        allEvents.push(studyEvents[i]);
      }
    }

    return {
      allEvents,
      lateTasks,
      nonLateTasks
    };
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
    //const view = calendarApi.view
    //setView(view)
    //console.log(view.type);
  };

  useEffect(() => {
    if (isStudyEvent) {
      setStudyEventsDialogOpen(true);
      handleClose();
    } else if (isTask) {
      setTasksDialogOpen(true);
      handleClose();
    }
  }, [isStudyEvent, isTask]);

  const listItemStyle = (completed) => ({
    textDecoration: completed ? 'line-through' : 'none',
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function getDayName(day) {
    if (typeof day === 'string' && !isNaN(day)) {
      // Convert string number to integer and get day name
      return dayNames[parseInt(day)];
    } else if (typeof day === 'number') {
      // Get day name from integer
      return dayNames[day];
    }
    return day;  // Return the day name if it's not a number
  }

  function translateDays(days) {
    return days.map(day => getDayName(day));
  }

  const handleSharedUserList = (user) => {
    if (user === username) {
      return;
    } else {
      return (
        <Box display="flex" flexDirection="row" >
        <Typography>{user}</Typography><Button onClick={() => removeSharedUser(user)}>Delete</Button>
        </Box>
      )
    }
}


  const checkRestrictedPeriods = async (username) => {
    try {
      console.log('username', username)
      console.log('startDate', startDate)
      console.log('endDate', endDate)
      const fetchRestrictedPeriods = await fetch(`/api/restrictedPeriods?username=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const restrictedPeriods = await fetchRestrictedPeriods.json();
      console.log('restricted periods', restrictedPeriods)
      if (restrictedPeriods.length > 0) {
        for(let i = 0; i < restrictedPeriods.length; i++) {
          console.log('start', new Date(restrictedPeriods[i].start))
          console.log('end', new Date(restrictedPeriods[i].end))
          if (new Date(restrictedPeriods[i].start) >= new Date(startDate) && new Date(restrictedPeriods[i].start) <= new Date(endDate) || new Date(restrictedPeriods[i].end) >= new Date(startDate) && new Date(restrictedPeriods[i].end) <= new Date(endDate) || new Date(restrictedPeriods[i].start) <= new Date(startDate) && new Date(restrictedPeriods[i].end) >= new Date(endDate)) {
            console.log('User is not available during this time.')
            return 'User is not available during this time.';
          }
        }
      }
      return '';
    }
    catch (error) {
      console.error('Error fetching restricted periods:', error);
    }

  }
      

  return (
    <>
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin, rrulePlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="dayGridMonth"
        selectable={true}
        events={allEventsToDisplay().allEvents}
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

      <Tasks tasksToSend={handleTasksFromTasks} tasksDialog={false} taskToModify={taskToModify} taskFinish={handleTaskFinish} taskToDrag={taskToDrag} draggedTasksDialog={draggedTasksDialogOpen} taskToDelete={taskToDelete} taskDate={startDate} setTaskDate={setStartDate} />
      <StudyEvent StudyEventsToSend={handleStudyEventsFromStudyEvents} StudyEventsDialog={false} StudyEventToModify={studyEventToModify} StudyEventFinish={handleStudyEventFinish} StudyEventToDrag={studyEventToDrag} draggedStudyEventsDialog={draggedStudyEventsDialogOpen} studyEventDate={startDate} setStudyEventDate={setStartDate} />

      {isTask &&
        <Tasks tasksToSend={handleTasksFromTasks} tasksDialog={tasksDialogOpen} taskToModify={taskToModify} taskFinish={handleTaskFinish} taskToDrag={taskToDrag} draggedTasksDialog={false} taskToDelete={taskToDelete} taskDate={startDate} setTaskDate={setStartDate} />
      }
      {isStudyEvent &&
        /*<StudyComponent studyTime={studyTime} setStudyTime={setStudyTime} breakTime={breakTime} setBreakTime={setBreakTime} cycles={cycles} setCycles={setCycles} totalMinutes={totalMinutes} setTotalMinutes={setTotalMinutes}/> */
        <StudyEvent StudyEventsToSend={handleStudyEventsFromStudyEvents} StudyEventsDialog={studyEventsDialogOpen} StudyEventToModify={studyEventToModify} StudyEventFinish={handleStudyEventFinish} StudyEventToDrag={studyEventToDrag} draggedStudyEventsDialog={false} studyEventDate={startDate} setStudyEventDate={setStartDate} />
      }

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
          {isTaskCheckBox &&
            <FormControlLabel
              control={<Checkbox checked={isTask} onChange={(e) => setIsTask(e.target.checked)} />}
              label="Task"
            />
          }
          {isStudyEventCheckBox && <FormControlLabel
            control={<Checkbox checked={isStudyEvent} onChange={(e) => setIsStudyEvent(e.target.checked)} />}
            label="Study Event"
          />
          }
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
                  value={translateDays(recurringDays)}
                  onChange={(e) => {
                    setRecurringDays(e.target.value);
                    console.log(e.target.value);

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
          {validationError && 
          <Box display="flex" flexDirection="row" >
          <Typography color="error">{validationError}</Typography>
          <Button onClick={() => setValidationError('')}>Ok</Button>
          </Box>
          }
          <div>
            {invitedUsers.map((user, index) => (
              <div key={index}>
                {user}
                <Button onClick={() => removeInvitedUser(user)}>Remove</Button>
              </div>
            ))}
          </div>
          <div>
            {name}
            {shared.map((user, index) => (
              <div key={index}>
                {handleSharedUserList(user)}
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

      {/* Tasks */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box p={2} width="250px" role="presentation">
          <button onClick={handleGetEvents}>Get Events</button>
          <Typography variant="h4" gutterBottom>Tasks</Typography>
          <List>
            {Array.isArray(allEventsToDisplay().nonLateTasks) && allEventsToDisplay().nonLateTasks.map(task => (
              <ListItem key={task._id} alignItems="flex-start">
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: task.color,
                  marginRight: '10px',
                  marginTop: '13px',
                }} />
                <ListItemText
                  primary={<span style={listItemStyle(task.completed)}>{task.title}</span>}
                  secondary={
                    <>
                      {task.description && <>
                        {task.description}
                        <br />
                      </>}
                      {new Date(task.start).toLocaleDateString()}
                    </>
                  }
                />
                <IconButton edge="end" aria-label="edit" onClick={() => {
                  setIsTask(true)
                  setTaskToModify(task)
                  setTasksDialogOpen(true)
                }
                }>
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => setTaskToDelete(task._id)}>
                  <Delete />
                </IconButton>
              </ListItem>
            ))}
          </List>
          <Typography variant="h4" gutterBottom>Late Tasks</Typography>
          <List>
            {Array.isArray(allEventsToDisplay().lateTasks) && allEventsToDisplay().lateTasks.map(task => (
              <ListItem key={task._id} alignItems="flex-start">
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: task.color,
                  marginRight: '10px',
                  marginTop: '13px',
                }} />
                <ListItemText
                  primary={<span style={listItemStyle(task.completed)}>{task.title}</span>}
                  secondary={
                    <>
                      {task.description && <>
                        {task.description}
                        <br />
                      </>}
                      {new Date(task.start).toLocaleDateString()}
                    </>
                  }
                />
                <IconButton edge="end" aria-label="edit" onClick={() => {
                  setIsTask(true)
                  setTaskToModify(task)
                  setTasksDialogOpen(true)
                }
                }>
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => setTaskToDelete(task._id)}>
                  <Delete />
                </IconButton>
              </ListItem>
            ))}
          </List>
          <Tasks tasksToSend={handleTasksFromTasks} tasksDialog={false} taskToModify={taskToModify} taskFinish={handleTaskFinish} taskToDrag={taskToDrag} draggedTasksDialog={draggedTasksDialogOpen} taskToDelete={taskToDelete} />
          <Button variant="contained" color="primary" onClick={() => {
            setIsTask(true)
            setTasksDialogOpen(true)
          }}>
            Add Task
          </Button>
        </Box>
      </Drawer>
    </>

  );
}

