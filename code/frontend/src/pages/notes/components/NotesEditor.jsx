import React, { useState } from 'react';
import { Paper, Button, Container, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// Assumi che questo sia un file di stile che hai creato
import styles from './NotesEditorStyles.jsx';
import Cookies from 'js-cookie';

function NotesEditor({ onNoteAdded }) {
    const [title, setTitle] = useState('');
    const [noteInput, setNoteInput] = useState('');
    const token = Cookies.get('token');

    const handleAddNote = async () => {
        const newNote = noteInput.trim();
        if (newNote) { // Aggiunto controllo su entrambi i campi
            try {
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: title,
                        note: newNote
                    }),
                });
                if (response.ok) {
                    const addedNote = await response.json();
                    setTitle('');
                    setNoteInput('');
                    if (onNoteAdded) {
                        onNoteAdded(addedNote);
                    }
                } else {
                    console.error('Failed to save the note');
                }
            } catch (error) {
                console.error('Failed to save the note', error);
            }
        } else {
            // Opzionalmente, gestisci il caso in cui uno dei campi è vuoto
            console.error('Title and note content are required');
        }
    };



    const handleInputChange = (event) => {
        setNoteInput(event.target.value);
    };

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    return (
        <Container sx={styles.container}>
            <Paper elevation={3} sx={styles.paper}>
                <TextField
                    label="Title"
                    variant="outlined"
                    value={title}
                    onChange={handleTitleChange}
                    sx={styles.textField}
                    fullWidth
                />
                <TextField
                    label="Nuovo appunto"
                    variant="outlined"
                    value={noteInput}
                    onChange={handleInputChange}
                    sx={styles.textField}
                    fullWidth
                />
                <Button sx={styles.addButton} onClick={handleAddNote} variant="contained" color="primary">
                    Aggiungi Appunto
                </Button>
            </Paper>
        </Container>
    );
}

export default NotesEditor;
