import React, { useState, useEffect } from "react";
import styles from "./NotesPageStyles";
import NotesEditor from "./components/NotesEditor";
import { Container } from "@mui/material";
import NotesList from "./components/NotesList";
import Cookies from 'js-cookie';
import { CircularProgress, Box } from "@mui/material";
import useTokenChecker from "../../utils/useTokenChecker";
import { useNavigate } from "react-router-dom";

function NotesPage() {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [noteToModify, setNoteToModify] = useState(null);
    const token = Cookies.get('token');
    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const [userId, setUserId] = useState('');


    useEffect(() => {
        let timeoutId;
        const fetchUserId = async () => {
            if (!token || !username) return; // Verifica che il token e username siano disponibili
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
            } catch (error) {
                console.error('Failed to fetch user id', error);
            }

            // Imposta il timeout per la prossima fetch
            timeoutId = setTimeout(fetchUserId, 5000);
        };

        if (loginStatus && username) {
            fetchUserId(); // Esegui subito la fetch all'inizio
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId); // Cancella il timeout quando il componente si smonta
            }
        };
    }, [loginStatus, username, token, notes]); // Dipendenze appropriate


    useEffect(() => {
        if (!isTokenLoading) {
          if (!loginStatus) {
            navigate("/login");
          }
        }
    }, [loginStatus, isTokenLoading]);
    
      
    
    useEffect(() => {
        const fetchNotes = async (userId) => {
            try {
                const response = await fetch(`/api/notes?userId=${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const fetchedNotes = await response.json();
                    setNotes(fetchedNotes);
                } else {
                    console.error('Failed to fetch notes');
                }
            } catch (error) {
                console.error('Failed to fetch notes', error);
            }
        };

        fetchNotes(userId);
    }, [userId, token, loginStatus, username, notes]);

    const handleNoteAdded = (note) => {
        // Aggiorna lo stato delle note aggiungendo la nuova nota
        setNotes(prevNotes => {
            if (prevNotes.find(n => n.id === note.id)) {
                return prevNotes.map(n => n.id === note.id ? note : n);
            }
        })
    };

    const handleNoteDeleted = (id) => {
        setNotes(currentNotes => currentNotes.filter(note => note.id !== id));
    };
    
    const handleNoteModified = async (id) => {
        try {
            const response = await fetch(`/api/notes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const note = await response.json();
                setNoteToModify(note);
            } else {
                console.error('Failed to fetch the note');
            }
        } catch (error) {
            console.error('Failed to fetch the note', error);
        }
    };


    if (isTokenLoading || loginStatus === undefined) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
          </Box>
        );
    }

    if(loginStatus) {
        return (
            <Container sx={styles.container}>
                <NotesEditor onNoteAdded={handleNoteAdded} noteToModify={noteToModify} />
                <NotesList notes={notes} onNoteDeleted={handleNoteDeleted} onNoteModified={handleNoteModified} onCopyNote={handleNoteAdded} />
            </Container>
        );
    } else {
        <> </>;
    }
}

export default NotesPage;

