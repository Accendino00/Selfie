import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Paper } from '@mui/material';
import ProgressBar from './ProgressBar.jsx';
import styles from './TimerStyles.jsx';
import TimeInput from './TimeInput';

function Timer({ onTimeDecrement }) {
    const TOTAL_DURATION = 3600;  // Total duration in seconds, can be adjusted or fetched
    const [totalSeconds, setTotalSeconds] = useState(TOTAL_DURATION);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setTotalSeconds(prevSeconds => {
                    const nextSeconds = prevSeconds - 1;
                    if (nextSeconds <= 0) {
                        clearInterval(intervalRef.current);
                        setIsActive(false);
                        onTimeDecrement(TOTAL_DURATION);
                        return 0;
                    }
                    return nextSeconds;
                });
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive, onTimeDecrement, TOTAL_DURATION]);
    

    const startTimer = () => {
        if (totalSeconds > 0 && !isActive) {
            setIsActive(true);
        }
    };

    const stopTimer = () => {
        clearInterval(intervalRef.current);
        setIsActive(false);
    };

    const resetTimer = () => {
        clearInterval(intervalRef.current);
        setTotalSeconds(TOTAL_DURATION);
        setIsActive(false);
        onTimeDecrement(TOTAL_DURATION); // Notify parent component of reset
    };

    const handleTimeChange = (newTotalSeconds) => {
        setTotalSeconds(newTotalSeconds);
    };

    return (
        <Container sx={styles.container}>
            {isActive ? (
                <>
                    <ProgressBar 
                hours={Math.floor(totalSeconds / 3600)} 
                minutes={Math.floor((totalSeconds % 3600) / 60)} 
                seconds={totalSeconds % 60} 
                inputValue={TOTAL_DURATION}
                label="Tempo di studio" 
                clockwise={true}
            />
                    <Button sx={styles.stopbutton} onClick={stopTimer}>Stop</Button>
                    <Button sx={styles.resetbutton} onClick={resetTimer}>Reset</Button>
                </>
            ) : (
                <Paper elevation={3} sx={styles.paper}>
                    <TimeInput totalSeconds={totalSeconds} onTimeChange={handleTimeChange} />
                    <Button sx={styles.startbutton} onClick={startTimer} disabled={totalSeconds <= 0}>Start</Button>
                </Paper>
            )}
        </Container>
    );
}

export default Timer;
