import React from 'react';
import { useState } from 'react';
import { IconButton } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import EmailShare from './EmailShare';

const EmailShareButton = ({ feature, email, setEmail }) => {
    const [open, setOpen] = useState(false);
  
    return (
      <>
        <IconButton 
            onClick={() => setOpen(true)}
            color="inherit"
        >
            <ShareIcon sx={{height:'0.88em'}}/>
        </IconButton>
        <EmailShare feature={feature} open={open} setOpen={setOpen} email={email} setEmail={setEmail}/>
      </>
    );
  };
  

export default EmailShareButton;