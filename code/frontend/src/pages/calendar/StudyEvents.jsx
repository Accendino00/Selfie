import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import useTokenChecker from '../../utils/useTokenChecker';
import cookies from 'js-cookie';
import { Form } from 'react-router-dom';
import { FormControl } from '@mui/material';


const StudyEvents = ({ StudyEventsToSend, StudyEventsDialog, StudyEventToModify, StudyEventFinish, StudyEventToDrag, draggedStudyEventsDialog, studyEventDate, setStudyEventDate }) => {
    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const [StudyEvents, setStudyEvents] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [modifying, setModifying] = useState(false);
    const [recurringDays, setRecurringDays] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [StudyEventColor, setStudyEventColor] = useState('#000000');
    const [isRecurring, setIsRecurring] = useState(false);
    const [timesToRepeat, setTimesToRepeat] = useState(0);
    const [allDay, setAllDay] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [draggedOpen, setDraggedOpen] = useState(false);

    const token = cookies.get('token');


    useEffect(() => {
        if (StudyEventsDialog && StudyEventToModify) {
            modifyStudyEvent(StudyEventToModify);
            StudyEventFinish();
        }
        if (draggedStudyEventsDialog && StudyEventToDrag) {
            draggedStudyEvents(StudyEventToDrag);
            StudyEventFinish();
        }
        if (StudyEventsDialog && !StudyEventToModify) {
            handleOpenDialog();
            StudyEventFinish();
            setStudyEventDate('');
        }
    }, [StudyEventsDialog, StudyEventToModify, StudyEventToDrag]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`/api/getStudyEvents?username=${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    StudyEventsToSend(data)
                    setStudyEvents(data)
                })
                .catch(error => console.error("Error fetching StudyEvents:", error));
        }, 500);

        return () => clearInterval(interval);
    }, [username, token]);

    const handleDeleteStudyEvent = (currentId) => {
        fetch(`/api/deleteStudyEvent/${currentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setStudyEvents(data)
                resetForm();
                handleCloseDialog();
            })
            .catch(error => console.error("Error deleting StudyEvent:", error));
    };

    const addStudyEvent = () => {
        const borderColor = '#FF007F';
        const StudyEventData = {
            title: title,
            description: description,
            start: combineDateAndTime(startDate, startTime),
            end: startDate,
            name: username,
            timesToRepeat: timesToRepeat,
            isRecurring: isRecurring,
            allDay: allDay,
            color: StudyEventColor,
            isStudyEvent: true,
            completed: completed,
            borderColor: allDay ? borderColor : taskColor,
        };

        if (isRecurring) {
            StudyEventData.startRecur = startDate;
            StudyEventData.start = startDate;
            if (timesToRepeat > 0) {
                StudyEventData.timesToRepeat = timesToRepeat;
                StudyEventData.endRecur = calculateRepeatEndDate(startDate, timesToRepeat);
                StudyEventData.daysOfWeek = getDayOfWeek(startDate);
            }
        }

        if (modifying) {
            fetch(`/api/modifyStudyEvent/${currentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(StudyEventData),
            })
                .then(response => response.json())
                .then(data => {

                    setStudyEvents(data);
                    resetForm();
                    handleCloseDialog();
                })

        } else {
            fetch(`/api/addStudyEvent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(StudyEventData)
            })
                .then(response => response.json())
                .then(data => {
                    setStudyEvents(data);
                    resetForm();
                    handleCloseDialog();
                })
                .catch(error => console.error("Error saving StudyEvent:", error));
        }
    };

    const modifyStudyEvent = (StudyEvent) => {
        if (StudyEvent.completed) {
            setCompleted(true);
        } else {
            setCompleted(false);
        }
        if (StudyEvent.isRecurring) {
            setIsRecurring(true);
            if (StudyEvent.recurringDays) {
                setRecurringDays(convertIntegersToDays(StudyEvent.recurringDays));
            }
        } else {
            setIsRecurring(false);
        }

        setCurrentId(StudyEvent._id);
        setAllDay(StudyEvent.allDay);

        if (!StudyEvent.allDay) {
            if (StudyEvent.start === null) {
                setStartTime('');
            } else {
                const startDate = new Date(StudyEvent.start);
                setStartTime(timeToUsable(startDate.getHours(), startDate.getMinutes()));
            }
        }

        setTitle(StudyEvent.title);
        setDescription(StudyEvent.description);

        if (StudyEvent.start !== null) {
            const startDate = new Date(StudyEvent.start);
            setStartDate(dateToUsable(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
        } else {
            setStartDate('');
        }

        if (StudyEvent.timesToRepeat !== null) {
            setTimesToRepeat(StudyEvent.timesToRepeat);
        } else {
            setTimesToRepeat(0);
        }
        if (StudyEvent.color) {
            setStudyEventColor(StudyEvent.color);

        } else {
            setStudyEventColor('#000000');
        }
        setModifying(true);
        setOpenDialog(true);
    };

    const draggedStudyEvents = (StudyEvent) => {

        if (StudyEvent.completed) {
            setCompleted(true);
        } else {
            setCompleted(false);
        }

        setCurrentId(StudyEvent._id);
        console.log(StudyEvent._id)

        if (StudyEvent.isRecurring) {
            setIsRecurring(true);

            // if StudyEvent is recurring then I might have clicked on a "fake" StudyEvent renderized by fullcalendar, so I need to check
            // the StudyEvent.id and get the actual StudyEvent from the database.
            fetch(`/api/getSingleStudyEvent/${currentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {

                    console.log(data)
                    StudyEvent = data;
                    console.log(StudyEvent)
                })
                .catch(error => console.error('Error fetching StudyEvent:', error));
        }
        setAllDay(StudyEvent.allDay);
        if (!StudyEvent.allDay) {
            // mi serve timeToUsable perche getHours() e getMinutes() mi ritornano tipo 2 se e' sono le 02:00, invece mi serve 02
            if (StudyEvent.start === null) {
                setStartTime('');
            } else {

                setStartTime(timeToUsable(StudyEvent.start.getHours(), StudyEvent.start.getMinutes()));
            }
        }

        setTitle(StudyEvent.title);
        setDescription(StudyEvent.description);
        // mi serve dateToUsable perche getMonth() mi ritorna 1 se e' gennaio, invece mi serve 01
        if (StudyEvent.start !== null) {
            setStartDate(dateToUsable(StudyEvent.start.getFullYear(), StudyEvent.start.getMonth(), StudyEvent.start.getDate()));
        } else {
            setStartDate(null)
        }
        if (StudyEvent.timesToRepeat !== null) {
            setTimesToRepeat(StudyEvent.timesToRepeat);
        }
        setStudyEventColor(StudyEvent.backgroundColor);
        setModifying(true);

        handleDraggedOpen();


    }

    const dateToUsable = (year, month, date) => {
        const pad = (n) => n < 10 ? '0' + n : n;
        return `${year}-${pad(month + 1)}-${pad(date)}`;
    };

    const timeToUsable = (hours, minutes) => {
        const pad = (n) => n < 10 ? '0' + n : n;
        return `${pad(hours)}:${pad(minutes)}`;
    };

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



    const combineDateAndTime = (date, time) => {
        console.log('im in StudyEvents')
        console.log(date)
        console.log(time)
        let [year, month, day] = date.split('-').map(num => parseInt(num, 10));
        if (time !== '') {
            let [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
            return date = new Date(year, month - 1, day, hours, minutes);
        } else {
            return date = new Date(year, month - 1, day);
        }

    }

    const handleOpenDialog = (StudyEvent) => {
        resetForm();
        if (studyEventDate) {
            setStartDate(studyEventDate);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const combineDateTime = (date, time) => {
        return `${date}T${time}:00`;
    };


    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStartDate('');
        setStartTime('');
        setStudyEventColor('#000000');
        setIsRecurring(false);
        setTimesToRepeat(0);
        setAllDay(false);
        setCurrentId(null);
        setModifying(false);
        setCompleted(false);
    }

    const handleAddStudyEvent = () => {
        addStudyEvent();
        resetForm();
    }

    const handleDraggedOpen = () => {
        setDraggedOpen(true);
    }

    const handleDraggedClose = () => {
        setDraggedOpen(false);
    }

    const calculateRepeatEndDate = (startDate, timesToRepeat) => {
        let [year, month, day] = startDate.split('-').map(num => parseInt(num, 10));
        let date = new Date(year, month - 1, day);
        date.setDate(date.getDate() + (7 * (parseInt(timesToRepeat) + 1)));

        let endYear = date.getFullYear();
        let endMonth = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        let endDay = date.getDate().toString().padStart(2, '0');

        return `${endYear}-${endMonth}-${endDay}`;
    }

    const getDayOfWeek = (dateString) => {
        // Create a Date object from the date string
        let [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        let date = new Date(year, month - 1, day);

        // Get the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
        return [date.getDay()];
    }

    const handleToggleComplete = (id) => {
        setCompleted(!completed);
        const newStudyEvents = StudyEvents.map(StudyEvent => {
            if (StudyEvent._id === id) {
                return { ...StudyEvent, completed: !StudyEvent.completed };
            }
            return StudyEvent;
        });
        setStudyEvents(newStudyEvents);
    };

    const listItemStyle = (completed) => ({
        textDecoration: completed ? 'line-through' : 'none',
    });


    return (
        <Box>
            <Dialog open={draggedOpen} onClose={handleDraggedClose}>
                <DialogTitle>Modify Event</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <Typography> Are you sure you want to modify this StudyEvent?</Typography>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDraggedClose}>Cancel</Button>
                    <Button
                        onClick={() => {
                            addStudyEvent();
                            handleDraggedClose();
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{currentId ? "Edit StudyEvent" : "Add StudyEvent"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    {!title && (
                        <Typography color="error">Please insert a Title for your StudyEvent.</Typography>
                    )}
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        variant="standard"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Date"
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
                    {!startDate && (
                        <Typography color="error">Please insert a Date for your StudyEvent.</Typography>
                    )}
                    {!allDay && (
                        <TextField
                            margin="dense"
                            label="Time"
                            type="time"
                            fullWidth
                            variant="standard"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    )}
                    <TextField
                        margin="dense"
                        label="Color"
                        type="color"
                        fullWidth
                        variant="standard"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={StudyEventColor}
                        onChange={(e) => setStudyEventColor(e.target.value)}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Recurring StudyEvent"
                    />
                    {isRecurring && (
                        <TextField
                            margin="dense"
                            label="Times to Repeat"
                            type="number"
                            fullWidth
                            variant="standard"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={timesToRepeat}
                            onChange={(e) => setTimesToRepeat(e.target.value)}
                        />
                    )}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={allDay}
                                onChange={(e) => setAllDay(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="All Day StudyEvent"
                    />
                    {modifying &&
                        <FormControlLabel
                            control={<Checkbox
                                checked={completed}
                                onChange={() => handleToggleComplete(currentId)}
                                color="primary"
                            />}
                            label="Completed?"
                        />
                    }
                </DialogContent>
                <DialogActions>
                    {modifying && <Button onClick={() => handleDeleteStudyEvent(currentId)}>Delete</Button>}
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={

                        handleAddStudyEvent
                    } color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>

    );
};

export default StudyEvents;
