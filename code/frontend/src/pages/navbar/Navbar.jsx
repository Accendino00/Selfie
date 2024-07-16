import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotesIcon from '@mui/icons-material/Notes';
import TimerIcon from '@mui/icons-material/Timer';
import { useNavigate } from 'react-router-dom';
import useTokenChecker from '../../utils/useTokenChecker';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Navbar = () => {
  const navigate = useNavigate();
  const { loginStatus, isTokenLoading, username } = useTokenChecker();

  React.useEffect(() => {
    if (!isTokenLoading) {
      if (!loginStatus) {
        navigate("/login");
      }
    }
  }, [loginStatus, isTokenLoading]);

  if (isTokenLoading || loginStatus === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (loginStatus) {
    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="calendar"
            onClick={() => navigate('/calendar/')}
          >
            <CalendarTodayIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="notes"
            onClick={() => navigate('/notes/')}
          >
            <NotesIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="timer"
            onClick={() => navigate('/timer/')}
          >
            <TimerIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  } else {
    <></>;
  }
};

export default Navbar;
