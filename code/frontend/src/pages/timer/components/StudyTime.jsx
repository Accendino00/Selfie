import React, { useState } from 'react';
import { Container, Button } from '@mui/material';
import styles from './StudyTimeStyles.jsx';
import TimeInput from './TimeInput'; // Assicurati che il percorso sia corretto

function StudyTime({ remainingTime, updateStudyTime }) {
    const [editMode, setEditMode] = useState(!remainingTime);

    const handleButtonClick = () => {
        setEditMode(false);
    };

    const handleUpdateClick = () => {
        setEditMode(true);
    };

    return (
        <Container sx={styles.container}>
            {editMode ? (
                <>
                    <p>Imposta il tuo tempo di studio</p>
                    <TimeInput totalSeconds={remainingTime} onTimeChange={updateStudyTime} />
                    <Button onClick={handleButtonClick}>Conferma</Button>
                </>
            ) : (
                <>
                    <p>Tempo di studio rimanente: {Math.floor(remainingTime / 3600)} ore, {Math.floor((remainingTime % 3600) / 60)} minuti, {remainingTime % 60} secondi</p>
                    <Button onClick={handleUpdateClick}>Aggiorna</Button>
                </>
            )}
        </Container>
    );
}

export default StudyTime;
