import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import styles from '../LoginStyles';
import AccountCircle from '@mui/icons-material/AccountCircle';

export default function TruenameTextField({truename, setTruename}) {
    return (
        <TextField
            sx = {styles.truenameTextField}
            variant="filled"
            label="Truename"
            value={truename}
            onChange={(e) => setTruename(e.target.value)}
            type="text"
            autoComplete='truename'
            name="truename"
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <AccountCircle sx={{color:'#7d5ffc'}} />
                    </InputAdornment>
                    ),
              }}
        />
    );
};