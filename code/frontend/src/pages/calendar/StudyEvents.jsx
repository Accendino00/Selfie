import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import useTokenChecker from '../../utils/useTokenChecker';
import cookies from 'js-cookie';
import { Form } from 'react-router-dom';
import { FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Select } from '@mui/material';
import { MenuItem } from '@mui/material';
import { ListItemIcon } from '@mui/material';
import { ListItemSecondaryAction } from '@mui/material';
import { InputLabel } from '@mui/material';



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
    const [studyTime, setStudyTime] = useState(0);
    const [breakTime, setBreakTime] = useState(0);
    const [cycles, setCycles] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


    const token = cookies.get('token');
    const navigate = useNavigate();

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
            studyTime: studyTime,
            breakTime: breakTime,
            cycles: cycles,
            totalMinutes: totalMinutes,

        };

        if (isRecurring) {

            StudyEventData.startRecur = startDate;
            StudyEventData.start = startDate;
            console.log(startDate)
            if (recurringDays.length !== 0) {

                StudyEventData.daysOfWeek = convertDaysToIntegers(recurringDays);
                if (timesToRepeat == 0) {
                    StudyEventData.endRecur = new Date(startDate);
                }
            } else {
                StudyEventData.daysOfWeek = null;
            }
            if (timesToRepeat !== "0" && StudyEventData.daysOfWeek !== null) {
                StudyEventData.endRecur = calculateRepeatEndDate(startDate, timesToRepeat);
            }
            if (timesToRepeat > 0 && recurringDays.length == 0) {
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
        console.log('ao2', StudyEvent)
        if (StudyEvent.completed) {
            setCompleted(true);
        } else {
            setCompleted(false);
        }
        if (StudyEvent.isRecurring) {
            setIsRecurring(true);
            if (StudyEvent.daysOfWeek) {
                setRecurringDays(convertIntegersToDays(StudyEvent.daysOfWeek));

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
        if (StudyEvent.studyTime) {
            setStudyTime(StudyEvent.studyTime);
        } else {
            setStudyTime(0);
        }
        if (StudyEvent.breakTime) {
            setBreakTime(StudyEvent.breakTime);
        } else {
            setBreakTime(0);
        }
        if (StudyEvent.cycles) {
            setCycles(StudyEvent.cycles);
        } else {
            setCycles(0);
        }
        if (StudyEvent.totalMinutes) {
            setTotalMinutes(StudyEvent.totalMinutes);
        } else {
            setTotalMinutes(0);
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
            if (StudyEvent.daysOfWeek) {
                setRecurringDays(convertIntegersToDays(StudyEvent.daysOfWeek));

            }
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

        if (StudyEvent.studyTime) {
            setStudyTime(StudyEvent.studyTime);
        } else {
            setStudyTime(0);
        }
        if (StudyEvent.breakTime) {
            setBreakTime(StudyEvent.breakTime);
        } else {
            setBreakTime(0);
        }
        if (StudyEvent.cycles) {
            setCycles(StudyEvent.cycles);
        } else {
            setCycles(0);
        }
        if (StudyEvent.totalMinutes) {
            setTotalMinutes(StudyEvent.totalMinutes);
        } else {
            setTotalMinutes(0);
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
        setStudyTime(0);
        setBreakTime(0);
        setCycles(0);
        setTotalMinutes(0);
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


    function addSevenDays(date) {
        const newDate = new Date(date); // Create a new Date object to avoid mutating the original date
        newDate.setDate(newDate.getDate() + 7); // Subtract 7 days
        return newDate;
    }

    const handleStudyNow = () => {
        navigate(`/timer/${studyTime}/${breakTime}/${cycles}/${totalMinutes}/${currentId}/${startDate}`);
    }


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
                    <TextField sx={{
                        opacity: "0",
                        position: 'absolute',
                        pointerEvents: 'none',
                        zIndex: "-1"
                    }}>
                        {currentId}
                    </TextField>
                    <TextField sx={{
                        opacity: "0",
                        position: 'absolute',
                        pointerEvents: 'none',
                        zIndex: "-1"
                    }}>
                        {startDate}
                    </TextField>

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
                        label="Study Time (minutes)"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={studyTime}
                        onChange={(e) => setStudyTime(Math.max(0, e.target.value))}
                    />
                    <TextField
                        margin="dense"
                        label="Break Time (minutes)"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={breakTime}
                        onChange={(e) => setBreakTime(Math.max(0, e.target.value))}
                    />
                    <TextField
                        margin="dense"
                        label="Cycles"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={cycles}
                        onChange={(e) => setCycles(Math.max(0, e.target.value))}
                    />
                    <TextField
                        margin="dense"
                        label="Total Minutes"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={totalMinutes}
                        onChange={(e) => setTotalMinutes(Math.max(0, e.target.value))}
                    />
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
                    {/*<FormControlLabel
                        control={
                            <Checkbox
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Recurring StudyEvent"
                    />*/}
                    {isRecurring && (
                        <>
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
                        </>
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
                        <>
                            <FormControlLabel
                                control={<Checkbox
                                    checked={completed}
                                    onChange={() => handleToggleComplete(currentId)}
                                    color="primary"
                                />}
                                label="Completed?"
                            />
                        </>
                    }
                </DialogContent>
                <DialogActions>
                    {modifying && <Button onClick={handleStudyNow}>Study Now</Button>}
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
