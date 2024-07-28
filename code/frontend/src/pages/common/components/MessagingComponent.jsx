import React, { useEffect, useState } from "react";
import { Container, IconButton, Drawer, Box, TextField, Button } from "@mui/material";
import { Message as MessageIcon, Notifications as NotificationIcon, Send as SendIcon } from "@mui/icons-material";
import Cookies from 'js-cookie';
import useTokenChecker from "../../../utils/useTokenChecker";

function MessagingComponent() {
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [receiver, setReceiver] = useState('');
    const [message, setMessage] = useState('');
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

    const handleNotification = () => {
        setShowNotifications(!showNotifications);
    }

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/getMessages?username=${username}`, {
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
    }, [userId, token, open, showNotifications]); // Dependencies to fetch messages


    const handleSendMessage = () => {
        
        const messageToSend = {
            user: userId,
            username: username,
            message: message,
            receiver: receiver,
        };
        
        fetch(`/api/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(messageToSend),
        }).then(response => {
            if (response.ok) {
                console.log('Message sent');
                setMessage('');
                setReceiver('');
            } else {
                console.error('Failed to send message');
            }
        }).catch(error => {
            console.error('Failed to send message', error);
        });
        
    }

    return (
        <Container>
            {open ? (
                <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                    <Box sx={{ width: 300, padding: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <h2>Messages</h2>
                            <IconButton onClick={handleNotification}>
                                <NotificationIcon />
                            </IconButton>
                        </Box>
                        {showNotifications && (
                            <Box>
                                {receivedMessages.length === 0 ? (<p>No messages</p>) : (
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
                                                <p>{msg.message}</p>
                                    </Box>
                                ))}
                                </Box>
                                )
                            }
                            </Box>
                        )}
                        <Box 
                        sx={{ 
                            marginTop: 2, 
                            border: '1px solid #ccc',
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
                            <TextField
                                sx={{
                                    
                                }}
                                label="Message"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <IconButton color="primary"
                                    onClick={handleSendMessage}
                                >
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </Drawer>
            ) : (
                <IconButton 
                    onClick={() => setOpen(true)}
                    sx={{ color: 'white'}}
                    >
                    <MessageIcon />
                </IconButton>
            )}
        </Container>
    );
}

export default MessagingComponent;
