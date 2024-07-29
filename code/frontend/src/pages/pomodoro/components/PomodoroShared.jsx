import React, { useEffect, useState } from "react";
import { Container, IconButton, Drawer, Box, TextField, Button } from "@mui/material";
import { Message as MessageIcon, Notifications as NotificationIcon, Send as SendIcon } from "@mui/icons-material";
import Cookies from 'js-cookie';
import useTokenChecker from "../../../utils/useTokenChecker";
import ShareIcon from '@mui/icons-material/Share';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


function PomodoroShared({ setStudyTime, setBreakTime, setCycles, setTotalMinutes, setCreationDate }) {
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const [receivedMessages, setReceivedMessages] = useState([]);
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

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/getPomodoros?username=${username}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const fetchedMessages = await response.json();
                    setReceivedMessages(fetchedMessages);
                    console.log('Messages fetched:', fetchedMessages);
                } else {
                    console.error('Failed to fetch messages');
                }
            } catch (error) {
                console.error('Failed to fetch messages', error);
            }
        }
        fetchMessages();
    }, [userId, token, open]); // Dependencies to fetch messages

    const handleUseSettings = async (messageId) => {
        console.log('Using settings:', messageId);
        try {
            const response = await fetch(`/api/deletePomodoro?pomodoroId=${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                console.log('Settings deleted');
            } else {
                console.error('Failed to delete settings');
            }
        }
        catch (error) {
            console.error('Failed to delete settings', error);
        }
    }


    return (
        <Container sx={{
            width: "fit-content",
            marginTop: "1em",
        }}>
            {open && (
                <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                    <Box sx={{ width: 300, maxWidth: "90vw", padding: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <h2>Settings Shared With You</h2>
                        </Box>
                        <Box>
                            {receivedMessages.length === 0 ? (<p>No settings</p>) : (
                                <Box
                                    sx={{
                                        maxHeight: 150,
                                        overflowY: 'auto',
                                        border: '1px solid #ccc',
                                        borderRadius: 4,
                                        padding: 2,
                                    }}
                                >
                                    {receivedMessages.map((msg, index) => (
                                        <Box key={index} sx={{ marginBottom: 2 }}>
                                            <h5>From: {msg.username}</h5>
                                            <p>{msg.studyTime}</p>
                                            <p>{msg.breakTime}</p>
                                            <p>{msg.cycles}</p>
                                            <p>{msg.totalMinutes}</p>
                                            <Button onClick={() => {
                                                setStudyTime(receivedMessages[index].studyTime);
                                                setBreakTime(receivedMessages[index].breakTime);
                                                setCycles(receivedMessages[index].cycles);
                                                setTotalMinutes(receivedMessages[index].totalMinutes);
                                                handleUseSettings(msg._id);
                                            }}>Use these settings</Button>
                                        </Box>
                                    ))}
                                </Box>

                            )
                            }
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
                <FolderSharedIcon />
                <span style={{ marginLeft: "0.5em" }}>Ricevuti</span>
            </Button>
        </Container>
    );
}

export default PomodoroShared;
