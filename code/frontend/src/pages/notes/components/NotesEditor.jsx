import React, { useState, useEffect } from 'react';
import { Paper, Button, Container, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// Assumi che questo sia un file di stile che hai creato
import styles from './NotesEditorStyles.jsx';
import Cookies from 'js-cookie';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function NotesEditor({ onNoteAdded, noteToModify }) {
    const [title, setTitle] = useState('');
    const [noteInput, setNoteInput] = useState('');
    const token = Cookies.get('token');

    const handleAddNote = async () => {
        const newNote = noteInput.trim();
        const newTitle = title.trim();
        if (newNote) { // Aggiunto controllo su entrambi i campi
            try {
                console.log('Adding note', newTitle, newNote);
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: newTitle,
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
    };// Ensure useEffect is imported


    const handleModifyNote = async () => {
        const newNote = noteInput.trim();
        const newTitle = title.trim();
        if (newNote) { // Aggiunto controllo su entrambi i campi
            try {
                console.log('Modifying note', newTitle, newNote);
                const response = await fetch(`/api/notes/${noteToModify.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: newTitle,
                        note: newNote
                    }),
                });
                if (response.ok) {
                    console.log(response);
                    const modifiedNote = await response.json();
                    setTitle('');
                    setNoteInput('');
                    if (onNoteAdded) {
                        onNoteAdded(modifiedNote);
                    }
                } else {
                    console.error('Failed to modify the note');
                }
            } catch (error) {
                console.error('Failed to modify the note', error);
            }
        } else {
            // Opzionalmente, gestisci il caso in cui uno dei campi è vuoto
            console.error('Title and note content are required');
        }
    };

    // Inside the NotesEditor component:
    useEffect(() => {
        if (noteToModify) {
            setTitle(noteToModify.title);
            setNoteInput(noteToModify.note);
        }
    }, [noteToModify]); // Depend on noteToModify to trigger effect


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
                <ReactQuill theme="snow" value={noteInput} onChange={setNoteInput} />
                {noteToModify ? <Button sx={styles.modifyButton} onClick={handleModifyNote} variant="contained" color="primary">
                    Modifica Appunto
                </Button> : <Button sx={styles.addButton} onClick={handleAddNote} variant="contained" color="primary">
                    Aggiungi Appunto
                </Button>}
            </Paper>
        </Container>
    );
}

export default NotesEditor;
