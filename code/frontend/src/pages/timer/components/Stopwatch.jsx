import React from 'react';
import { Paper, Button, Container } from '@mui/material';
import styles from './StopwatchStyles.jsx'; // Assicurati di adattare il percorso e il nome del file di stile come necessario

function Stopwatch() {
    const [time, setTime] = React.useState(0);
    const [isActive, setIsActive] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);
    const [intervalId, setIntervalId] = React.useState(null);

    // Aggiorna il timer basandoti sul tempo trascorso, anziché incrementare i secondi
    React.useEffect(() => {
        if (isActive && !isPaused) {
            const startTime = Date.now() - time;
            const id = setInterval(() => {
                setTime(Date.now() - startTime);
            }, 1000);
            setIntervalId(id);
        } else if (!isActive) {
            clearInterval(intervalId);
        }
        return () => clearInterval(intervalId);
    }, [isActive, isPaused]);

    const toggle = () => {
        setIsActive(!isActive);
        setIsPaused(!isActive ? false : !isPaused);
    };

    const reset = () => {
        setTime(0);
        setIsActive(false);
        setIsPaused(false);
        clearInterval(intervalId);
    };

    // Converti il tempo in ore, minuti e secondi
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    return (
        <Container sx={styles.container}>
            <Paper elevation={3} sx={styles.paper}>
                <Container sx={styles.time}>
                    {hours < 10 ? '0' + hours : hours}:{minutes < 10 ? '0' + minutes : minutes}:{seconds < 10 ? '0' + seconds : seconds}
                </Container>
                <Container sx={styles.buttongroup}>
                    <Button sx={styles.startbutton} onClick={toggle}>
                        {isActive ? (isPaused ? 'Resume' : 'Pause') : 'Start'}
                    </Button>
                    <Button sx={styles.resetbutton} onClick={reset} disabled={!isActive && time === 0}>
                        Reset
                    </Button>
                </Container>
            </Paper>
        </Container>
    );
}

export default Stopwatch;
