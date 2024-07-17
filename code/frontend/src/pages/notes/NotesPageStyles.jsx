const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column', // Imposta i figli uno sotto l'altro
        alignItems: 'center', // Allinea i figli al centro orizzontalmente
        justifyContent: 'space-around', // Distanzia i figli uniformemente
    },
    newNoteDesktop: {
        position: 'relative', // Adjust based on your layout needs
        left: 16,
        top: 16
      },
      newNoteMobile: {
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 1000
      },
}

export default styles;
