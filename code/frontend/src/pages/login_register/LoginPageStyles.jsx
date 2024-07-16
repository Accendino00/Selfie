const styles = {
    container: {
        padding: 0,
        marginTop: '1vh',
        width: '100%',
        position: 'relative',
    },
    grid: {
        height: '100%',
        overflow: 'hidden'
    },
    imageGrid: {
        backgroundImage: 'url(/image-login.jpeg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
}

export default styles;
