import React from 'react';
import { Paper, Button, Container, TextField } from '@mui/material';
import styles from './TimerStyles.jsx';

function Timer({ decrementStudyTime }) {
    const [totalSeconds, setTotalSeconds] = React.useState(0);
    const [isActive, setIsActive] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    React.useEffect(() => {
        let interval;
        if (isActive && totalSeconds > 0) {
            interval = setInterval(() => {
                setTotalSeconds(seconds => {
                    decrementStudyTime(1); // Decrementa il tempo di studio ogni secondo
                    return seconds - 1;
                });
            }, 1000);
        } else if (totalSeconds <= 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, totalSeconds, decrementStudyTime]);

    const startTimer = () => {
        if (inputValue) {
            setTotalSeconds(parseInt(inputValue, 10) * 60); // Converti minuti in secondi
            setIsActive(true);
        }
    };

    const stopTimer = () => {
        setIsActive(false);
    };

    const resetTimer = () => {
        setTotalSeconds(0);
        setIsActive(false);
        setInputValue('');
    };

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return (
        <Container sx={styles.container}>
            <Paper elevation={3} sx={styles.paper}>
                <TextField
                    label="Minuti"
                    variant="outlined"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    sx={styles.input}
                />
                <Container sx={styles.time}>
                    {hours < 10 ? '0' + hours : hours}:{minutes < 10 ? '0' + minutes : minutes}:{seconds < 10 ? '0' + seconds : seconds}
                </Container>
                <Container sx={styles.buttongroup}>
                    <Button sx={styles.startbutton} onClick={startTimer} disabled={isActive}>
                        Start
                    </Button>
                    <Button sx={styles.stopbutton} onClick={stopTimer} disabled={!isActive}>
                        Stop
                    </Button>
                    <Button sx={styles.resetbutton} onClick={resetTimer}>
                        Reset
                    </Button>
                </Container>
            </Paper>
        </Container>
    );
}

export default Timer;
