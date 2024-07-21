const styles = {
    list: {
        width: '100%',
    },
    card: {
        maxWidth: 345,
        margin: 10,
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
    },
    textField: {
        margin: '10px 0',
        '& .MuiOutlinedInput-input': {
            color: '#53ddf0',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#7d5ffc', 
            },
            '&:hover fieldset': {
                borderColor: '#5e4bcc', // Border color on hover
            },
            '&.Mui-focused fieldset': {
                borderColor: '#4a3db8', // Border color when focused
            },
        },
    },

};

export default styles;