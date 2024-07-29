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
        backgroundColor: '#111119',
        borderRadius: '16px',
        marginBottom: '20px',
    },
    textField: {
        marginBottom: '20px',
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#7d5ffc5e',
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
        width: '100%',
        border: "0px",
    },
    actualQuill: {
        width: "100%",
        border: "0px",
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
