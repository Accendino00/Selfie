import React from "react";
import Stopwatch from "./components/Stopwatch";
import Timer from "./components/Timer";
import { Button, Container } from "@mui/material";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import styles from "./TimerPageStyles.jsx";
import StudyTime from "./components/StudyTime";
import { useState } from "react";

function TimerPage() {
    const [currentWidget, setCurrentWidget] = useState('timer');
    const [studyTime, setStudyTime] = useState(0); // Il tempo di studio in secondi

    const updateStudyTime = (time) => {
        setStudyTime(time);
    };

    const decrementStudyTime = (timeDecrement) => {
        setStudyTime((prevTime) => prevTime - timeDecrement);
    };

    const isTimer = currentWidget === 'timer';

    const toggleWidget = () => {
        setCurrentWidget(isTimer ? 'stopwatch' : 'timer');
    };

    return (
        <Container sx={styles.container}>
            <StudyTime remainingTime={studyTime} updateStudyTime={updateStudyTime} />
            {isTimer ? (
                <>
                    <Button sx={{ position: 'absolute', top: '10px', left: '10px' }} onClick={toggleWidget}>
                        <ArrowBackIos />
                    </Button>
                    <Timer decrementStudyTime={decrementStudyTime} />
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
}


export default TimerPage;

