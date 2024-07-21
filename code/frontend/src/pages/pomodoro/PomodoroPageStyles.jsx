import { Height } from "@mui/icons-material";

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#111119',
        height: '100vh'
    },
    heading: {
        marginBottom: '20px'
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
    button: {
        margin: '5px',
        width: '200px'
    }
};



export default styles;

