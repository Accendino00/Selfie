import React, { useState, useEffect } from 'react';
import { Container, TextField, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function TimeInput({ totalSeconds, onTimeChange }) {
  const [hours, setHours] = useState(Math.floor(totalSeconds / 3600));
  const [minutes, setMinutes] = useState(Math.floor((totalSeconds % 3600) / 60));
  const [seconds, setSeconds] = useState(totalSeconds % 60);

  useEffect(() => {
    // Assicuriamo che il valore passato non sia NaN e sia un numero valido
    if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
      onTimeChange(hours * 3600 + minutes * 60 + seconds);
    }
  }, [hours, minutes, seconds, onTimeChange]);

  const handleInputChange = (value, type) => {
    // Convertiamo l'input in numero, garantendo che sia un valore valido o zero
    let numericValue = parseInt(value, 10) || 0;
    if (type === 'hours') {
      setHours(numericValue);
    } else if (type === 'minutes') {
      setMinutes(numericValue % 60);
    } else if (type === 'seconds') {
      setSeconds(numericValue % 60);
    }
  };

  const increment = (type) => {
    handleInputChange((type === 'hours' ? hours + 1 : type === 'minutes' ? minutes + 1 : seconds + 1), type);
  };

  const decrement = (type) => {
    handleInputChange((type === 'hours' ? hours - 1 : type === 'minutes' ? minutes - 1 : seconds - 1), type);
  };

  return (
    <Container sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 2 }}>
      {['hours', 'minutes', 'seconds'].map((type) => (
        <Container key={type} sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <IconButton onClick={() => increment(type)}><AddCircleOutlineIcon /></IconButton>
          <TextField
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            type="number"
            value={type === 'hours' ? hours : type === 'minutes' ? minutes : seconds}
            onChange={(e) => handleInputChange(e.target.value, type)}
            variant="outlined"
            size="small"
            sx={{ width: '80px' }}
          />
          <IconButton onClick={() => decrement(type)}><RemoveCircleOutlineIcon /></IconButton>
        </Container>
      ))}
    </Container>
  );
}

export default TimeInput;
