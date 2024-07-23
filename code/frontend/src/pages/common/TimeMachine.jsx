import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { TextField, Button, Box, Typography } from '@mui/material';
import { format } from 'date-fns';

const TimeMachine = ({ onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    const newDate = new Date(currentDate);
    if (name === 'date') {
      const [year, month, day] = value.split('-').map(num => parseInt(num));
      newDate.setFullYear(year, month - 1, day);
    } else if (name === 'time') {
      const [hours, minutes] = value.split(':').map(num => parseInt(num));
      newDate.setHours(hours, minutes);
    }
    setCurrentDate(newDate);
    onDateChange(newDate); // Assicurati che questa riga chiami la funzione di callback correttamente.
  };

  const resetToSystemTime = () => {
    const systemTime = new Date();
    setCurrentDate(systemTime);
    onDateChange(systemTime); // Invoca il callback quando si reimposta l'orologio.
  };

  return (
    <Draggable>
      <Box
        sx={{
          padding: 2,
          border: '2px solid',
          borderColor: 'primary.main',
          backgroundColor: 'background.paper',
          position: 'absolute', // Usa 'absolute' per abilitare il drag
          zIndex: 1000,
          width: 300
        }}
      >
        <Typography variant="h6" color="primary">Time Machine</Typography>
        <TextField
          label="Date"
          type="date"
          name="date"
          value={format(currentDate, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Time"
          type="time"
          name="time"
          value={format(currentDate, 'HH:mm')}
          onChange={handleDateChange}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={resetToSystemTime}
          fullWidth
          sx={{ mt: 2 }}
        >
          Reset to System Time
        </Button>
      </Box>
    </Draggable>
  );
};

export default TimeMachine;
