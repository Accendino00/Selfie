import React, { useState, useEffect } from "react";
import styles from "./NotesPageStyles";
import NotesEditor from "./components/NotesEditor";
import { Container } from "@mui/material";
import NotesList from "./components/NotesList";
import Cookies from 'js-cookie';

function NotesPage() {
    const [notes, setNotes] = useState([]);
    const token = Cookies.get('token');

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch('/api/notes', {
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

        fetchNotes();
    }, []);

    const handleNoteAdded = (note) => {
        // Aggiorna lo stato delle note aggiungendo la nuova nota
        setNotes(prevNotes => [...prevNotes, note]);
    };

    const handleNoteDeleted = (id) => {
        setNotes(currentNotes => currentNotes.filter(note => note.id !== id));
    };
    

    return (
        <Container sx={styles.container}>
            <NotesEditor onNoteAdded={handleNoteAdded} />
            <NotesList notes={notes} onNoteDeleted={handleNoteDeleted}/>
        </Container>
    );
}

export default NotesPage;

