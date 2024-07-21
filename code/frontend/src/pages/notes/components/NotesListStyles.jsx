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
        '& label': {
            color: '#53ddf0', // Base label color
        },
        '& label.Mui-focused': {
            color: '#53ddf0', // Focused label color
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#53ddf0', // Base border color
            },
            '&:hover fieldset': {
                borderColor: '#53ddf0', // Hover border color
            },
            '&.Mui-focused fieldset': {
                borderColor: '#53ddf0', // Focused border color
            },
        },
    },

};

export default styles;