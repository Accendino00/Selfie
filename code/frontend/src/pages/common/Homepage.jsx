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

  const renderEvents = (events) => {
    if (!events || events.length === 0) {
      return <Typography variant="body2" color="#ffffff5f" align="center">No events found.</Typography>;
    }
    else {
      return events.slice(0, 3).map((event, index) => (
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
