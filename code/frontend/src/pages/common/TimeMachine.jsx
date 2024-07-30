import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { TextField, Button, Box, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import { format } from 'date-fns';
import { setBaseDate } from './overrideDate'; // import the method to set the base date

const TimeMachine = ({ onDateChange, setSeed, originalDate, setShowTimeMachine, setSeedTwo }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const boxRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dragHandleRef = useRef(null);

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
    onDateChange(newDate);
    setBaseDate(newDate); // Update the base date in the CustomDate
    setSeed((prev) => prev + 1);
    setSeedTwo((prev) => prev + 1);
  };

  const resetToSystemTime = () => {
    const systemDate = originalDate;
    setCurrentDate(systemDate);
    onDateChange(systemDate);
    setBaseDate(systemDate);
    setSeed((prev) => prev + 1);
  };

  const handleClose = () => {
    setShowTimeMachine(false);
  };

  const boxStyles = {
    padding: 2,
    border: '2px solid',
    borderColor: 'primary.main',
    backgroundColor: 'background.paper',
    position: 'absolute',
    zIndex: 1000,
    width: isMobile ? 175 : 250, // Smaller width for mobile devices
  };

  return (
    <Draggable
      cancel="input, textarea, button, select, option, [role='button'], .cancel-drag"
      nodeRef={dragHandleRef}  // Attach the ref here
    >
      <Box ref={dragHandleRef} sx={boxStyles}>  {/* Use the ref on your Box component */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="primary">Time Machine</Typography>
          <IconButton size="small" onClick={handleClose} className="cancel-drag">
            <MinimizeIcon fontSize="small" />
          </IconButton>
        </Box>
        <TextField
          label="Date"
          type="date"
          name="date"
          value={format(currentDate, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          fullWidth
          margin="normal"
          className="cancel-drag"
        />
        <TextField
          label="Time"
          type="time"
          name="time"
          value={format(currentDate, 'HH:mm')}
          onChange={handleDateChange}
          fullWidth
          margin="normal"
          className="cancel-drag"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={resetToSystemTime}
          fullWidth
          sx={{ mt: 2 }}
          className="cancel-drag"
        >
          Reset to System Time
        </Button>
      </Box>
    </Draggable>

  );
};

export default TimeMachine;
