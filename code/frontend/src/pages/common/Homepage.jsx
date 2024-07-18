import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import useTokenChecker from '../../utils/useTokenChecker.jsx';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import CircularProgress from '@mui/material/CircularProgress';

const HomePage = () => {
  const navigate = useNavigate();
  const { loginStatus, isTokenLoading, username } = useTokenChecker();
  const token = Cookies.get('token');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!isTokenLoading) {
      if (!loginStatus) {
        navigate("/login");
      }
    }
  }, [loginStatus, isTokenLoading]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/getEventsGeneric?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setEvents(data);

      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [events, token, username]);


  function getNextYear() {
    const currentDate = new Date();
    const nextYear = currentDate.getFullYear() + 1;
    return nextYear;
  };
  
  function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
    let day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function stringToDate(dateString) {
    let [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date
  }

  function calculateAllRecurrencies(event, finalDate) {
    const recurrencies = [];
    let nextStartDate = new Date(event.start);
    let nextEndDate = null;
    if (event.end) {
      nextEndDate = new Date(event.end);
    }
    // We'll use this to control the recurrence loop


    while (nextStartDate.getFullYear() <= finalDate) {
      let startDate = formatDate(nextStartDate)
      let endDate = nextEndDate ? formatDate(nextEndDate) : null



      const newEvent = {
        title: event.title,
        description: event.description,
        color: event.color,
        allDay: event.allDay,
        start: startDate,
        end: endDate,
        calendar: event.calendar,
        name: event.name,
        location: event.location,
        invitedUsers: event.invitedUsers,
        shared: event.shared,
        isRecurring: event.isRecurring
      };

      recurrencies.push(newEvent);

      // Increment the date by 1 week
      nextStartDate.setDate(nextStartDate.getDate() + 7);
      if (nextEndDate) {
        nextEndDate.setDate(nextEndDate.getDate() + 7);
      }
    }

    return recurrencies
  }

  function getFirstUsefulDate(event) {
    const recurrencies = calculateAllRecurrencies(event, getNextYear())
    const currentDate = new Date()
    return recurrencies.filter(event => stringToDate(event.start) > currentDate)
      .sort((a, b) => stringToDate(a.start) - stringToDate(b.start))[0] || null;

  }

  function recurrenceMath(event) {
    const currentDate = new Date()

    if (event.isRecurring) {
      if (!event && event.end < currentDate) return null
      else {
        return getFirstUsefulDate(event)
      }
    }

  }

  const isNotifiable = (event) => {
    const eventEndDate = new Date(event.end);
    const eventStartDate = new Date(event.start);
    const currentDate = new Date();
    return eventStartDate > currentDate || recurrenceMath(event);
  };

  const renderEvents = (events) => {
    if (!events || events.length === 0) {
      return <Typography variant="body2" color="#ffffff5f" align="center">No events found.</Typography>;
    }
    else {
      // Filter events to only those that are notifiable
      const notifiableEvents = events.filter(isNotifiable);

      // Check if there are any notifiable events left after filtering
      if (notifiableEvents.length === 0) {
        return <Typography variant="body2" color="#ffffff5f" align="center">No current events.</Typography>;
      }

      // Display up to 3 notifiable events
      return notifiableEvents.slice(0, 3).map((event, index) => (
        <Typography key={index} variant="body2" color="#ffffffbf" align="center" bgcolor={event.color}>
          {event.title} - {new Date(event.start).toLocaleDateString()} to {new Date(event.end).toLocaleDateString()}
        </Typography>
      ));
    }
  };

  if (isTokenLoading || loginStatus === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (loginStatus) {
    return (

      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 40, 0.5)',
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 30, 0.99)',
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
        >
          <img
            src="../../../public/home.jpg"
            alt="background"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <Typography variant="h5" component="div" align="center" sx={{
          fontSize: "85px",
          background: "-webkit-linear-gradient(45deg, #60fff8, #bc6aff 80%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "Roboto, Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif",
          fontWeight: "800",
          filter: "brightness(1.5)",
          marginTop: "30px",
          textShadow: "0 0 9px #ffffffba"
        }}  >
          Selfie
        </Typography>
        <Grid container spacing={7} sx={{ position: 'relative', zIndex: 1, alignItems: 'center', justifyContent: 'center', height: '85vh', alignContent: "center" }}>

          <Grid item xs={10} md={3} >
            <Card variant="outlined" sx={{ backgroundColor: '#ffffff15', minHeight: "150px", display: "flex", align: "center", borderRadius: "24px", backdropFilter: "blur(10px)", boxShaodw: "0px 0px 10px 0px #00000006" }}>
              <CardActionArea onClick={() => navigate('/calendar/')}>
                <CardContent >
                  <Typography variant="h5" component="div" align="center" sx={{
                    fontSize: "45px",
                    background: "-webkit-linear-gradient(45deg, #333b96, #9f4f84 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Work Sans, Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif",
                    fontWeight: "800",
                    filter: "brightness(1.5)"
                  }}  >
                    Calendar
                  </Typography>
                  <Typography variant="body2" color="#ffffffdf" align="center">
                    View and manage your calendar events.
                  </Typography>
                  {renderEvents(events)}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={10} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: '#ffffff15', minHeight: "150px", display: "flex", align: "center", borderRadius: "24px", backdropFilter: "blur(10px)", boxShaodw: "0px 0px 10px 0px #00000006" }}>
              <CardActionArea onClick={() => navigate('/timer/')}>
                <CardContent>
                  <Typography variant="h5" component="div" align="center" sx={{
                    fontSize: "45px",
                    background: "-webkit-linear-gradient(165deg, #eed06a, #9f4f84 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Work Sans, Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif",
                    fontWeight: "800",
                    filter: "brightness(1.5)"
                  }}>
                    Pomodoro
                  </Typography>
                  <Typography variant="body2" color="#ffffffdf" align="center">
                    Manage your time using the Pomodoro technique.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={10} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: '#ffffff15', minHeight: "150px", display: "flex", align: "center", borderRadius: "24px", backdropFilter: "blur(10px)", boxShaodw: "0px 0px 10px 0px #00000006" }}>
              <CardActionArea onClick={() => navigate('/notes/')}>
                <CardContent>
                  <Typography variant="h5" component="div" align="center" sx={{
                    fontSize: "45px",
                    background: "-webkit-linear-gradient(45deg, #0b1439, #4a8dda 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Work Sans, Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif",
                    fontWeight: "800",
                    filter: "brightness(1.5)"
                  }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" color="#ffffffdf" align="center">
                    Create and organize your notes.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box >
    );
  }
};

export default HomePage;
