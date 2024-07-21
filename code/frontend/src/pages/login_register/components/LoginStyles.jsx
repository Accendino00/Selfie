
const styles = {
  grid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
    justifyContent: 'center',
    overflow: 'hidden',
    direction: 'column',
  },
  gridButtons: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 16,
    padding: '6px 12px',
    border: '1px solid',
    lineHeight: 1.5,
    backgroundColor: '#7d5ffc',
    borderColor: '#000000',
    borderBlockColor: '#000000',
    color: '#53ddf0',
    '&:hover': {
      backgroundColor: '#000000',
      borderColor: '#000000',
      boxShadow: 'none',
      borderBlockColor: '#000000',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: '#000000',
      borderColor: '#000000',
      borderBlockColor: '#000000',
    },



  },
  usernameTextField: {
    '& label': {
      color: '#7d5ffc',
    },

    '& label.Mui-focused': {
      color: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:after': {
      borderBottomColor: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:before': {
      borderBottomColor: '#53ddf0',
    },
    '& .MuiInputBase-input': {
            color: '#53ddf0', 
      }
  },
  passwordTextField: {
    '& label': {
      color: '#7d5ffc',
    },
    '& label.Mui-focused': {
      color: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:after': {
      borderBottomColor: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:before': {
      borderBottomColor: '#53ddf0',
    },
    '& .MuiInputBase-input': {
            color: '#53ddf0', 
      }



  },

  confirmPasswordTextField: {
    '& label': {
      color: '#7d5ffc',
    },
    '& label.Mui-focused': {
      color: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:after': {
      borderBottomColor: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:before': {
      borderBottomColor: '#53ddf0',
    },
    '& .MuiInputBase-input': {
            color: '#53ddf0',
      }
  },

  truenameTextField: {
    '& label.Mui-focused': {
      color: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:after': {
      borderBottomColor: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:before': {
      borderBottomColor: '#53ddf0',
    },
    '& .MuiInputBase-input': {
            color: '#53ddf0', 
      }
  },


  birthdateTextField: {
    '& .MuiInputBase-input::placeholder': {
      color: '#7d5ffc',
      opacity: 1, // Ensure the color is applied
    },
    '& .MuiInputLabel-root': {
      color: '#7d5ffc', // Optional: Change base label color
    },
    '& label': {
      color: '#7d5ffc',
    },
    '& label.Mui-focused': {
      color: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:after': {
      borderBottomColor: '#7d5ffc',
    },
    '& .MuiFilledInput-underline:before': {
      borderBottomColor: '#53ddf0',
    },
    '& .MuiInputBase-input': {
            color: '#53ddf0',
      }
  },

  registerButton: {
    color: "#53ddf0",
    textDecoration: 'underline',
    textDecorationColor: '#53ddf0',
    '&:hover': {
      textDecoration: 'underline',
      textDecorationColor: '#6681df',
    },
  },

  titleStyle: {
    margin: "0px 35px 0px -35px",
    color: "rgb(0 0 0)",
    fontWeight: "700",
    textShadow: "rgba(0, 0, 0, 0.5) 2px 2px 3px",
    fontFamily: "Lato, sans-serif",
  },
};

export default styles;
