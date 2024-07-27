import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import useTokenChecker from '../../utils/useTokenChecker';
import cookies from 'js-cookie';
import { Form } from 'react-router-dom';
import { FormControl } from '@mui/material';
import { add, set } from 'date-fns';


const Tasks = ({ tasksToSend, tasksDialog, taskToModify, taskFinish, taskToDrag, draggedTasksDialog, taskToDelete, taskDate, setTaskDate }) => {
    // Utils
    const { loginStatus, isTokenLoading, username } = useTokenChecker();

    // Array di tutti i task ottenuti dal backend
    const [tasks, setTasks] = useState([]);

    // Array di tutti i task in ritardo
    const [lateTasks, setLateTasks] = useState([]);

    // Stati per la gestione del dialog per creare un nuovo task
    const [openDialog, setOpenDialog] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [modifying, setModifying] = useState(false);
    const [recurringDays, setRecurringDays] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [taskColor, setTaskColor] = useState('#000000');
    const [isRecurring, setIsRecurring] = useState(false);
    const [timesToRepeat, setTimesToRepeat] = useState(0);
    const [allDay, setAllDay] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [draggedOpen, setDraggedOpen] = useState(false);
    const [isLate, setIsLate] = useState(false);

    const token = cookies.get('token');


    useEffect(() => {
        if (taskToDelete) {
            handleDeleteTask(taskToDelete);
        }

        if (tasksDialog && taskToModify) {
            modifyTask(taskToModify);
            taskFinish();
        }
        if (draggedTasksDialog && taskToDrag) {
            draggedTasks(taskToDrag);
            taskFinish();
        }
        if (tasksDialog && !taskToModify) {
            handleOpenDialog();
            taskFinish();
            setTaskDate('');
        }
    }, [tasksDialog, taskToModify, taskToDrag, taskToDelete]);


    useEffect(() => {

        for (let i = 0; i < tasks.length; i++) {

            if (new Date(tasks[i].end) <= new Date()) {
                updateTask(tasks[i]);
            } else if (tasks[i].isRecurring && new Date(tasks[i].endRecur) <= new Date()) {
                updateTask(tasks[i]);
            } 
        }

    }, [tasks]);


    function calculateOriginalStartDate(endDate, timesToRepeat) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() - (timesToRepeat) * 7); // Subtract 7 days for each week to repeat
        return endDateObj;
    }

    function nextSameWeekday(startDate) {
        // Create a Date object for the start date
        const startDay = new Date(startDate);
        // Get the weekday from the start date
        const startWeekday = startDay.getDay();  // getDay() returns 0 (Sunday) to 6 (Saturday)

        // Create a Date object for today
        const today = new Date();
        // Get today's weekday
        const todayWeekday = today.getDay();

        // Calculate days to add to reach the next occurrence of the same weekday
        let daysToAdd = startWeekday - todayWeekday;
        if (daysToAdd <= 0) {
            daysToAdd += 7;  // Ensure it's in the future
        }

        // Set the date to the next occurrence
        today.setDate(today.getDate() + daysToAdd);

        return today;
    }

    function addSevenDays(date) {
        const newDate = new Date(date); // Create a new Date object to avoid mutating the original date
        newDate.setDate(newDate.getDate() + 7); // Subtract 7 days
        return newDate;
    }

    // TODO list:
    /**
     * 1. Creare una funzione del tipo:
     *      updateTask(task) 
     * Prende come input un task ed esegue dei cocntrolli su cosa c'è
     * dentro. Se deve cambiare dati, per esempio se il task è in ritardo,
     * allora andrà a modificare i dati di questo task.
     * 
     * Con questi nuovi dati andrà ad eseguire una fetch al backend.
     */

    const updateTask = (task) => {
        const updatedTask = {
            title: task.title,
            description: task.description,
            start: task.start,
            end: task.end,
            name: task.name,
            timesToRepeat: task.timesToRepeat,
            isRecurring: task.isRecurring,
            allDay: task.allDay,
            color: task.color,
            isTask: task.isTask,
            completed: task.completed,
            borderColor: task.borderColor,
            isLate: task.isLate
        };

        let modifiedTask = false;
        // Esegui i controlli sul task (in ritardo, completato, etc)
        if (updatedTask.isRecurring) {
            if (task.daysOfWeek) {
                updatedTask.daysOfWeek = task.daysOfWeek;
            }
            
            if (new Date(task.endRecur) <= addSevenDays(new Date())) {
                
                updatedTask.start = formatDate(nextSameWeekday(task.start));
            }
            updatedTask.endRecur = calculateRepeatEndDate(updatedTask.start, updatedTask.timesToRepeat);
            updatedTask.startRecur = calculateOriginalStartDate(updatedTask.endRecur, parseInt(updatedTask.timesToRepeat) + 1);
            updatedTask.isLate = true;
            updatedTask.end = updatedTask.endRecur
            modifiedTask = true;
            console.log('Task in ritardo', updatedTask);
        } else {

            if (new Date(updatedTask.end) <= new Date()) {
                updatedTask.start = new Date();
                updatedTask.end = new Date();
                updatedTask.isLate = true;
                modifiedTask = true;

            } else if (updatedTask.isLate) {
                updatedTask.isLate = false;
                modifiedTask = true;
            }
        }
        if (modifiedTask) {
            // Esegui la fetch al backend
            // se fetch va a buon fine, modifichi task, lo ricerchi nella lista dei task e lo modifichi
            fetch(`/api/modifyTask/${task._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedTask)
            })
                .then(response => response.json())
                .then(data => {
                    setTasks(data);
                })
                .catch(error => console.error("Error updating task:", error));
        }



    }

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`/api/getTasks?username=${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {

                    setTasks(data);
                    tasksToSend(data);

                })
                .catch(error => console.error("Error fetching tasks:", error));
        }, 500);

        return () => clearInterval(interval);
    }, [username, token]);

    const handleDeleteTask = (currentId) => {
        fetch(`/api/deleteTask/${currentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setTasks(data)
                resetForm();
                handleCloseDialog();
            })
            .catch(error => console.error("Error deleting task:", error));
    };

    const addTask = () => {
        const borderColor = '#61DE2A'
        const taskData = {
            title: title,
            description: description,
            start: combineDateAndTime(startDate, startTime),
            end: startDate,
            name: username,
            timesToRepeat: timesToRepeat,
            isRecurring: isRecurring,
            allDay: allDay,
            color: taskColor,
            isTask: true,
            completed: completed,
            borderColor: allDay ? borderColor : taskColor,
            isLate: false
        };

        if (isRecurring) {
            taskData.startRecur = startDate;
            taskData.start = startDate;
            if (timesToRepeat > 0) {
                taskData.timesToRepeat = timesToRepeat;
                taskData.endRecur = calculateRepeatEndDate(startDate, timesToRepeat);
                taskData.daysOfWeek = getDayOfWeek(startDate);
            }
        }

        if (isLate) {
            taskData.start = new Date();
            taskData.end = new Date();
        }

        if (modifying) {
            fetch(`/api/modifyTask/${currentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskData),
            })
                .then(response => response.json())
                .then(data => {

                    setTasks(data);
                    resetForm();
                    handleCloseDialog();
                })

        } else {
            fetch(`/api/addTask`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            })
                .then(response => response.json())
                .then(data => {
                    setTasks(data);
                    resetForm();
                    handleCloseDialog();
                })
                .catch(error => console.error("Error saving task:", error));
        }
    };

    const modifyTask = (task) => {
        if (task.completed) {
            setCompleted(true);
        } else {
            setCompleted(false);
        }
        if (task.isRecurring) {
            setIsRecurring(true);
            if (task.recurringDays) {
                setRecurringDays(convertIntegersToDays(task.recurringDays));
            }
        } else {
            setIsRecurring(false);
        }

        setCurrentId(task._id);
        setAllDay(task.allDay);

        if (!task.allDay) {
            if (task.start === null) {
                setStartTime('');
            } else {
                const startDate = new Date(task.start);
                setStartTime(timeToUsable(startDate.getHours(), startDate.getMinutes()));
            }
        }

        setTitle(task.title);
        setDescription(task.description);

        if (task.start !== null) {
            const startDate = new Date(task.start);
            setStartDate(dateToUsable(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
        } else {
            setStartDate('');
        }

        if (task.timesToRepeat !== null) {
            setTimesToRepeat(task.timesToRepeat);
        } else {
            setTimesToRepeat(0);
        }
        if (task.color) {
            setTaskColor(task.color);

        } else {
            setTaskColor('#000000');
        }
        setModifying(true);

        setOpenDialog(true);

    };

    const draggedTasks = (task) => {

        if (task.completed) {
            setCompleted(true);
        } else {
            setCompleted(false);
        }

        setCurrentId(task._id);

        if (task.isRecurring) {
            setIsRecurring(true);
            // if task is recurring then I might have clicked on a "fake" task renderized by fullcalendar, so I need to check
            // the task.id and get the actual task from the database.
            fetch(`/api/getSingleTask/${currentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {

                    task = data;

                })
                .catch(error => console.error('Error fetching task:', error));
        }
        setAllDay(task.allDay);
        if (!task.allDay) {
            // mi serve timeToUsable perche getHours() e getMinutes() mi ritornano tipo 2 se e' sono le 02:00, invece mi serve 02
            if (task.start === null) {
                setStartTime('');
            } else {

                setStartTime(timeToUsable(task.start.getHours(), task.start.getMinutes()));
            }
        }
        setTitle(task.title);
        setDescription(task.description);
        // mi serve dateToUsable perche getMonth() mi ritorna 1 se e' gennaio, invece mi serve 01
        if (task.start !== null) {
            setStartDate(dateToUsable(task.start.getFullYear(), task.start.getMonth(), task.start.getDate()));
        } else {
            setStartDate(null)
        }
        if (task.timesToRepeat !== null) {
            setTimesToRepeat(task.timesToRepeat);
        }
        setTaskColor(task.backgroundColor);
        setModifying(true);
        handleDraggedOpen();

    }


    function formatDate(date) {
        const year = date.getFullYear(); // Gets the full year (4 digits)
        const month = date.getMonth() + 1; // getMonth() is 0-based, add 1 to make it 1-based
        const day = date.getDate(); // Gets the day of the month

        // Function to add leading zero if necessary
        const pad = (n) => n < 10 ? '0' + n : n;

        // Format the date string
        return `${year}-${pad(month)}-${pad(day)}`;
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

        let [year, month, day] = date.split('-').map(num => parseInt(num, 10));
        if (time !== '') {
            let [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
            return date = new Date(year, month - 1, day, hours, minutes);
        } else {
            return date = new Date(year, month - 1, day);
        }

    }

    const handleOpenDialog = (task) => {
        resetForm();
        if (taskDate) {
            setStartDate(taskDate);
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
        setTaskColor('#000000');
        setIsRecurring(false);
        setTimesToRepeat(0);
        setAllDay(false);
        setCurrentId(null);
        setModifying(false);
        setCompleted(false);
        setIsLate(false);
    }

    const handleAddTask = () => {
        addTask();
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
        // Check if tasks is an array and handle accordingly
        if (Array.isArray(tasks)) {
            const newTasks = tasks.map(task => {
                if (task._id === id) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            });
            setTasks(newTasks);
        } else if (tasks && tasks._id === id) {
            // Handle the case where tasks is a single task object
            setTasks({ ...tasks, completed: !tasks.completed });
        }
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
                        <Typography> Are you sure you want to modify this task?</Typography>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDraggedClose}>Cancel</Button>
                    <Button
                        onClick={() => {
                            addTask();
                            handleDraggedClose();
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{currentId ? "Edit Task" : "Add Task"}</DialogTitle>
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
                        <Typography color="error">Please insert a Title for your task.</Typography>
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
                        <Typography color="error">Please insert a Date for your task.</Typography>
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
                        value={taskColor}
                        onChange={(e) => setTaskColor(e.target.value)}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Recurring Task"
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
                        label="All Day Task"
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
                    {modifying && <Button onClick={() => handleDeleteTask(currentId)}>Delete</Button>}
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={

                        handleAddTask
                    } color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>

    );
};

export default Tasks;
