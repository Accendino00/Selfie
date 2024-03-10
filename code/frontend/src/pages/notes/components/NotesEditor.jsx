import React, { useState } from 'react';
import { Paper, Button, Container, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// Assumi che questo sia un file di stile che hai creato
import styles from './NotesEditorStyles.jsx';

function NotesEditor() {
    const [notes, setNotes] = useState([]);
    const [noteInput, setNoteInput] = useState('');

    const handleAddNote = async () => {
        if (noteInput.trim()) {
            const newNote = noteInput.trim();
            try {
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ note: newNote }),
                });
                if (response.ok) {
                    const addedNote = await response.json(); // Assumi che il server restituisca l'appunto salvato
                    setNotes([...notes, addedNote]);
                    setNoteInput('');
                } else {
                    // Gestisci l'errore nel caso in cui la risposta non sia ok
                    console.error('Failed to save the note');
                }
            } catch (error) {
                console.error('Failed to save the note', error);
            }
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Rimuovi l'appunto dall'interfaccia utente se l'eliminazione sul server è riuscita
                const newNotes = notes.filter(note => note.id !== id);
                setNotes(newNotes);
            } else {
                console.error('Failed to delete the note');
            }
        } catch (error) {
            console.error('Failed to delete the note', error);
        }
    };

    const handleInputChange = (event) => {
        setNoteInput(event.target.value);
    };

    return (
        <Container sx={styles.container}>
            <Paper elevation={3} sx={styles.paper}>
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
                <List sx={styles.list}>
                    {notes.map((note, index) => (
                        <ListItem
                            key={index}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNote(note.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={note.content} /> {/* Assumendo che l'appunto abbia un attributo 'content' */}
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
}

export default NotesEditor;
