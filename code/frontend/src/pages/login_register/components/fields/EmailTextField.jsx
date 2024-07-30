import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import styles from '../LoginStyles';
import EmailIcon from '@mui/icons-material/Email';

export default function EmailTextField({ email, setEmail, error, setError }) {
    const validateEmail = (email) => {
        // This regex pattern allows any valid email address
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setError(!validateEmail(value));
    };

    return (
        <TextField
            sx={styles.usernameTextField}
            variant="filled"
            label="Email"
            error={error}
            helperText={error ? 'Please enter a valid email address' : ''}
            value={email}
            type="email"
            autoComplete='email'
            name="email"
            onChange={handleChange}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <EmailIcon sx={{ color: "#7d5ffc" }} />
                    </InputAdornment>
                ),
            }}
        />
    );
};
