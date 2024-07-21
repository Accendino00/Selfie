const styles = {

    container: {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

    },
    paper: {
        padding: '20px',
        width: '100%',
        maxWidth: '800px',
        height: '84vh',
        backgroundColor: '#111119'
    },
    textField: {
        marginBottom: '20px',
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#7d5ffc',
            },
            '&:hover fieldset': {
                borderColor: '#5e4bcc',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#4a3db8',
            },
        },
    },
    quill: {
        height: '60vh', // Adjust the height as needed
        width: '100%',
        marginBottom: '20px',

    },
    actualQuill: {
        width: "100%",

    },
    addButton: {
        marginTop: '20px',
        backgroundColor: "#7d5ffc",
        color: "#53ddf0",
    },
    modifyButton: {
        marginTop: '20px',
        backgroundColor: "#7d5ffc",
        color: "#53ddf0"
    },

};


export default styles;
