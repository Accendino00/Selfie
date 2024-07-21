import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function interpolateColor(progress) {
    const startColor = [255, 255, 255]; // Bianco
    const endColor = [66, 133, 244]; // Blu della palette Vapor

    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * (progress / 100));
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * (progress / 100));
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * (progress / 100));

    return `rgb(${r}, ${g}, ${b})`;
}

function ProgressBarComponent({ hours, minutes, seconds, inputValue, label }) {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const initialSeconds = inputValue * 60;
    let progress = (totalSeconds / initialSeconds) * 100; // Calcola il progresso basato sul tempo rimanente

    const color = interpolateColor(progress); // Calcola il colore in base al progresso

    return (
        <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
            <CircularProgress
                variant="determinate"
                value={100} // Usato come sfondo pieno di colore
                size={'25vh'}
                thickness={4}
                sx={{
                    color: 'rgba(0, 0, 0, 0.1)', // Sfondo grigio leggero
                    transform: 'rotate(90deg)', // Rotazione corretta per orario
                }}
            />
            <CircularProgress
                variant="determinate"
                value={100 - progress} // Calcola il valore da sottrarre per fare il decremento
                size={'25vh'}
                thickness={4}
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: color,
                    transform: 'rotate(90deg)', // Rotazione corretta per orario
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
                    {`${hours}:${minutes}:${seconds}`}
                </Typography>
            </Box>
        </Box>
    );
}

export default ProgressBarComponent;
