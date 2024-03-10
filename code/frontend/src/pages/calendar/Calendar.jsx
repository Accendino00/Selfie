import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel, Box, FormControlLabel, Checkbox, ListItemText } from '@mui/material';
import commonColors from './CalendarStyles';

export default function Calendar({ createButton }) {
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

  useEffect(() => {
    fetch('/api/getEvents')
      .then(response => response.json())
      .then(data => {
        setEvents(data)
        setModifying(false)
        setIsRecurring(false)
      })
      .catch(error => console.error("Error fetching events:", error));
  }, []);



  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (createButton){
      addEvent(null);
    }
  }, [createButton])


  const addEvent = (info) => {
    resetForm();
    if(info){
      setStartDate(info.startStr);
      setEndDate(info.endStr);
    }
    handleOpen();
  };

  const deleteEvent = () => {
    fetch(`/api/deleteEvents/${currentId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => { {
          setEvents(data);
          resetForm();
          handleClose();
        }
      })
      .catch(error => console.error('Error deleting event:', error));
  };


  const saveEvent = () => {
    
    let eventData = {
      id: modifying ? currentId : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      title: eventTitle,
      description: description,
      color: eventColor,
      allDay: allDay,
      start: combineDateAndTime(startDate, startTime), 
      end: combineDateAndTime(endDate, endTime),
    };

      if (isRecurring) {
        if (startTime !== '') {
          eventData.startTime = startTime;
        }
        if (endTime !== '') {
          eventData.endTime = endTime;
        }
        eventData.daysOfWeek = convertDaysToIntegers(recurringDays);
        eventData.startRecur = startDate;
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
        },
        body: JSON.stringify(eventData),
      })
        .then(response => response.json())
        .then(data => {
          setEvents(data);
          resetForm();
          handleClose();

        })
        .catch(error => console.error('Error saving event:', error));
    }
  };

  const handleAllDayChange = (event) => {
    setAllDay(event.target.checked);
  };


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
    if(event._def.recurringDef !== null) {
      setIsRecurring(true);
      setRecurringDays(convertIntegersToDays(event._def.recurringDef.typeData.daysOfWeek));
    }
    setCurrentId(event.id);
    setAllDay(event.allDay);
    if (!event.allDay) {
      // mi serve timeToUsable perche getHours() e getMinutes() mi ritornano tipo 2 se e' sono le 02:00, invece mi serve 02
      setStartTime(timeToUsable(event.start.getHours(), event.start.getMinutes()));
      setEndTime(timeToUsable(event.end.getHours(), event.end.getMinutes()));
    }
    setEventTitle(event.title);
    setDescription(event.extendedProps.description);
    // mi serve dateToUsable perche getMonth() mi ritorna 1 se e' gennaio, invece mi serve 01
    if(event.start !== null) {
    setStartDate(dateToUsable(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()));
    } else {
      setStartDate('')
    }
    if(event.end !== null){
      setEndDate(dateToUsable(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()));
    } else {
      setEndDate('')
    }
    setEventColor(event.backgroundColor);
    setModifying(true);
    handleOpen();
  }


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
        eventClick={(e) => modifyEvent(e.event)}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
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
            <FormControl fullWidth margin="dense">
              <InputLabel id="recurring-day-label">Days of the Week</InputLabel>
              <Select
                labelId="recurring-day-label"
                id="recurring-day"
                multiple
                value={recurringDays}
                onChange={(e) => setRecurringDays(e.target.value)}
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
          />
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
        </DialogContent>
        <DialogActions>
          {modifying && <Button onClick={deleteEvent}>Delete</Button>}
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={saveEvent}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}