import React from 'react';
import { Paper, Button, TextField } from '@mui/material';

function StudyComponent({ studyTime, setStudyTime, breakTime, setBreakTime, cycles, setCycles, totalMinutes, setTotalMinutes }) {

    const handleStudyTimeChange = (e) => {
        setStudyTime(parseInt(e.target.value, 10));
    }

    const handleBreakTimeChange = (e) => {
        setBreakTime(parseInt(e.target.value, 10));
    }

    const handleCyclesChange = (e) => {
        setCycles(parseInt(e.target.value, 10));
    }

    const calculateTotalMinutes = () => {
        setTotalMinutes(cycles * (studyTime + breakTime));
    }

    return (
        <>
            <h1>Choose your settings</h1>
            <TextField  
                type="number"
                label="Study time"
                placeholder="Study time"
                onChange={handleStudyTimeChange}
            />
            <TextField  
                type="number"
                label="Break time"
                placeholder="Break time"
                onChange={handleBreakTimeChange}
            />
            <TextField  
                type="number"
                label="Cycles"
                placeholder="Cycles"
                onChange={handleCyclesChange}
            />
            <Button onClick={calculateTotalMinutes}>Calculate</Button>
            <h1>Total time: {totalMinutes}</h1>
        </>
    )
}


export default StudyComponent;

