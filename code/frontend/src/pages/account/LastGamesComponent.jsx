import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Typography,
  Divider,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  Replay,
  VisibilityOff,
} from "@mui/icons-material";
import styles from "./AccountPageStyles";
import ReplayComponent from "../replay/Replay.jsx";

import {
  PlayerVsPlayerIcon,
  PlayerVsComputerIcon,
  DailyChallengeIcon,
} from "../../utils/ModeIcons.jsx";

import Cookies from "js-cookie";

function LastGamesComponent({ username }) {
  // Andiamo a fare una fetch dei dati dell'account dell'utente
  // per poterli mostrare nella pagina.
  // Fino a quando la fetch non ritorna i dati, mostriamo uno skeleton.

  const [lastGamesData, setLastGamesData] = React.useState(null);
  const [playerRequesting, setPlayerRequesting] = React.useState(null); // Username dell'utente di chi è la pagina
  const [isLoading, setIsLoading] = React.useState(true);
  const [replayGameIndex, setReplayGameIndex] = useState(null);  //TODO : Ma usiamo sta variabile?
  const [gameHistory, setGameHistory] = useState(null);
  const [initialState, setInitialState] = useState(null);
  const navigate = useNavigate();
  let token = Cookies.get("token");

  useEffect(() => {
    if (replayGameIndex !== null) {
      setGameHistory(lastGamesData[replayGameIndex].matches.moves);
      setInitialState(lastGamesData[replayGameIndex].matches.board);
    }
  }, [replayGameIndex]);

  React.useEffect(() => {
    if (username) {
      fetch("/api/account/getLastGames/" + username, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.success) {
            setLastGamesData(data.lastGames);
            setPlayerRequesting(data.playerRequesting);
          }
          setIsLoading(false);
        });
    } else {
      fetch("/api/account/getLastGames/", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.success) {
            setLastGamesData(data.lastGames);
            setPlayerRequesting(data.playerRequesting);
          }
          setIsLoading(false);
        });
    }
  }, []);

  if (isLoading) {
    // Placeholder
    return (
      <Box sx={styles.BoxGeneral}>
        <Skeleton
          variant="rounded"
          width={700}
          height={35}
          sx={{ margin: "4px" }}
        />
        <Skeleton
          variant="rounded"
          width={700}
          height={35}
          sx={{ margin: "4px" }}
        />
      </Box>
    );
  }

  if (replayGameIndex !== null) {
    console.log("matches" + lastGamesData[replayGameIndex].matches);
    return (
      <ReplayComponent gameHistory={gameHistory} initialState={initialState} />
    );
  }
  // Placeholder
  return (
    <Box sx={styles.BoxGeneralUltimePartite}>
      <Typography variant="h5" sx={styles.TypographyUltimePartite}>
        Ultime partite
      </Typography>
      {lastGamesData &&
        lastGamesData.length > 0 &&
        lastGamesData.map((game, index) => (
          <div key={index}>
            <Grid container justifyContent="flex-end" alignItems="center">
              <Grid item xs={2}>
                <Box display="flex" alignItems="center">
                  {game.matches.gameData.vincitore === "p1" ? (
                    playerRequesting === game.Player1.username ? (
                      <>
                        <CheckCircle color="success" />
                        <Typography>Won</Typography>
                      </>
                    ) : (
                      <>
                        <Error color="error" />
                        <Typography>Lost</Typography>
                      </>
                    )
                  ) : playerRequesting === game.Player2.username ? (
                    <>
                      <CheckCircle color="success" />
                      <Typography>Won</Typography>
                    </>
                  ) : (
                    <>
                      <Error color="error" />
                      <Typography>Lost</Typography>
                    </>
                  )}
                </Box>
              </Grid>
              <Grid item xs={5}>
                <Typography style={{ fontSize: "12px" }}>
                  <Typography style={{ fontSize: "9px" }}>VS</Typography>{" "}
                  {game.Player1.username === username
                    ? game.Player2.username
                    : game.Player1.username}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>
                  <Typography style={{ fontSize: "9px" }}>
                    Data{" "}
                    {(
                      "0" + new Date(game.matches.dataOraInizio).getHours()
                    ).slice(-2) +
                      ":" +
                      (
                        "0" + new Date(game.matches.dataOraInizio).getMinutes()
                      ).slice(-2) +
                      " - " +
                      (
                        "0" + new Date(game.matches.dataOraInizio).getDate()
                      ).slice(-2) +
                      "/" +
                      (
                        "0" +
                        (new Date(game.matches.dataOraInizio).getMonth() + 1)
                      ).slice(-2) +
                      "/" +
                      new Date(game.matches.dataOraInizio).getFullYear()}
                  </Typography>{" "}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Box display="flex" justifyContent="flex-end">
                  {game.matches.mode === "playerVsPlayerOnline" ? (
                    <PlayerVsPlayerIcon />
                  ) : game.matches.mode === "playerVsComputer" ? (
                    <PlayerVsComputerIcon />
                  ) : game.matches.mode === "dailyChallenge" ? (
                    <DailyChallengeIcon />
                  ) : (
                    <VisibilityOff style={{
                      width : "24px",
                      height : "24px",
                      marginTop : "auto",
                      marginBottom : "auto",
                    }} />
                  )}
                  <IconButton
                    disabled={game.matches.mode === "kriegspiel"}
                    onClick={() => {
                      const gameHistory = lastGamesData[index].matches.moves;
                      const initialState = lastGamesData[index].matches.board;
                      navigate(`/replay/${username}/${index}`, { state: { gameHistory, initialState } });
                    }}
                  >
                    <Replay />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
            {<Divider style={{ width: "500px" }} />}
          </div>
        ))}
      {lastGamesData <= 0 && (
        <Typography>Non ci sono partite da mostrare</Typography>
      )}
    </Box>
  );
}

export default LastGamesComponent;
