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
import { Cookie } from '@mui/icons-material';
import Cookies from 'js-cookie';
import StarIcon from '@mui/icons-material/Star';
import SharePomodoro from './components/SharePomodoro';
import PomodoroShared from './components/PomodoroShared';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Divider from '@mui/material/Divider';

const PomodoroPage = () => {
    const params = useParams();

    // Default values if no parameters are provided
    const defaultStudyTime = 30;
    const defaultBreakTime = 5;
    const defaultCycles = 5;
    const defaultTotalMinutes = 175;  // Assuming some default total minutes

    // General study values
    const [studyTime, setStudyTime] = useState(Number(params.studyTime) || defaultStudyTime);
    const [breakTime, setBreakTime] = useState(Number(params.breakTime) || defaultBreakTime);
    const [cycles, setCycles] = useState(Number(params.cycles) || defaultCycles);
    const [totalMinutes, setTotalMinutes] = useState(Number(params.totalMinutes) || defaultTotalMinutes);

    // Current state values
    const [remainingCycles, setRemainingCycles] = useState(Number(params.cycles) || defaultCycles);
    const [totalSeconds, setTotalSeconds] = useState(totalMinutes * 60);

    // Conta se sono a studio o in pausa
    const [oneCycle, setoneCycle] = useState(0);
    const [isStudyTime, setIsStudyTime] = useState(true);

    // Gestiscono la pausa
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Ore, minuti e secondi displayed.
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    // utility per salvare informazioni nel database
    const [userId, setUserId] = useState('');
    const [creationDate, setCreationDate] = useState('');

    // Gestione per capire se l'utente è loggato
    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const token = Cookies.get('token');

    // Disabilita tasti
    const [disableStartButton, setDisableStartButton] = useState(false);

    useEffect(() => {
        if (!isTokenLoading) {
            if (!loginStatus) {
                navigate("/login");
            }
        }
    }, [loginStatus, isTokenLoading]);


    // Gestisce il fetch dell'userID
    useEffect(() => {
        if (loginStatus) {
            const fetchUserId = async () => {
                try {
                    const response = await fetch(`/api/getUserId?username=${username}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const fetchedUserId = await response.json();
                        setUserId(fetchedUserId);
                    } else {
                        console.error('Failed to fetch user id');
                    }
                }
                catch (error) {
                    console.error('Failed to fetch user id', error);
                }
            }
            fetchUserId();
        }
    }, [loginStatus, username, token]); // Dependencies to fetch user ID


    // Calcola il tempo rimanente
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

    const handleSavePomodoro = async () => {
        const pomodoro = {
            user: userId,
            studyTime: studyTime,
            breakTime: breakTime,
            cycles: cycles,
            totalMinutes: totalMinutes,
            remainingCycles: remainingCycles,
            totalSeconds: totalSeconds,
            creationDate: new Date().toISOString(),
        };

        try {
            const response = await fetch('/api/savePomodoro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(pomodoro),
            });
            if (response.ok) {
                const savedPomodoro = await response.json();
                console.log('Pomodoro saved:', savedPomodoro);
            } else {
                console.error('Failed to save pomodoro');
            }
        } catch (error) {
            console.error('Failed to save pomodoro', error);
        }
    };


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
            disableStartButton(true);
            return;
        } else if (remainingCycles == 0) {
            disableStartButton(true);
            return;
        } else if (isActive) {
            disableStartButton(true);
            return;
        } else if (isPaused) {
            disableStartButton(true);
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
            <Container sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: "50vw",
                maxWidth: "500px !important",

                marginTop: "1rem",
                marginBottom: "1rem",

                borderRadius: "24px",


                // break at 600px to width 100%
                '@media (max-width: 800px)': {
                    width: "100%",
                }
            }}>

                <Grid container direction="column" sx={styles.grid}>
                    <Typography variant="h4" sx={styles.heading}>Timer Pomodoro</Typography>

                    <Accordion sx={{
                        backgroundColor: '#7d5ffc',
                    }}>
                        <AccordionSummary
                            expandIcon={<ArrowDownwardIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Typography sx={{ fontWeight: "600", textShadow: "0 0px 3px #858585", color: "white" }}>Impostazioni di pomodoro</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{
                            backgroundColor: '#1d1d2f',
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            justifyContent: "space-around",
                            alignContent: "space-between",
                            alignItems: "center",
                        }}>
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
                            <SharePomodoro studyTime={studyTime} breakTime={breakTime} cycles={cycles} totalMinutes={totalMinutes} />
                            <PomodoroShared setStudyTime={setStudyTime} setBreakTime={setBreakTime} setCycles={setCycles} setTotalMinutes={setTotalMinutes} />
                        </AccordionDetails>
                    </Accordion>

                    <Container sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: "1rem",
                    }}>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>
                            Cicli rimanenti: <b>{remainingCycles}</b>
                        </Typography>
                        <Typography variant="subtitle1">
                            Tempo rimanente: <b>{totalSeconds / 3600 >= 10 ? `${Math.floor(totalSeconds / 3600)}` : '0' + Math.floor(totalSeconds / 3600)} : {totalSeconds % 3600 / 60 >= 10 ? `${Math.floor(totalSeconds % 3600 / 60)}` : '0' + Math.floor(totalSeconds % 3600 / 60)} : {totalSeconds % 60 >= 10 ? `${totalSeconds % 60}` : '0' + totalSeconds % 60}</b>
                        </Typography>
                    </Container>

                    <ProgressBarComponent
                        hours={hours > 10 ? hours : '0' + hours}
                        minutes={minutes > 10 ? minutes : '0' + minutes}
                        seconds={seconds > 10 ? seconds : '0' + seconds}
                        inputValue={isStudyTime ? studyTime : breakTime}
                        label={isStudyTime ? 'Studio' : 'Pausa'}
                    />

                    <Grid container direction="row" justifyContent="center" alignItems="center" sx={{
                        backgroundColor: '#1d1d2f',
                        borderRadius: "24px",
                        padding: "1rem",
                        width: "fit-content",
                        marginTop: "1rem",
                        marginBottom: "1rem",
                    }}>
                        <Button onClick={handleNextTime} sx={styles.button}>
                            <SkipNextIcon />
                        </Button>

                        <Divider orientation="vertical" sx={{ height: "auto !important", color: "grey" }} flexItem />

                        <Button onClick={handleStartCycle} sx={styles.button} disabled={disableStartButton}>
                            <PlayArrowIcon />
                        </Button>

                        <Divider orientation="vertical" sx={{ height: "auto !important", color: "grey" }} flexItem />

                        {isPaused ? (
                            <Button onClick={handleResumeCycle} sx={styles.button}>
                                <PlayCircleFilledWhiteIcon />
                            </Button>
                        ) : (
                            <Button onClick={handlePauseCycle} sx={styles.button}>
                                <PauseIcon />
                            </Button>
                        )}

                        <Divider orientation="vertical" sx={{ height: "auto !important", color: "grey" }} flexItem />

                        <Button onClick={handleResetCycle} sx={styles.button}>
                            <RestartAltIcon />
                        </Button>

                        <Divider orientation="vertical" sx={{ height: "auto !important", color: "grey" }} flexItem />

                        <Button onClick={handleEndCycle} sx={styles.button}>
                            <StopIcon />
                        </Button>

                        <Divider orientation="vertical" sx={{ height: "auto !important", color: "grey" }} flexItem />

                        <Button onClick={handleSavePomodoro} sx={styles.button}>
                            <StarIcon />
                        </Button>
                    </Grid>

                    <Accordion sx={{ backgroundColor: '#1d1d2f', color: 'white' }}>
                        <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ backgroundColor: '#7d5ffc' }}>
                            <Typography>Come usare il metodo Pomodoro su Selfie</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ backgroundColor: '#1d1d2f' }}>
                            <Typography variant="body2" sx={{ marginTop: "1em" }}>
                                Il Metodo Pomodoro è una tecnica di gestione del tempo sviluppata da Francesco Cirillo negli anni '80.
                                Si basa sull'uso di un timer per suddividere il lavoro in intervalli di tempo focalizzati, chiamati "Pomodori",
                                separati da brevi pause. Questo aiuta a migliorare l'agilità mentale e a gestire il tempo più efficacemente.
                            </Typography>
                            <Grid container spacing={2} alignItems="center" mt={1}>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<PlayArrowIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Avvia il timer
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<PauseIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Metti il timer in pausa
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<PlayCircleFilledWhiteIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Riprendi il timer dopo una pausa
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<RestartAltIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Resetta il ciclo
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<StopIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Termina il ciclo corrente
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<SkipNextIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Salta alla prossima fase del ciclo
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<StarIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Salva il ciclo di Pomodoro
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Typography variant="body2" sx={{ marginTop: "2em" }}>
                                Puoi personalizzare il tempo di studio, il tempo di pausa, il numero di cicli e il tempo totale, inoltre puoi condividere il tuo timer con altri utenti.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                </Grid >
            </Container >

        );
    }
};

export default PomodoroPage;