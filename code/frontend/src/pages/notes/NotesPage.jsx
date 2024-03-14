import React, { useState, useEffect } from "react";
import styles from "./NotesPageStyles";
import NotesEditor from "./components/NotesEditor";
import { Container } from "@mui/material";
import NotesList from "./components/NotesList";
import Cookies from 'js-cookie';

function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [noteToModify, setNoteToModify] = useState(null);
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
    

    return (
        <Container sx={styles.container}>
            <NotesEditor onNoteAdded={handleNoteAdded} noteToModify={noteToModify} />
            <NotesList notes={notes} onNoteDeleted={handleNoteDeleted} onNoteModified={handleNoteModified} />
        </Container>
    );
}

export default NotesPage;

