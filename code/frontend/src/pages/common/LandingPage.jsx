// LandingPage.js
import React from 'react';
import useTokenChecker from '../../utils/useTokenChecker.jsx';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const { loginStatus, isTokenLoading} = useTokenChecker();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isTokenLoading) {
      if (loginStatus) {
        navigate("/home");
      } else {
        navigate("/login");
      }
    }
  }, [loginStatus, isTokenLoading]);

  if (isTokenLoading || loginStatus === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Renderizza nulla, perché il redirect viene fatto in useEffect
  return null;
}

export default LandingPage;