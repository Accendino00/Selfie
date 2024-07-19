import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import useTokenChecker from '../../utils/useTokenChecker';
import cookies from 'js-cookie';

const Tasks = () => {
    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const [tasks, setTasks] = useState([]);
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
    const token = cookies.get('token');


    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`/api/getTasks?username=${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => setTasks(data))
                .catch(error => console.error("Error fetching tasks:", error));
        }, 500);

        return () => clearInterval(interval);
    }, [username, token]);

    const handleDeleteTask = (id) => {
        fetch(`/api/deleteTask/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setTasks(data)
            })
            .catch(error => console.error("Error deleting task:", error));
    };

    const addTask = () => {
        console.log('Adding task:', title, description, startDate, startTime, taskColor, isRecurring, timesToRepeat, allDay);
        const taskData = {
            title: title,
            description: description,
            start: combineDateAndTime(startDate, startTime),
            end: startDate,
            name: username,
            timesToRepeat: timesToRepeat,
            isRecurring: isRecurring,
            allDay: allDay,
            color: taskColor
        };

        if (modifying) {
            console.log(taskData);
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
        setOpenDialog(true);  // Assuming handleOpen sets the dialog to open
    };

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
    }

    const handleAddTask = () => {
        resetForm();
        addTask();
    }


    return (
        <Box>
            <Typography variant="h4" gutterBottom>Tasks</Typography>
            <List>
                {Array.isArray(tasks) && tasks.map(task => (
                    <ListItem key={task._id} alignItems="flex-start">
                        <div style={{
                            width: '10px',     
                            height: '10px',    
                            backgroundColor: task.color,  
                            marginRight: '10px',
                            marginTop: '13px',	
                        }} />
                        <ListItemText
                            primary={task.title}
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
                        <IconButton edge="end" aria-label="edit" onClick={() => modifyTask(task)}>
                            <Edit />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task._id)}>
                            <Delete />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                Add Task
            </Button>
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
                        <Typography color="error">Please insert a Title for your event.</Typography>
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
                        <Typography color="error">Please insert a Date for your event.</Typography>
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
                </DialogContent>
                <DialogActions>
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
