import { React } from 'react';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import { IconButton } from '@mui/material';

function TimeMachineIcon({ setShowTimeMachine }) {
    return (
        <IconButton
            onClick={() => setShowTimeMachine(true)}
            color="inherit"
        >
            <DepartureBoardIcon/>
        </IconButton>
    )
}

export default TimeMachineIcon;

