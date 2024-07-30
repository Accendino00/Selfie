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
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import StudyEvent from './StudyEvents.jsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Datebook from './Datebook';
import RestrictedPeriods from './components/RestrictedPeriods.jsx';
import Calparser from './Calparser'

const CalendarPage = () => {
  const navigate = useNavigate();
  const [create, setCreate] = useState(false);
  const [openCalendars, setOpenCalendars] = useState(true);
  const [calendars, setCalendars] = useState([]);
  const [chosenCalendars, setChosenCalendars] = useState([]);
  const [createCalendarButton, setCreateCalendarButton] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [openInvitedEvents, setOpenInvitedEvents] = useState(false);
  const [invitedEvents, setInvitedEvents] = useState([]);
  const [invitedEventsData, setInvitedEventsData] = useState([]);
  const [selectedInvitedEvents, setSelectedInvitedEvents] = useState([]);
  const token = Cookies.get('token');
  const { loginStatus, isTokenLoading, username } = useTokenChecker();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkboxState, setCheckboxState] = useState({});
  const [studyEventCreate, setStudyEventCreate] = useState(false);
  const [taskCreate, setTaskCreate] = useState(false);
  const [events, setEvents] = useState([])
  const [restrictedPeriods, setRestrictedPeriods] = useState([]);


  useEffect(() => {
    if (!isTokenLoading) {
      if (!loginStatus) {
        navigate("/login");
      }
    }

  }, [loginStatus, isTokenLoading]);

  useEffect(() => {
    const fetchRestrictedPeriods = () => {
      fetch(`/api/restrictedPeriods?username=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          setRestrictedPeriods(data);
        })
        .catch(error => console.error('Error fetching restricted periods:', error));
    };

    // Fetch restricted periods initially and set up polling
    const intervalId = setInterval(fetchRestrictedPeriods, 1000);
    fetchRestrictedPeriods();

    // Cleanup: stop polling on component unmount
    return () => clearInterval(intervalId);
  }, [token, username]);


  useEffect(() => {
    // Imposta lo stato dei checkbox e i calendari scelti in base ai valori salvati in localStorage,
    // nel caso invece non ci siano valori salvati, imposta lo stato dei checkbox a tutti true e i calendari scelti a vuoti
    const savedCheckboxState = JSON.parse(localStorage.getItem('checkboxState')) || { shared: true, tasks: true, pomodoro: true };
    const savedChosenCalendars = JSON.parse(localStorage.getItem('chosenCalendars')) || [];

    setCheckboxState(savedCheckboxState);
    setChosenCalendars(savedChosenCalendars);
  }, []);



  useEffect(() => {
    const fetchCalendars = () => {
      fetch(`/api/getCalendars?userId=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {

          if (data.length === 0 && username) {
            createFirstCalendar();
          }
          setCalendars(data)
        })
        .catch(error => console.error('Error fetching calendars:', error));
    };

    // Start polling on component mount
    const intervalId = setInterval(fetchCalendars, 1000);
    if (username)
      fetchCalendars();

    // Cleanup: stop polling on component unmount
    return () => clearInterval(intervalId);
  }, [username]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/getEventsGeneric?calendars=&username=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {

          setEvents(data);
          //console.log(data)

        })
        .catch(error => {
          console.error("Error fetching events:", error)

        });
    }, 500);

    // Pulizia: interrompe il polling quando il componente viene smontato
    return () => clearInterval(interval);
  }, [token, username, events]);

  useEffect(() => {
    const fetchInvitedEvents = () => {
      fetch(`/api/getInvitedEvents?username=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          const invitedEvents = data.map(event => event.title);
          const invitedEventsData = data.map(event => event);
          setInvitedEvents(invitedEvents);
          setInvitedEventsData(invitedEventsData);
        })
        .catch(error => console.error('Error fetching invited events:', error));
    };

    // Start polling on component mount
    const intervalId = setInterval(fetchInvitedEvents, 1000);
    fetchInvitedEvents();
    // Cleanup: stop polling on component unmount
    return () => clearInterval(intervalId);
  }, [token, username]);


  const toggleCalendars = () => {
    setOpenCalendars(!openCalendars);
  };

  const toggleInvitedEvents = () => {
    setOpenInvitedEvents(!openInvitedEvents);
  };

  const createFirstCalendar = () => {
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
      body: JSON.stringify({ name: 'Base Calendar', user: username }),
    })

      .then(response => response.json())
      .then(data => {
        setCalendars([{
          id: data.id, name
            : 'Base Calendar'
        }]);
      })
      .catch(error => console.error('Error creating first calendar:', error));
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
          setCalendars(calendars.filter(calendar => calendar.id !== id)); // ??
        } else {
          console.error('Failed to delete calendar:', data.message);
        }
      })
      .catch(error => console.error('Error deleting calendar:', error));
  };

  const handleCheckboxChange = (calendarName) => {
    setCheckboxState((prevState) => {
      const newState = {
        ...prevState,
        [calendarName]: !prevState[calendarName],
      };
      // Save the updated checkbox state to local storage
      localStorage.setItem('checkboxState', JSON.stringify(newState));
      return newState;
    });

    setChosenCalendars(prevChosenCalendars => {
      let newChosenCalendars;
      if (prevChosenCalendars.includes(calendarName)) {
        // If the calendar is already chosen, remove it
        newChosenCalendars = prevChosenCalendars.filter(name => name !== calendarName);
      } else {
        // If the calendar is not chosen, add it
        newChosenCalendars = [...prevChosenCalendars, calendarName];
      }
      // Save the updated list of chosen calendars to local storage
      localStorage.setItem('chosenCalendars', JSON.stringify(newChosenCalendars));
      return newChosenCalendars;
    });
  };

  const handleCheckboxChangeEvents = (event) => {
    setCheckboxState((prevState) => ({
      ...prevState,
      [event]: !prevState[event],
    }));
    setSelectedInvitedEvents(prevSelectedInvitedEvents => {
      if (prevSelectedInvitedEvents.includes(event)) {
        // If the event is already chosen, remove it
        return prevSelectedInvitedEvents.filter(name => name !== event);
      } else {
        // If the event is not chosen, add it
        return [...prevSelectedInvitedEvents, event];
      }
    });
  }

  const acceptInvitedEvents = (selectedInvitedEvents) => {
    fetch(`/api/acceptInvitedEvents?username=${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ selectedInvitedEvents }),
    })
      .then(response => response.json())
      .then(data => {

        if (data) {
          setInvitedEvents(invitedEvents.filter(event => !selectedInvitedEvents.includes(event)));
          console.log('Invited events accepted:', data);
          setSelectedInvitedEvents([]);
        } else {
          console.error('Failed to accept invited events:', data.message);
        }
      })
      .catch(error => console.error('Error accepting invited events:', error));
  };

  const declineInvitedEvents = (event) => {
    fetch(`/api/declineInvitedEvents?username=${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ event }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setInvitedEvents(invitedEvents.filter(event => event._id !== event.title));
        } else {
          console.error('Failed to decline event:', data.message);
        }
      })
      .catch(error => console.error('Error declining event:', error));
  }


  if (isTokenLoading || loginStatus === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (loginStatus) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)', width: '100%', overflow: 'hidden', backgroundColor: '#111119' }}>
        <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
          <IconButton
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              backgroundColor: '#7d5ffc',
              color: 'white',
              '&:hover': {
                backgroundColor: '#53ddf0',
              },
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              width: 250,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 250,
                boxSizing: 'border-box',
                backgroundColor: '#111119',
                color: 'white',
              },
            }}
          >
            <List sx={{
              height: '100vh',

            }}>
              <ListItem disablePadding >
                <ListItemButton onMouseDown={() => setCreateCalendarButton(true)} onMouseUp={() => setCreate(false)} onMouseLeave={() => setCreate(false)}>
                  <ListItemText primary="Create Calendar" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onMouseDown={() => setCreate(true)} onMouseUp={() => setCreate(false)} onMouseLeave={() => setCreate(false)}>
                  <ListItemText primary="Create Event" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onMouseDown={() => setStudyEventCreate(true)}
                  onMouseUp={() => setStudyEventCreate(false)}
                  onMouseLeave={() => setStudyEventCreate(false)}>

                  <ListItemText primary="Create Study Event" />

                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onMouseDown={() => setTaskCreate(true)}
                  onMouseUp={() => setTaskCreate(false)}
                  onMouseLeave={() => setTaskCreate(false)}>

                  <ListItemText primary="Create Task" />

                </ListItemButton>

              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={toggleCalendars}>
                  <ListItemText primary="My Calendars" />
                  {openCalendars ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
              </ListItem>
              <Collapse in={openCalendars} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem key="shared" sx={{ pl: 4, justifyContent: "space-between" }}>
                    <FormControlLabel
                      control={<Checkbox checked={checkboxState['shared'] || false} onChange={() => handleCheckboxChange('shared')} />}
                      label="Shared Events"
                    />
                    <Button onClick={() => alert('Shared calendar cannot be deleted')} endIcon={<DeleteIcon />}>
                    </Button>
                  </ListItem>
                  <ListItem key="tasks" sx={{ pl: 4, justifyContent: "space-between" }}>
                    <FormControlLabel
                      control={<Checkbox checked={checkboxState['tasks'] || false} onChange={() => handleCheckboxChange('tasks')} />}
                      label="Tasks"
                    />
                    <Button onClick={() => alert('Tasks calendar cannot be deleted')} endIcon={<DeleteIcon />}>
                    </Button>
                  </ListItem>
                  <ListItem key="pomodoro" sx={{ pl: 4, justifyContent: "space-between" }}>
                    <FormControlLabel
                      control={<Checkbox checked={checkboxState['pomodoro'] || false} onChange={() => handleCheckboxChange('pomodoro')} />}
                      label="Pomodoro"
                    />
                    <Button onClick={() => alert('Pomodoro calendar cannot be deleted')} endIcon={<DeleteIcon />}>
                    </Button>
                  </ListItem>
                  {calendars.map((calendar) => (
                    <ListItem key={calendar._id} sx={{ pl: 4, justifyContent: "space-between" }}>
                      <FormControlLabel
                        control={<Checkbox checked={checkboxState[calendar.name] || false} onChange={() => handleCheckboxChange(calendar.name)} />}
                        label={calendar.name}
                      />
                      <Button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this calendar?')) {
                            deleteCalendar(calendar._id);
                          }
                        }}
                        endIcon={<DeleteIcon />}
                      >
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
              <hr style={{ height: "2px" }} />
              <ListItem disablePadding>
                <ListItemButton onClick={toggleInvitedEvents}>
                  <ListItemText primary="Invited Events" />
                  {openInvitedEvents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
              </ListItem>
              <Collapse in={openInvitedEvents} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {invitedEvents.map((event) => (
                    <ListItem key={event} sx={{ pl: 4 }}>
                      <FormControlLabel
                        control={<Checkbox checked={checkboxState[event] || false} onChange={() => handleCheckboxChangeEvents(event)} />}
                        label={event}
                      />
                      <Button onClick={() => declineInvitedEvents(event)} endIcon={<DeleteIcon />}>
                      </Button>
                    </ListItem>
                  ))}
                  <Button sx={{
                    float: "right",
                    marginRight: "20px",
                  }} onClick={() => acceptInvitedEvents(Object.keys(checkboxState).filter(key => checkboxState[key]))}>Accept</Button>
                </List>
              </Collapse>

              <hr style={{ height: "2px" }} />

              <ListItem sx={{ pl: 4 }}>
                <Datebook events={events} />
              </ListItem>

              <ListItem sx={{ pl: 4 }}>
                <Calparser />
              </ListItem>

              <hr style={{ height: "2px" }} />

              <RestrictedPeriods restrictedPeriods={restrictedPeriods} setRestrictedPeriods={setRestrictedPeriods} username={username} />
            </List>

          </Drawer>

          {/* Calendario */}
          <Box sx={{ width: '100%', marginTop: '4vh' }}>
            <Calendar createButton={create} chosenCalendars={Object.keys(checkboxState).filter(key => checkboxState[key])} calendars={calendars} studyEventCreateButton={studyEventCreate} taskCreateButton={taskCreate} />
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
  } else {
    <> </>;
  }
};

export default CalendarPage;