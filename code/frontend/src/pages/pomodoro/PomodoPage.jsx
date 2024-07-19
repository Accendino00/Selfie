import React, { useState, useEffect } from 'react';
import { Container, Button, Typography, TextField } from '@mui/material';
import styles from "./PomodoroPageStyles";
import ProgressBarComponent from './components/ProgressBarComponent';

const PomodoroPage = () => {
    const [studyTime, setStudyTime] = useState(30); // tempo di studio in minuti
    const [breakTime, setBreakTime] = useState(5); // tempo di pausa in minuti
    const [cycles, setCycles] = useState(5);
    const [totalMinutes, setTotalMinutes] = useState(175);
    const [currentCycle, setCurrentCycle] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isStudyTime, setIsStudyTime] = useState(true);

    useEffect(() => {
        calculateCycleSettings(totalMinutes);
    }, [totalMinutes]);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                } else if (minutes > 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                } else if (hours > 0) {
                    setHours(hours - 1);
                    setMinutes(59);
                    setSeconds(59);
                } else {
                    setCurrentCycle(currentCycle + 1);
                    resetTime();
                    setIsStudyTime(!isStudyTime);
                }
            }, 1000);

            if (currentCycle >= cycles * 2) {
                alert('Ciclo completato');
                setIsActive(false);
                clearInterval(interval);
            }
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, currentCycle, hours, minutes, seconds]);

    const handleStartCycle = () => {
        setIsActive(true);
        resetTime(true);  // Aggiungi un parametro per indicare l'inizio del timer
    };
    
    const resetTime = (initial = false) => {
        const time = (initial || currentCycle % 2 === 0) ? studyTime : breakTime;
        setIsStudyTime(initial || currentCycle % 2 === 0);  // Aggiorna qui lo stato
        setHours(Math.floor(time / 60));
        setMinutes(time % 60);
        setSeconds(0);
    };
    

    const handleResetCycle = () => {
        setIsActive(false);
        setCurrentCycle(0);
        setIsStudyTime(true);
        resetTime();
    };

    const handleEndCycle = () => {
        setIsActive(false);
        alert('Ciclo terminato anticipatamente');
        resetTime();
    };

    const calculateCycleSettings = (minutes) => {
        const optimalStudyTime = Math.floor(minutes / (cycles + cycles * (breakTime / studyTime)));
        setStudyTime(optimalStudyTime);
        setBreakTime(breakTime);
    };

    const handleTotalTimeChange = (e) => {
        setTotalMinutes(e.target.value);
    };

    return (
        <Container sx={styles.container}>
            <Typography variant="h5" sx={styles.heading}>Timer Pomodoro</Typography>
            <TextField
                label="Tempo di Studio (in minuti)"
                variant="outlined"
                type="number"
                value={studyTime}
                onChange={(e) => setStudyTime(Number(e.target.value))}
                sx={styles.textField}
            />
            <TextField
                label="Durata Pausa (in minuti)"
                variant="outlined"
                type="number"
                value={breakTime}
                onChange={(e) => setBreakTime(Number(e.target.value))}
                sx={styles.textField}
            />
            <TextField
                label="Numero di Cicli"
                variant="outlined"
                type="number"
                value={cycles}
                onChange={(e) => setCycles(Number(e.target.value))}
                sx={styles.textField}
            />
            <TextField
                label="Tempo Totale (in minuti)"
                variant="outlined"
                type="number"
                value={totalMinutes}
                onChange={handleTotalTimeChange}
                sx={styles.textField}
            />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Cicli rimanenti: {cycles - Math.floor(currentCycle / 2)}
            </Typography>
            <ProgressBarComponent
                hours={hours}
                minutes={minutes}
                seconds={seconds}
                inputValue={isStudyTime ? studyTime : breakTime}
                label={isStudyTime ? 'Studio' : 'Pausa'}
            />
            <Button onClick={handleStartCycle} sx={styles.button}>Inizia Ciclo</Button>
            <Button onClick={handleResetCycle} sx={styles.button}>Ricomincia Ciclo</Button>
            <Button onClick={handleEndCycle} sx={styles.button}>Fine Ciclo</Button>
        </Container>
    );    
};

export default PomodoroPage;
