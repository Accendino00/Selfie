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
                borderColor: '#7d5ffc', // Default border color
            },
            '&:hover fieldset': {
                borderColor: '#5e4bcc', // Border color on hover
            },
            '&.Mui-focused fieldset': {
                borderColor: '#4a3db8', // Border color when focused
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
        backgroundColor: "#53ddf0",
        color: "#000000"
    },
    modifyButton: {
        marginTop: '20px',
        backgroundColor: "#53ddf0",
        color: "#000000"
    },

};


export default styles;
