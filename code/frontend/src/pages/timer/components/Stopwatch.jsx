import React from 'react';
import { Paper, Button, Container } from '@mui/material';
import styles from './StopwatchStyles.jsx';
import ProgressBar from './ProgressBar.jsx';

function Stopwatch({ decrementStudyTime }) {
    const [time, setTime] = React.useState(0);
    const [isActive, setIsActive] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);
    const [intervalId, setIntervalId] = React.useState(null);

    React.useEffect(() => {
        if (isActive && !isPaused) {
            const startTime = Date.now() - time;
            const id = setInterval(() => {
                setTime(Date.now() - startTime);
                decrementStudyTime(1); // Decrementa il tempo di studio ogni secondo
            }, 1000);
            setIntervalId(id);
        } else if (!isActive) {
            clearInterval(intervalId);
        }
        return () => clearInterval(intervalId);
    }, [isActive, isPaused, decrementStudyTime]);

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

    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    return (
        <Container sx={styles.container}>
            {isActive ? (
                <Container sx={styles.container}>
                    <ProgressBar hours={hours} minutes={minutes} seconds={seconds} inputValue={60} label="Tempo di studio" clockwise={false} />
                    <Container sx={styles.buttongroup}>
                        <Button sx={styles.resetbutton} onClick={reset}>
                            Reset
                    </Button>
                    </Container>
                </Container>
            ) : (
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
            )}
        </Container>
    );
}

export default Stopwatch;
