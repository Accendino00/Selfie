import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Cookies from 'js-cookie';

function EmailShare({ feature, open, setOpen, email, setEmail }) {
    const token = Cookies.get('token');
  const [permissions, setPermissions] = useState({
    viewOnly: false,
    viewAndEdit: false,
  });

  const handleClose = () => {
    setOpen(false);
  };

  const handleSendEmail = () => {
    // Ensure the URL matches the server's configured endpoint
    fetch('/api/sendInvitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: email, // The email address to which the invitation is sent
        feature: feature, // The feature for which the invitation is being sent
        permissions: permissions, // Permissions object containing viewOnly and viewAndEdit
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      handleClose(); // Close the dialog after successful operation
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };
  

  const handleCheckboxChange = (event) => {
    setPermissions({ ...permissions, [event.target.name]: event.target.checked });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Condividi per e-mail</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {feature === 'notes' && (
            <>
              <FormControlLabel
                control={<Checkbox checked={permissions.viewOnly} onChange={handleCheckboxChange} name="viewOnly" />}
                label="Visualize only"
              />
              <FormControlLabel
                control={<Checkbox checked={permissions.viewAndEdit} onChange={handleCheckboxChange} name="viewAndEdit" />}
                label="Visualize and edit"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSendEmail}>Send Email</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EmailShare;
