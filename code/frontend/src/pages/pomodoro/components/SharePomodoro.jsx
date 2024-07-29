import React, { useEffect, useState } from "react";
import { Container, IconButton, Drawer, Box, TextField, Button, Paper } from "@mui/material";
import { Message as MessageIcon, Notifications as NotificationIcon, Send as SendIcon } from "@mui/icons-material";
import Cookies from 'js-cookie';
import useTokenChecker from "../../../utils/useTokenChecker";
import ShareIcon from '@mui/icons-material/Share';

function SharePomodoro({ studyTime, breakTime, cycles, totalMinutes, creationDate }) {
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const [receiver, setReceiver] = useState('');
    const token = Cookies.get('token');
    const { loginStatus, isTokenLoading, username } = useTokenChecker();

    useEffect(() => {
        if (loginStatus) {
            const fetchUserId = async () => {
                try {
                    const response = await fetch(`/api/getUserId?username=${username}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const fetchedUserId = await response.json();
                        setUserId(fetchedUserId);
                    } else {
                        console.error('Failed to fetch user id');
                    }
                }
                catch (error) {
                    console.error('Failed to fetch user id', error);
                }
            }
            fetchUserId();
        }
    }, [loginStatus, username, token]); // Dependencies to fetch user ID


    const handleSendMessage = () => {

        const messageToSend = {
            user: userId,
            username: username,
            receiver: receiver,
            studyTime: studyTime,
            breakTime: breakTime,
            cycles: cycles,
            totalMinutes: totalMinutes,
            creationDate: creationDate,
        };

        console.log('message', messageToSend)
        console.log("json", JSON.stringify(messageToSend));

        fetch(`/api/sendPomodoro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(messageToSend),
        }).then(response => {
            if (response.ok) {
                console.log('Message sent');
                setReceiver('');
                setOpen(false);
            } else {
                console.error('Failed to send message');
            }
        }).catch(error => {
            console.error('Failed to send message', error);
        });

    }

    return (
        <Container sx={{
            width: "fit-content",
            marginTop: "1em",
        }}>
            {open && (
                <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)}>
                    <Box
                        sx={{
                            marginTop: 2,
                            padding: 2,
                        }}
                    >
                        <TextField
                            sx={{
                                marginTop: 2,
                            }}
                            label="Receiver"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton color="primary"
                                onClick={handleSendMessage}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Drawer>
            )}
            <Button
                onClick={() => setOpen(true)}
                sx={{
                    color: 'white',
                    borderRadius: "5px",
                    backgroundColor: "#7d5ffc",
                }}
            >
                <ShareIcon />
                <span style={{ marginLeft: "0.5em" }}>Condividi</span>
            </Button>
        </Container>
    );
}

export default SharePomodoro;
