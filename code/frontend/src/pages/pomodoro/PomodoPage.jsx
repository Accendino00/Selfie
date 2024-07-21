import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button, Typography, TextField } from '@mui/material';
import styles from "./PomodoroPageStyles";
import ProgressBarComponent from './components/ProgressBarComponent';
import useTokenChecker from '../../utils/useTokenChecker';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StopIcon from '@mui/icons-material/Stop';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';

const PomodoroPage = () => {
    const params = useParams();

    // Default values if no parameters are provided
    const defaultStudyTime = 30;
    const defaultBreakTime = 5;
    const defaultCycles = 5;
    const defaultTotalMinutes = 175;  // Assuming some default total minutes

    const [studyTime, setStudyTime] = useState(Number(params.studyTime) || defaultStudyTime);
    const [breakTime, setBreakTime] = useState(Number(params.breakTime) || defaultBreakTime);
    const [cycles, setCycles] = useState(Number(params.cycles) || defaultCycles);
    const [remainingCycles, setRemainingCycles] = useState(Number(params.cycles) || defaultCycles);
    const [totalMinutes, setTotalMinutes] = useState(Number(params.totalMinutes) || defaultTotalMinutes);
    const [totalSeconds, setTotalSeconds] = useState(totalMinutes * 60);
    const [oneCycle, setoneCycle] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isStudyTime, setIsStudyTime] = useState(true);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

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
                    setSeconds(prev => prev - 1);
                    setTotalSeconds(prev => prev - 1);
                } else if (minutes > 0) {
                    setMinutes(prev => prev - 1);
                    setSeconds(59);
                    setTotalSeconds(prev => prev - 1);
                } else if (hours > 0) {
                    setHours(prev => prev - 1);
                    setMinutes(59);
                    setSeconds(59);
                    setTotalSeconds(prev => prev - 1);
                } else {
                    if (oneCycle >= 2) {
                        clearInterval(interval);
                        handleEndOfCycle();
                    } else {
                        setoneCycle(prev => prev + 1);
                        setIsStudyTime(prev => !prev);
                        resetTime();
                    }
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, oneCycle, hours, minutes, seconds]);

    const handleEndOfCycle = () => {
        alert('Ciclo completato');
        setIsActive(false);
        if (remainingCycles > 0) {
            setRemainingCycles(prev => prev - 1);
        } else {
            alert('Tutti i cicli sono stati completati');
            setRemainingCycles(0);
        }
        setTotalSeconds(remainingCycles * (studyTime * 60 + breakTime * 60));
        setIsStudyTime(true);
        resetTime();
        setoneCycle(0);
    };

    const handleSetStudyTime = (e) => {
        setStudyTime(Number(e.target.value));
        resetTime();
    };

    const handleSetBreakTime = (e) => {
        setBreakTime(Number(e.target.value));
        resetTime();
    };

    const handleSetCycles = (e) => {
        setCycles(Number(e.target.value));
        setRemainingCycles(Number(e.target.value));
        resetTime();
    };

    const resetTime = () => {
        setHours(Math.floor((isStudyTime ? studyTime : breakTime) / 60));
        setMinutes((isStudyTime ? studyTime : breakTime) % 60);
        setSeconds(0);
    };

    const calculateCycleSettings = (minutes) => {
        const optimaltime = minutes / cycles;
        const optimalStudyTime = Math.floor(optimaltime * 0.8);
        const optimalBreakTime = Math.floor(optimaltime * 0.2);
        setStudyTime(optimalStudyTime);
        setBreakTime(optimalBreakTime);
    };

    const handleTotalTimeChange = (e) => {
        setTotalMinutes(e.target.value);
        setTotalSeconds(e.target.value * 60);
    };

    const handleStartCycle = () => {
        if (totalSeconds == 0 || totalMinutes == 0) {
            alert('Inserire un tempo valido');
            return;
        } else if (remainingCycles == 0) {
            alert('Tutti i cicli sono stati completati');
            return;
        } else if (isActive) {
            alert('Il ciclo è già in corso');
            return;
        } else if (isPaused) {
            alert('Il ciclo è in pausa');
            return;
        } else {
            setIsActive(true);
            resetTime();
        }
    };

    const handlePauseCycle = () => {
        setIsActive(false);
        setIsPaused(true);
    };

    const handleResumeCycle = () => {
        setIsActive(true);
        setIsPaused(false);
    };

    const handleResetCycle = () => {
        setIsActive(false);
        if (studyTime == 0 || breakTime == 0 || cycles == 0 || totalMinutes == 0) {
            alert('Inserire un tempo valido');
            return;
        }
        setIsStudyTime(true);
        resetTime();
        setoneCycle(0);
        if (remainingCycles == cycles) {
            setTotalSeconds(totalMinutes * 60);
        } else {
            setTotalSeconds(remainingCycles * (studyTime * 60 + breakTime * 60));
        }
    };

    const handleEndCycle = () => {
        setIsActive(false);
        if (studyTime == 0 || breakTime == 0 || cycles == 0 || totalMinutes == 0) {
            alert('Inserire un tempo valido');
            return;
        }
        setIsStudyTime(true);
        resetTime();
        setoneCycle(0);
        alert('Ciclo terminato anticipatamente');
        setRemainingCycles(remainingCycles - 1);
        setTotalSeconds(remainingCycles * (studyTime * 60 + breakTime * 60));
    };

    const handleNextTime = () => {
        setIsActive(false);
        if (studyTime == 0 || breakTime == 0 || cycles == 0 || totalMinutes == 0) {
            alert('Inserire un tempo valido');
            return;
        }
        setIsStudyTime(!isStudyTime);
        resetTime();
        if (oneCycle >= 2) {
            handleEndOfCycle();
        } else {
            setTotalSeconds(totalSeconds - (isStudyTime ? studyTime : breakTime) * 60);
            setoneCycle(prev => prev + 1);
        }
    };

    console.log('studyTime', studyTime);
    console.log('breakTime', breakTime);
    console.log('cycles', cycles);
    console.log('totalMinutes', totalMinutes);
    console.log('remainingCycles', remainingCycles);
    console.log('totalSeconds', totalSeconds);
    console.log('oneCycle', oneCycle);
    console.log('isActive', isActive);
    console.log('hours', hours);
    console.log('minutes', minutes);
    console.log('seconds', seconds);
    console.log('isStudyTime', isStudyTime);


    if (loginStatus) {
        return (
                <Grid container direction="column" sx={styles.grid}>
                    <Typography variant="h4" sx={styles.heading}>Timer Pomodoro</Typography>
                    <TextField
                        label="Tempo di Studio (in minuti)"
                        variant="standard"
                        type="number"
                        value={studyTime}
                        onChange={handleSetStudyTime}
                        sx={styles.textField}

                    />
                    <TextField
                        label="Durata Pausa (in minuti)"
                        variant="standard"
                        type="number"
                        value={breakTime}
                        onChange={handleSetBreakTime}
                        sx={styles.textField}
                    />
                    <TextField
                        label="Numero di Cicli"
                        variant="standard"
                        type="number"
                        value={cycles}
                        onChange={handleSetCycles}
                        sx={styles.textField}
                    />
                    <TextField
                        label="Tempo Totale (in minuti)"
                        variant="standard"
                        type="number"
                        value={totalMinutes}
                        onChange={handleTotalTimeChange}
                        sx={styles.textField}
                    />
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Cicli rimanenti: {remainingCycles}
                    </Typography>
                    <Typography variant="subtitle1">
                        Tempo rimanente: {totalSeconds / 3600 > 10 ? `${Math.floor(totalSeconds / 3600)}` : '0' + Math.floor(totalSeconds / 3600)} : {totalSeconds % 3600 / 60 > 10 ? `${Math.floor(totalSeconds % 3600 / 60)}` : '0' + Math.floor(totalSeconds % 3600 / 60)} : {totalSeconds % 60 > 10 ? `${totalSeconds % 60}` : '0' + totalSeconds % 60}
                    </Typography>


                    <ProgressBarComponent
                        hours={hours > 10 ? hours : '0' + hours}
                        minutes={minutes > 10 ? minutes : '0' + minutes}
                        seconds={seconds > 10 ? seconds : '0' + seconds}
                        inputValue={isStudyTime ? studyTime : breakTime}
                        label={isStudyTime ? 'Studio' : 'Pausa'}
                    />

                    <Grid container direction="row" justifyContent="center" alignItems="center">
                        <Button onClick={handleNextTime} sx={styles.button}>
                            <SkipNextIcon />
                        </Button>
                        <Button onClick={handleStartCycle} sx={styles.button}>
                            <PlayArrowIcon />
                        </Button>
                        {isPaused ? (
                            <Button onClick={handleResumeCycle} sx={styles.button}>
                                <PlayCircleFilledWhiteIcon />
                            </Button>
                        ) : (
                            <Button onClick={handlePauseCycle} sx={styles.button}>
                                <PauseIcon />
                            </Button>
                        )}
                        <Button onClick={handleResetCycle} sx={styles.button}>
                            <RestartAltIcon />
                        </Button>
                        <Button onClick={handleEndCycle} sx={styles.button}>
                            <StopIcon />
                        </Button>
                    </Grid>

                </Grid>
            
        );
    }
};

export default PomodoroPage;
