
const styles = {
    container: {
        position: 'relative',
        height: '300px', // Definisce un'altezza per il container per centrare il CircularProgress
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paper:{
        position: 'relative', // Importante per lo z-index
        padding: '20px',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    time:{
        textAlign: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
    },
    buttongroup:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
    },
    startbutton:{
        margin: '0 10px',
    },
    resetbutton:{
        margin: '0 10px',
    },
    stopbutton:{
        margin: '0 10px',
    },
}

export default styles;