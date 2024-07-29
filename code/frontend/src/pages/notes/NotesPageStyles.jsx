const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row', // Imposta i figli uno sotto l'altro
    alignItems: 'center', // Allinea i figli al centro orizzontalmente
    justifyContent: 'space-around', // Distanzia i figli uniformemente
    minHeight: 'calc(100vh - 64px)',
    height: '100%',
  },
  newNoteDesktop: {
    position: 'fixed', // Adjust based on your layout needs
    left: 16,
    top: 85,
  },
  newNoteMobile: {
    position: 'fixed',
    right: 16,
    bottom: 16,
    zIndex: 1000,
    backgroundColor: "#7d5ffb",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#6f4bd8",
    },
  },
}

export default styles;
