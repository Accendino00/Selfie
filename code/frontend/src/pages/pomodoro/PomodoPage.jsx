import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button, Typography, TextField } from '@mui/material';
import styles from "./PomodoroPageStyles";
import ProgressBarComponent from './components/ProgressBarComponent';
import useTokenChecker from '../../utils/useTokenChecker';
import { Box } from '@mui/material';

const PomodoroPage = () => {
    const params = useParams();

    // Default values if no parameters are provided
    const defaultStudyTime = 30;
    const defaultBreakTime = 5;
    const defaultCycles = 5;
    const defaultTotalMinutes = 125;  // Assuming some default total minutes

    const [studyTime, setStudyTime] = useState(Number(params.studyTime) || defaultStudyTime);
    const [breakTime, setBreakTime] = useState(Number(params.breakTime) || defaultBreakTime);
    const [cycles, setCycles] = useState(Number(params.cycles) || defaultCycles);
    const [remainingCycles, setRemainingCycles] = useState(Number(params.cycles) || defaultCycles);
    const [totalMinutes, setTotalMinutes] = useState(Number(params.totalMinutes) || defaultTotalMinutes);
    const [totalSeconds, setTotalSeconds] = useState(totalMinutes * 60);
    const [currentCycle, setCurrentCycle] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isStudyTime, setIsStudyTime] = useState(true);

    const { loginStatus, isTokenLoading, username } = useTokenChecker();

    useEffect(() => {
        if (!isTokenLoading) {
          if (!loginStatus) {
            navigate("/login");
          }
        }
    }, [loginStatus, isTokenLoading]);

    useEffect(() => {
        calculateCycleSettings(totalMinutes);
    }, [totalMinutes]);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                    setTotalSeconds(totalSeconds - 1);
                } else if (minutes > 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                    setTotalSeconds(totalSeconds - 1);
                } else if (hours > 0) {
                    setHours(hours - 1);
                    setMinutes(59);
                    setSeconds(59);
                    setTotalSeconds(totalSeconds - 1);
                } else {
                    setCurrentCycle(currentCycle + 1);
                    resetTime();
                    setIsStudyTime(!isStudyTime);
                }
            }, 1000);

            if (currentCycle >= cycles * 2) {
                alert('Ciclo completato');
                setIsActive(false);
                setTotalSeconds(totalSeconds - 1);
                clearInterval(interval);
                if(remainingCycles > 0) {
                    setRemainingCycles(remainingCycles - 1);
                } else {
                    alert('Tutti i cicli sono stati completati');
                    setRemainingCycles(0);
                    setCurrentCycle(0);
                }
            }
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, currentCycle, hours, minutes, seconds]);

    const handleStartCycle = () => {
        setIsActive(true);
        resetTime(true); 
    };
    
    const resetTime = (initial = false) => {
        const time = (initial || currentCycle % 2 === 0) ? studyTime : breakTime;
        setIsStudyTime(initial || currentCycle % 2 === 0);  
        setHours(Math.floor(time / 60));
        setMinutes(time % 60);
        setSeconds(0);
    };
    

    const handleResetCycle = () => {
        setIsActive(false);
        setCurrentCycle(0);
        setIsStudyTime(true);
        if(remainingCycles == cycles) {
            setTotalSeconds(totalMinutes * 60);
        } else {
            setTotalSeconds(remainingCycles * (studyTime * 60 + breakTime * 60));
        }
        resetTime();
    };

    const handleEndCycle = () => {
        setIsActive(false);
        alert('Ciclo terminato anticipatamente');
        setRemainingCycles(remainingCycles - 1);
        setTotalSeconds(totalSeconds - (hours * 3600 + minutes * 60 + seconds) - (!isStudyTime ? studyTime : breakTime) * 60);
        resetTime();
    };

    const calculateCycleSettings = (minutes) => {
        const optimalStudyTime = Math.floor(minutes / (cycles + cycles * (breakTime / studyTime)));
        setStudyTime(optimalStudyTime);
        setBreakTime(breakTime);
    };

    const handleTotalTimeChange = (e) => {
        setTotalMinutes(e.target.value);
        setTotalSeconds(e.target.value * 60);
    };

    const handleNextTime = () => {
        setTotalSeconds(totalSeconds - (hours * 3600 + minutes * 60 + seconds));
        setIsStudyTime(!isStudyTime);
        resetTime();
    };


    //da rivedere la funzione resettime
    
    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime

    //da rivedere la funzione resettime


    console.log('hours', hours);
    console.log('minutes', minutes);
    console.log('seconds', seconds);
    console.log('Total minutes', totalMinutes);
    console.log('Total seconds', totalSeconds);
    console.log('Study time', studyTime);
    console.log('Break time', breakTime);
    console.log('Cycles', cycles);
    console.log('Remaining cycles', remainingCycles);
    console.log('Current cycle', currentCycle);
    console.log('Is active', isActive);
    
    if(loginStatus) {
        return (
            <Box sx={styles.container}>
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
                    Cicli rimanenti: {remainingCycles}
                </Typography>
                <Typography variant="subtitle1">
                    Tempo rimanente: {totalSeconds / 3600 > 10 ? `${Math.floor(totalSeconds / 3600)}` : '0'+ Math.floor(totalSeconds / 3600)} : {totalSeconds % 3600 / 60 > 10 ? `${Math.floor(totalSeconds % 3600 / 60)}` : '0'+ Math.floor(totalSeconds % 3600 / 60)} : {totalSeconds % 60 > 10 ? `${totalSeconds % 60}` : '0'+ totalSeconds % 60}
                </Typography>
                <ProgressBarComponent
                    hours={hours > 10 ? hours : '0' + hours}
                    minutes={minutes > 10 ? minutes : '0' + minutes}
                    seconds={seconds > 10 ? seconds : '0' + seconds}
                    inputValue={isStudyTime ? studyTime : breakTime}
                    label={isStudyTime ? 'Studio' : 'Pausa'}
                />
                <Button onClick={handleNextTime} sx={styles.button}>Prossimo Tempo</Button>
                <Button onClick={handleStartCycle} sx={styles.button}>Inizia Ciclo</Button>
                <Button onClick={handleResetCycle} sx={styles.button}>Ricomincia Ciclo</Button>
                <Button onClick={handleEndCycle} sx={styles.button}>Fine Ciclo</Button>
            </Box>
        );    
    }
};

export default PomodoroPage;
