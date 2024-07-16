import { Box } from '@mui/material';

function NavPagesBackground() {
    return (
        <Box
            sx={{
                position: 'absolute',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            <img
                src="../../../public/home.jpg"
                alt="background"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </Box>
    );
}

export default NavPagesBackground;