import React from "react";
import Stopwatch from "./components/Stopwatch";
import Timer from "./components/Timer";
import { Button, Container } from "@mui/material";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import styles from "./TimerPageStyles.jsx";

function TimerPage() {
    const [currentWidget, setCurrentWidget] = React.useState('timer');

    const isTimer = currentWidget === 'timer';

    const toggleWidget = () => {
        setCurrentWidget(isTimer ? 'stopwatch' : 'timer');
    }

    return (
        <Container sx={styles.container}>
            {isTimer ? (
                <Button sx={{ position: 'absolute', top: '10px', left: '10px' }} onClick={toggleWidget}>
                    <ArrowBackIos />
                </Button>
            ) : null}
            {isTimer ? <Timer sx={styles.timer} /> : <Stopwatch sx={styles.stopwatch} />}
            {!isTimer ? (
                <Button sx={{ position: 'absolute', top: '10px', right: '10px' }} onClick={toggleWidget}>
                    <ArrowForwardIos />
                </Button>
            ) : null}
        </Container>
    );
}

export default TimerPage;

