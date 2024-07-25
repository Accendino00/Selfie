import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../navbar/Navbar.jsx';
import useTokenChecker from '../../utils/useTokenChecker.jsx';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import HomePage from './Homepage.jsx';
import NavPagesBackground from './NavPagesBackground.jsx';
import TimeMachine from './TimeMachine.jsx';

function NavPage({originalDate}) {
    const { loginStatus, isTokenLoading } = useTokenChecker();
    const [seed, setSeed] = React.useState(0);
    const [seedTwo, setSeedTwo] = React.useState(0);
    const [date, setDate] = React.useState(new Date());
    const [showTimeMachine, setShowTimeMachine] = React.useState(true);

    const handleDateChange = (newDate) => {
        setDate(newDate);
    };   

    useEffect(() => {
        setSeedTwo((prev) => prev + 1);
    }, [loginStatus]);


    const location = useLocation();
    const isChildRoute = location.pathname


    if (isTokenLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            {showTimeMachine ? <TimeMachine onDateChange={handleDateChange} setSeed={setSeed} originalDate={originalDate} setShowTimeMachine={setShowTimeMachine} setSeedTwo={setSeedTwo}/>
            : ''}
            <Navbar key={seedTwo} setSeedTwo={setSeedTwo} loginStatus={loginStatus} showTimeMachine={showTimeMachine} setShowTimeMachine={setShowTimeMachine}/>
            {isChildRoute ? <Outlet key={seed}/> : <HomePage />}
        </>
    );
}

export default NavPage;