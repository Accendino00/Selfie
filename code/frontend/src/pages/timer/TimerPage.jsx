import React from "react";
import Stopwatch from "./components/Stopwatch";
import Timer from "./components/Timer";
import { Button, Container } from "@mui/material";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import styles from "./TimerPageStyles.jsx";
import StudyTime from "./components/StudyTime";
import FinishedStudying from "./components/FinishedStudying";
import { useState, useEffect, useCallback } from "react";
import useTokenChecker from "../../utils/useTokenChecker.jsx";
import { CircularProgress, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function TimerPage() {
    const navigate = useNavigate();
    const [currentWidget, setCurrentWidget] = useState('timer');
    const [studyTime, setStudyTime] = useState(3600); // Default to 1 hour
    const [finishedStudying, setFinishedStudying] = useState(false);

    const { loginStatus, isTokenLoading, username } = useTokenChecker();

    useEffect(() => {
        if (!isTokenLoading) {
          if (!loginStatus) {
            navigate("/login");
          }
        }
    }, [loginStatus, isTokenLoading]);
    
      

    useEffect(() => {
        if (studyTime <= 0) {
            setFinishedStudying(true);
            setStudyTime(0);
        } else {
            setFinishedStudying(false);
        }
    }, [studyTime]);

    const decrementStudyTime = useCallback((timeDecrement) => {
        setStudyTime(prevTime => {
            const updatedTime = Math.max(0, prevTime - timeDecrement);
            console.log('Updated Study Time:', updatedTime);  // Debugging the update
            return updatedTime;
        });
    }, []);
    //si potrebbe usare anche mettere [studyTime] 
    
    

    const isTimer = currentWidget === 'timer';

    const toggleWidget = () => {
        setCurrentWidget(isTimer ? 'stopwatch' : 'timer');
    };

    if (isTokenLoading || loginStatus === undefined) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
          </Box>
        );
    }

    if(loginStatus) {
        return (
            <Container sx={styles.container}>
                {!finishedStudying ? (
                    <StudyTime remainingTime={studyTime} updateStudyTime={setStudyTime} />
                ) : (
                    <>
                        <Container sx={styles.container}>
                            <FinishedStudying/>
                            <Button onClick={() => {
                                setFinishedStudying(false);
                                setStudyTime(3600); // Reset to 1 hour or another initial value
                            }}>Ricomincia</Button>
                        </Container>
                    </>
                )}
                {isTimer ? (
                    <>
                        <Button sx={{ position: 'absolute', top: '10px', left: '10px' }} onClick={toggleWidget}>
                            <ArrowBackIos />
                        </Button>
                        <Timer decrementStudyTime={decrementStudyTime} onTimeDecrement={decrementStudyTime} />
                    </>
                ) : (
                    <>
                        <Stopwatch decrementStudyTime={decrementStudyTime} />
                        <Button sx={{ position: 'absolute', top: '10px', right: '10px' }} onClick={toggleWidget}>
                            <ArrowForwardIos />
                        </Button>
                    </>
                )}
            </Container>
        );
    } else {
        <> </>;
    }
}

export default TimerPage;
