import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function interpolateColor(progress) {
    const red = Math.min(255, Math.floor(255 * (1 - progress / 100)));
    const green = Math.max(0, Math.floor(255 * (progress / 100)));
    return `rgb(${red}, ${green}, 0)`;
}

function ProgressBar({ hours, minutes, seconds, inputValue, label, clockwise }) {
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  let progress = (totalSeconds / inputValue) * 100;
  progress = clockwise ? 100 - progress : progress;

  console.log('ProgressBar progress:', progress);  // Debugging progress calculation

  const color = interpolateColor(progress);

    const formattedHours = hours < 10 ? '0' + hours : hours; 
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    return (
        <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
            <CircularProgress
                variant="determinate"
                value={100}  // This is static and used as a background
                size={300}
                thickness={4}
                sx={{
                    color: 'rgba(0, 0, 0, 0.1)',
                    transform: 'rotate(-90deg)',
                }}
            />
            <CircularProgress
                variant="determinate"
                value={progress}
                size={300}
                thickness={4}
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: color,
                    transform: 'rotate(-90deg)',
                }}
            />
            <Box
                top={0}
                left={0}
                right={0}
                bottom={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                sx={{ textAlign: 'center' }}
            >
                <Typography variant="caption" component="div" color="text.secondary" fontSize="1.3em" lineHeight="1em" fontWeight="bold">
                    {label}
                </Typography>
                <Typography variant="caption" component="div" color="text.secondary">
                    {`${formattedHours}:${formattedMinutes}:${formattedSeconds}`}
                </Typography>
            </Box>
        </Box>
    );
}

export default ProgressBar;
