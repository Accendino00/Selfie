import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import styles from '../LoginStyles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { IconButton } from '@mui/material';

export default function BirthdateTextField({birthdate, setBirthdate}) {
    return (
        <TextField
            sx={styles.birthdateTextField}
            variant="filled"
            value = {birthdate}
            onChange = {(e) => setBirthdate(e.target.value)}
            type="date"
            autoComplete='off'
            name="birthdate"
            label="Birthdate"
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton>
                            <CalendarTodayIcon style={{ color: '#7d5ffc' }} />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};