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

const PomodoroPage = () => {
    const params = useParams();

    // Default values if no parameters are provided
    const defaultStudyTime = 30;
    const defaultBreakTime = 5;
    const defaultCycles = 5;
    const defaultTotalMinutes = 175;  // Assuming some default total minutes

    const [studyTime, setStudyTime] = useState(0);
    const [breakTime, setBreakTime] = useState(0);
    const [cycles, setCycles] = useState(0);
    const [remainingCycles, setRemainingCycles] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [currentId, setCurrentId] = useState(params?.currentId);
    const [totalSeconds, setTotalSeconds] = useState(totalMinutes * 60);
    const [oneCycle, setoneCycle] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isStudyTime, setIsStudyTime] = useState(true);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [userId, setUserId] = useState('');
    const [creationDate, setCreationDate] = useState('');
    const [studyEvents, setStudyEvents] = useState([]);

    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const token = Cookies.get('token');

    useEffect(() => {
        if (!isTokenLoading) {
            if (!loginStatus) {
                navigate("/login");
            }
        }
    }, [loginStatus, isTokenLoading]);

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

    useEffect(() => {
        fetch(`/api/getStudyEvents?username=${username}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Corrected syntax here
            },
        })
            .then((response) => response.json())
            .then((data) => {
                //set study events only if different from the current state
                if (JSON.stringify(data) !== JSON.stringify(studyEvents)) setStudyEvents(data);


            })
            .catch((error) => {
                console.error('Failed to fetch study events', error);
            });
    }, [username, token]); // Dependencies to fetch study events


    useEffect(() => {
        console.log("eventi studio:", studyEvents)
        let counter = 0;
        let currentStudyTime = 0;
        let currentBreakTime = 0;
        let currentCycles = 0;
        let currentTotalMinutes = 0;
        let dates =  [];
        for (let i = 0; i < studyEvents.length; i++) {
            if (new Date(studyEvents[i].start) <= new Date()) {
                counter++;
                setStudyTime((prevStudyTime) => prevStudyTime + studyEvents[i].studyTime);
                setBreakTime((prevBreakTime) => prevBreakTime + studyEvents[i].breakTime);
                setCycles((prevCycles) => prevCycles + studyEvents[i].cycles);
                setRemainingCycles((prevRemainingCycles) => prevRemainingCycles + studyEvents[i].remainingCycles);
                setTotalMinutes((prevTotalMinutes) => prevTotalMinutes + studyEvents[i].totalMinutes);
                currentStudyTime += studyEvents[i].studyTime;
                currentBreakTime += studyEvents[i].breakTime;
                currentCycles += studyEvents[i].cycles;
                currentTotalMinutes += studyEvents[i].totalMinutes;
                dates.push(studyEvents[i].start);
                console.log('dates', dates)

            }
        }
        console.log('study time after set', studyTime)
        if (counter > 1) {

            fetch(`/api/modifyAndDeleteStudyEventsFromPomodoro`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: username,
                    dates: dates,
                    studyTime: currentStudyTime,
                    breakTime: currentBreakTime,
                    totalMinutes: currentTotalMinutes,
                    cycles: currentCycles,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setStudyTime(data.studyTime);
                    setBreakTime(data.breakTime);
                    setCycles(data.cycles);
                    setTotalMinutes(data.totalMinutes);
                }
                )
                .catch((error) => {
                    console.error('Failed to modify study events', error);
                }
                );
        }


    }, [studyEvents]);

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
                <Button onClick={handleSavePomodoro} sx={styles.button}>
                    <StarIcon />
                </Button>

            </Grid>

        );
    }
};

export default PomodoroPage;
