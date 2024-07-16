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
      return <Typography variant="body2" color="text.secondary" align="center">No events found.</Typography>;
    }
    else {
      return events.slice(0, 3).map((event, index) => (
        <Typography key={index} variant="body2" color="text.secondary" align="center">
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
            padding: '20px',
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
              borderRadius: '10px',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>

        <Grid container spacing={7} sx={{ position: 'relative', zIndex: 1, alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: '#ffffff' }}>
              <CardActionArea onClick={() => navigate('/calendar/')}>
                <CardContent>
                  <Typography variant="h5" component="div" align="center">
                    Calendar
                  </Typography>
                  {renderEvents(events)}
                  <Typography variant="body2" color="text.secondary" align="center">
                    View and manage your calendar events.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: '#ffffff' }}>
              <CardActionArea onClick={() => navigate('/timer/')}>
                <CardContent>
                  <Typography variant="h5" component="div" align="center">
                    Timer
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Set and manage timers for various tasks.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: '#ffffff' }}>
              <CardActionArea onClick={() => navigate('/notes/')}>
                <CardContent>
                  <Typography variant="h5" component="div" align="center">
                    Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
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
