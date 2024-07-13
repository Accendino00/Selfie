const styles = {
    container: {
        position: 'relative',
        height: '300px', // Definisce un'altezza per il container per centrare il CircularProgress
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paper:{
        position: 'relative', // Importante per lo z-index
        padding: '20px',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    text:{
        textAlign: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
    },
}

export default styles;

