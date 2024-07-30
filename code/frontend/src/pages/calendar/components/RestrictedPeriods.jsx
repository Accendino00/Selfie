import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import Cookies from 'js-cookie';

const RestrictedPeriods = ({ restrictedPeriods, setRestrictedPeriods, username }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [restrictedStart, setRestrictedStart] = useState('');
  const [restrictedEnd, setRestrictedEnd] = useState('');
  const [validationError, setValidationError] = useState('');
  const token = Cookies.get('token');

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddRestrictedPeriod = () => {
    if (restrictedStart && restrictedEnd) {
      const newPeriod = { start: new Date(restrictedStart), end: new Date(restrictedEnd) };
      fetch('/api/restrictedPeriods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(
          { ...newPeriod, username }
        )
      })
        .then(response => response.json())
        .then(data => {
          setRestrictedPeriods([...restrictedPeriods, data]);
          setRestrictedStart('');
          setRestrictedEnd('');
          setValidationError('');
          handleCloseDialog();
        })
        .catch(error => console.error('Error adding restricted period:', error));
    } else {
      setValidationError('Please enter both start and end dates for the restricted period.');
    }
  };

  const handleDeleteRestrictedPeriod = (id) => {
    fetch(`/api/restrictedPeriods/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setRestrictedPeriods(restrictedPeriods.filter(period => period._id !== id));
      })
      .catch(error => console.error('Error deleting restricted period:', error));
  };

  return (
    <Box sx={{
      paddingLeft: "20px",
      paddingRight: "20px",
      paddingBottom: "20px",
    }}>
      <Button color="primary" onClick={handleOpenDialog}>
        Add Restricted Period
      </Button>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Restricted Period</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Restricted Start Date"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            value={restrictedStart}
            onChange={(e) => setRestrictedStart(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Restricted End Date"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            value={restrictedEnd}
            onChange={(e) => setRestrictedEnd(e.target.value)}
          />
          {validationError && <Typography color="error">{validationError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleAddRestrictedPeriod} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
      <Typography variant="body1">Restricted Periods:</Typography>
      <ul>
        {restrictedPeriods.length >= 1 ? restrictedPeriods.map((period) => (
          <li key={period._id}>
            {new Date(period.start).toDateString()} - {new Date(period.end).toDateString()}
            <Button onClick={() => handleDeleteRestrictedPeriod(period._id)}>Delete</Button>
          </li>
        )) :
          <li style={{
            color: "gray",
            fontStyle: "italic",
          }}>No restricted periods</li>
        }
      </ul>
    </Box>
  );
};

export default RestrictedPeriods;
