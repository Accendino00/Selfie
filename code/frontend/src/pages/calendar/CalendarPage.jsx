import React, { useState } from 'react';
import Calendar from './Calendar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const CalendarPage = () => {
  const [create, setCreate] = useState(false);
  const [openCalendars, setOpenCalendars] = useState(false);
  
  const toggleCalendars = () => {
    setOpenCalendars(!openCalendars);
  };


  // Mock data for calendars
  const calendars = [
    { id: 1, name: 'Personal' },
    { id: 2, name: 'Work' },
    { id: 3, name: 'Holidays' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
          <ListItem disablePadding>
              <ListItemButton onMouseDown={()=>setCreate(true)} onMouseUp={()=>setCreate(false)} onMouseLeave={() => setCreate(false)}>
                <ListItemText primary="Create" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={toggleCalendars}>
                <ListItemText primary="My Calendars" />
              </ListItemButton>
            </ListItem>
            <Collapse in={openCalendars} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {calendars.map((calendar) => (
                  <ListItem key={calendar.id} sx={{ pl: 4 }}>
                    <FormControlLabel
                      control={<Checkbox />}
                      label={calendar.name}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Calendar createButton={create} />
      </Box>
    </Box>
  );
};

export default CalendarPage;
