const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column', // Imposta i figli uno sotto l'altro
        alignItems: 'center', // Allinea i figli al centro orizzontalmente
        justifyContent: 'space-around', // Distanzia i figli uniformemente
    },
    grid:{
        height: '100%',
        overflow: 'hidden'
    },
    imageGrid:{
        backgroundImage: 'url(/image-login)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center', 
    },
}

export default styles;