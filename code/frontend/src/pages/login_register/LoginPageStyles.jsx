const styles = {
    container: {
        padding: 0,
        height: '100vh',
        width: '100%',
        position: 'flex',
        backgroundColor: '#000000',
    },
    grid: {
        
        height: '100%',
        overflow: 'hidden'
    },
    imageGrid: {
        backgroundImage: 'url(/dallelogin.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
}

export default styles;
