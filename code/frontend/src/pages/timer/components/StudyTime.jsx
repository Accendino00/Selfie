import React, { useState } from 'react';
import { TextField, Container, Button } from '@mui/material'; // Aggiunta di Button qui
import styles from './StudyTimeStyles.jsx';

function StudyTime({ remainingTime, updateStudyTime }) {
    const [editMode, setEditMode] = useState(!remainingTime);

    const handleInputChange = (event) => {
        updateStudyTime(event.target.value * 60); // Converti i minuti in secondi
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
                    <TextField
                        label="Minuti"
                        variant="outlined"
                        onChange={handleInputChange}
                    />
                </>
            ) : (
                <>
                    <p>Tempo di studio rimanente: {Math.floor(remainingTime / 60)} minuti</p>
                    <Button onClick={handleUpdateClick}>Aggiorna</Button>
                </>
            )}
        </Container>
    );
}

export default StudyTime;
