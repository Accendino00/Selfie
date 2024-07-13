import React from 'react';
import { Paper, Button, Container } from '@mui/material';
import styles from './FinishedStudyingStyles.jsx';

function FinishedStudying() {
    return (
        <Container sx={styles.container}>
            <Paper elevation={3} sx={styles.paper}>
                <Container sx={styles.text}>
                    Hai finito di studiare!
                </Container>
            </Paper>
        </Container>
    );
}

export default FinishedStudying;