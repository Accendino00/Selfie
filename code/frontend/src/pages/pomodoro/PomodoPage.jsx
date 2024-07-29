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

import { useNavigate } from 'react-router-dom';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Divider from '@mui/material/Divider';
import { set } from 'date-fns';

const PomodoroPage = () => {
    const params = useParams();
    const navigate = useNavigate();

    const MemoizedProgressBarComponent = React.memo(ProgressBarComponent);


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
    const [currentId, setCurrentId] = useState(params.currentId || '');

    // Current state values
    const [remainingCycles, setRemainingCycles] = useState(Number(params.cycles) || defaultCycles);
    const [totalSeconds, setTotalSeconds] = useState(totalMinutes * 60);
    const [finishedStudy, setFinishedStudy] = useState(false);
    const [calculateSettings, setCalculateSettings] = useState('');

    // Conta se sono a studio o in pausa
    const [oneCycle, setoneCycle] = useState(0);
    const [isStudyTime, setIsStudyTime] = useState(true);

    // Gestiscono la pausa
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Ore, minuti e secondi displayed.
    const [hours, setHours] = useState(isStudyTime ? Math.floor(studyTime / 60) : Math.floor(breakTime / 60));
    const [minutes, setMinutes] = useState(isStudyTime ? studyTime % 60 : breakTime % 60);
    const [seconds, setSeconds] = useState(0);

    // utility per salvare informazioni nel database
    const [userId, setUserId] = useState('');
    const [creationDate, setCreationDate] = useState('');

    // Gestione per capire se l'utente è loggato
    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const token = Cookies.get('token');

    // Disabilita tasti
    const [disableStartButton, setDisableStartButton] = useState(false);
    const [disableNextButton, setDisableNextButton] = useState(false);
    const [disablePauseButton, setDisablePauseButton] = useState(true);

    useEffect(() => {
        if (!isTokenLoading) {
            if (!loginStatus) {
                navigate("/login");
            }
        }
    }, [loginStatus, isTokenLoading]);

    useEffect(() => {
        resetTime();
    }
    , [isStudyTime, studyTime, breakTime, finishedStudy,  remainingCycles]);

    useEffect(() => {
        console.log('Remaining cycles:', remainingCycles);
    }, [remainingCycles]);
    
    useEffect(() => {
        console.log('One cycle:', oneCycle);
    }, [oneCycle]);


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
        calculateCycleSettings(calculateSettings == 'totalMinutes' ? totalMinutes : calculateSettings == 'studyTime' ? studyTime : calculateSettings == 'breakTime' ? breakTime : cycles, calculateSettings);
    }, [totalMinutes, cycles, studyTime, breakTime]);

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
                    console.log('oneCycle', oneCycle);
                    if (oneCycle >= 2) {
                        clearInterval(interval);
                        handleNextTime();
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

    const handleSetStudyTime = (e) => {
        if(e.target.value >= 1){
            setStudyTime(Number(e.target.value));
            resetTime();
            setCalculateSettings('studyTime');
            calculateCycleSettings(Number(e.target.value), 'studyTime');
        } else {
            setStudyTime(1);
            resetTime();
            setCalculateSettings('studyTime');
            calculateCycleSettings(1, 'studyTime');
        }
    };

    const handleSetBreakTime = (e) => {
        if(e.target.value >= 1){
            setBreakTime(Number(e.target.value));
            resetTime();
            setCalculateSettings('breakTime');
            calculateCycleSettings(Number(e.target.value), 'breakTime');
        } else {
            setBreakTime(1);
            resetTime();
            setCalculateSettings('breakTime');
            calculateCycleSettings(1, 'breakTime');
        }
    };

    const handleSetCycles = (e) => {
        if(e.target.value >= 1){
            setCycles(Number(e.target.value));
            setRemainingCycles(Number(e.target.value));
            resetTime();
            setCalculateSettings('cycles');
            calculateCycleSettings(Number(e.target.value), 'cycles');
        } else {
            setCycles(1);
            setRemainingCycles(1);
            resetTime();
            setCalculateSettings('cycles');
            calculateCycleSettings(1, 'cycles');
        }
    };

    const calculateCycleSettings = (number, calculateSettings) => {
        if(calculateSettings == 'totalMinutes'){
            const optimaltime = number / cycles;
            const optimalStudyTime = Math.ceil(optimaltime * 0.8);
            const optimalBreakTime = Math.ceil(optimaltime * 0.2);
            setStudyTime(optimalStudyTime);
            setBreakTime(optimalBreakTime);
        } else if(calculateSettings == 'studyTime'){
            const optimaltime = (number + breakTime) * cycles;
            setTotalMinutes(optimaltime);
            setTotalSeconds(optimaltime * 60);
        } else if(calculateSettings == 'breakTime'){
            const optimaltime = (studyTime + number) * cycles;
            setTotalMinutes(optimaltime);
            setTotalSeconds(optimaltime * 60);
        } else if(calculateSettings == 'cycles'){
            const optimaltime = studyTime + breakTime;
            const optimalTotalMinutes = optimaltime * number;
            setTotalMinutes(optimalTotalMinutes);
            setTotalSeconds(optimalTotalMinutes * 60
            );
        }
    };

    const handleTotalTimeChange = (e) => {
        if(e.target.value >= cycles+2){
            setTotalMinutes(Number(e.target.value));
            setTotalSeconds(Number(e.target.value) * 60);
            setCalculateSettings('totalMinutes');
            calculateCycleSettings(Number(e.target.value), 'totalMinutes');
        } else {
            setTotalMinutes(cycles+2);
            setTotalSeconds((cycles+2) * 60);
            setCalculateSettings('totalMinutes');
            calculateCycleSettings((cycles+2),'totalMinutes');
        }
    };

    const handleStartCycle = () => {
        if (totalSeconds == 0 || totalMinutes == 0) {
            setDisableStartButton(true);
            return;
        } else if (remainingCycles == 0) {
            setDisableStartButton(true);
            return;
        } else {
            setDisablePauseButton(false);
            setDisableNextButton(true);
            setIsPaused(false);
            setIsActive(true);
            resetTime();
            setDisableStartButton(true);
        }
    };

    const handlePauseCycle = () => {
        setIsActive(false);
        setDisableNextButton(false);
        setDisableStartButton(true);
        setIsPaused(true);
    };

    const handleResumeCycle = () => {
        setIsActive(true);
        setDisableNextButton(true);
        setDisableStartButton(true);
        setIsPaused(false);
    };

    const handleResetCycle = () => {
        setIsActive(false);
        setDisableNextButton(false);
        setDisableStartButton(false);
        if (studyTime == 0 || breakTime == 0 || cycles == 0 || totalMinutes == 0) {
            setDisableStartButton(true);
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
    
    const resetTime = () => {
        setIsStudyTime(prevIsStudyTime => {
            const newHours = prevIsStudyTime ? Math.floor(studyTime / 60) : Math.floor(breakTime / 60);
            const newMinutes = prevIsStudyTime ? studyTime % 60 : breakTime % 60;
            setHours(newHours);
            setMinutes(newMinutes);
            setSeconds(0);
            return prevIsStudyTime;  // Maintain the current phase
        });
    };
    
    // Update handleNextTime function
    const handleNextTime = () => {
        setIsActive(false);
    
        if (studyTime === 0 || breakTime === 0 || cycles === 0 || totalMinutes === 0) {
            setDisableStartButton(true);
            return;
        }
    
        if (oneCycle === 1) { // This indicates that we are at the end of a study-break cycle
            handleEndCycle();
        } else {
            setoneCycle(1); // Set oneCycle to 1 after the first call, indicating the next cycle is ready
            setIsStudyTime(prevIsStudyTime => {
                setTotalSeconds((remainingCycles-1) * (studyTime * 60 + breakTime * 60) + breakTime * 60);
                return !prevIsStudyTime;
            });
            resetTime();
        }
    };

    useEffect(() => {
        handleModifyStudyEvent();
    }, [remainingCycles]);

    const handleEndCycle = () => {
        setIsActive(false);
        setRemainingCycles(prevRemainingCycles => {
            const newRemainingCycles = Math.max(0, prevRemainingCycles - 1);
            if (newRemainingCycles > 0) {
                setIsStudyTime(true);
                resetTime();
                setTotalSeconds(newRemainingCycles * (studyTime * 60 + breakTime * 60));
            } else {
                setFinishedStudy(true);
                setDisableStartButton(true);
                setTotalSeconds(0); // Ensure totalSeconds is set to 0 when cycles are finished
                resetTime();
            }
            return newRemainingCycles;
        });
        setoneCycle(0); // Reset oneCycle after ending a full cycle
    };
    
    const handleModifyStudyEvent = async () => {
        console.log('ciao');
        console.log('totalSeconds', totalSeconds);
        console.log('remainingCycles', remainingCycles);
        const fetchStudyEvents = async () => {
            try {
                const response = await fetch(`/api/modifyStudyEventFromPomodoro/${currentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ 
                        totalMinutes: totalSeconds / 60,
                        cycles: remainingCycles,
                    }),
                });
                if (response.ok) {
                    const fetchedStudyEvent = await response.json();
                    console.log('Study event modified:', fetchedStudyEvent);
                } else {
                    console.error('Failed to modify study event');
                }
            } catch (error) {
                console.error('Failed to modify study event', error);
            }
        }

        fetchStudyEvents();

    };


const handleStart = () => { 
    setFinishedStudy(false);
    setDisableStartButton(false);
    setIsActive(false);
    setIsPaused(false);
    setoneCycle(0);
    setIsStudyTime(true);
    setRemainingCycles(cycles);
    setStudyTime(defaultStudyTime);
    setBreakTime(defaultBreakTime);
    setCycles(defaultCycles);
    setTotalMinutes(defaultTotalMinutes);
    setTotalSeconds(defaultTotalMinutes * 60);
    resetTime();
};
    
    // Disable buttons conditionally
    const disableButtons = remainingCycles === 0 && totalSeconds === 0;


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
                    <Typography variant="h4" sx={styles.heading}>Pomodoro</Typography>

                    <Accordion sx={{
                        backgroundColor: '#7d5ffc',
                    }}>
                        <AccordionSummary
                            expandIcon={<ArrowDownwardIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Typography sx={{ fontWeight: "600", textShadow: "0 0px 3px #858585", color: "white" }}>Settings</Typography>
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
                                label="Study time (in minutes)"
                                variant="standard"
                                type="number"
                                value={studyTime}
                                onChange={handleSetStudyTime}
                                sx={styles.textField}
                                onFocus={event => {
                                    event.target.select();
                                  }}

                            />
                            <TextField
                                label="Pause duration (in minutes)"
                                variant="standard"
                                type="number"
                                value={breakTime}
                                onChange={handleSetBreakTime}
                                sx={styles.textField}
                                onFocus={event => {
                                    event.target.select();
                                  }}
                            />
                            <TextField
                                label="Number of cycles"
                                variant="standard"
                                type="number"
                                value={cycles}
                                onChange={handleSetCycles}
                                sx={styles.textField}
                                onFocus={event => {
                                    event.target.select();
                                  }}
                            />
                            <TextField
                                label="Total time (in minutes)"
                                variant="standard"
                                type="number"
                                value={totalMinutes}
                                onChange={handleTotalTimeChange}
                                sx={styles.textField}
                                onFocus={event => {
                                    event.target.select();
                                  }}
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
                            Cycles left: <b>{remainingCycles}</b>
                        </Typography>
                        <Typography variant="subtitle1">
                            Time left: <b>{totalSeconds / 3600 >= 10 ? `${Math.floor(totalSeconds / 3600)}` : '0' + Math.floor(totalSeconds / 3600)} : {totalSeconds % 3600 / 60 >= 10 ? `${Math.floor(totalSeconds % 3600 / 60)}` : '0' + Math.floor(totalSeconds % 3600 / 60)} : {totalSeconds % 60 >= 10 ? `${totalSeconds % 60}` : '0' + totalSeconds % 60}</b>
                        </Typography>
                    </Container>

                    <MemoizedProgressBarComponent
                        inputValue={finishedStudy? 0 : (isStudyTime ? studyTime : breakTime)}
                        label={finishedStudy? "You finished!" : (isStudyTime ? "Study" : "Break")}
                        hours={hours >= 10 ? hours : '0' + hours}
                        minutes={minutes >= 10 ? minutes : '0' + minutes}
                        seconds={seconds >= 10 ? seconds : '0' + seconds}
                        handleStart={handleStart}
                    />

                    <Grid container direction="row" justifyContent="center" alignItems="center" sx={{
                        backgroundColor: '#1d1d2f',
                        borderRadius: "24px",
                        width: "fit-content",
                        marginTop: "1rem",
                        marginBottom: "1rem",
                        width: "90%",
                    }}>
                        <Button onClick={handleNextTime} sx={styles.button} disabled={disableButtons || disableNextButton}>
                            <SkipNextIcon />
                        </Button>

                        <Button onClick={handleStartCycle} sx={styles.button} disabled={disableStartButton || disableButtons}>
                            <PlayArrowIcon />
                        </Button>

                        {isPaused ? (
                            <Button onClick={handleResumeCycle} sx={styles.button} disabled={disableButtons}>
                                <PlayCircleFilledWhiteIcon />
                            </Button>
                        ) : (
                            <Button onClick={handlePauseCycle} sx={styles.button} disabled={disableButtons || disablePauseButton}>
                                <PauseIcon />
                            </Button>
                        )}

                        <Button onClick={handleResetCycle} sx={styles.button} disabled={disableButtons}>
                            <RestartAltIcon />
                        </Button>

                        <Button onClick={handleEndCycle} sx={styles.button} disabled={disableButtons}>
                            <StopIcon />
                        </Button>

                        <Button onClick={handleSavePomodoro} sx={styles.button} disabled={disableButtons}>
                            <StarIcon />
                        </Button>
                    </Grid>

                    <Accordion sx={{ backgroundColor: '#1d1d2f', color: 'white' }}>
                        <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ backgroundColor: '#7d5ffc' }}>
                            <Typography>How to use pomodoro in Selfie</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ backgroundColor: '#1d1d2f' }}>
                            <Typography variant="body2" sx={{ marginTop: "1em" }}>
                                The Pomodoro Technique is a time management method developed by Francesco Cirillo in the 1980s.
                                It is based on the use of a timer to divide work into focused time intervals, called "Pomodoros",
                                separated by short breaks. This helps to improve mental agility and manage time more effectively.
                            </Typography>
                            <Grid container spacing={2} alignItems="center" mt={1}>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<PlayArrowIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Start the timer
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<PauseIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Pause the timer
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<PlayCircleFilledWhiteIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Restart the timer after a pause
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<RestartAltIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Restart the cycle (study and break)
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<StopIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        End current cycle
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<SkipNextIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Go to the next part of the cycle
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6} md={6} sx={{ display: "flex", alignItems: "center" }}>
                                    <Button startIcon={<StarIcon />} sx={styles.button} />
                                    <Typography sx={{ display: "inline-block" }}>
                                        Save the current Pomodoro
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Typography variant="body2" sx={{ marginTop: "2em" }}>
                                You can also personalize the settings of the Pomodoro timer by changing the study time, break time, number of cycles, and total time.
                                Lastly, you can share your current settings with others or load shared settings from other users.    
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                </Grid >
            </Container >

        );
    }
};

export default PomodoroPage;