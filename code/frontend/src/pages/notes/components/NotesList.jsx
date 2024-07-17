import React, { useState } from 'react';
import { Paper, Button, Container, TextField, List, ListItem, ListItemText, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopy from '@mui/icons-material/ContentCopy';
// Assumi che questo sia un file di stile che hai creato
import styles from './NotesListStyles.jsx';
import Cookies from 'js-cookie';
import { Select, MenuItem } from '@mui/material';

function NotesList({ notes, onNoteDeleted, onNoteModified, onCopyNote }) { // Aggiungi onNoteDeleted come prop per gestire la cancellazione
    const token = Cookies.get('token');
    const [order, setOrder] = useState('title-asc');

    const handleDeleteNote = async (id) => {
        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                // Invece di aggiornare lo stato qui, invoca il callback prop
                onNoteDeleted(id);
            } else {
                console.error('Failed to delete the note');
            }
        } catch (error) {
            console.error('Failed to delete the note', error);
        }
    };

    const handleCopyNote = (id) => {
        fetch(`/api/notes/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to fetch the note');
        }).then(copiedNote => {
            return fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: copiedNote.title + ' (Copy)',
                    note: copiedNote.note,
                    userId: copiedNote.userId,
                    creationDate: copiedNote.creationDate,
                    modificationDate: copiedNote.modificationDate
                }),
            });
        }).then(responseCopy => {
            console.log(responseCopy.json());
            if (responseCopy.ok) {
                return responseCopy.json();
            }
            throw new Error('Failed to copy the note');
        }).then(addedNote => {
            onCopyNote(addedNote);
        }).catch(error => {
            console.error('Failed to copy the note', error);
        });
    }
    
    //volendo sarebbe da fare la ricerca dell'appunto 
    //volendo sarebbe da fare la ricerca dell'appunto 
    //volendo sarebbe da fare la ricerca dell'appunto 
    //volendo sarebbe da fare la ricerca dell'appunto 
    //volendo sarebbe da fare la ricerca dell'appunto 
    //volendo sarebbe da fare la ricerca dell'appunto 
    //volendo sarebbe da fare la ricerca dell'appunto 
    //volendo sarebbe da fare la ricerca dell'appunto 
    //volendo sarebbe da fare la ricerca dell'appunto 
    //volendo sarebbe da fare la ricerca dell'appunto 

    const handleOrderChange = (event) => {
        setOrder(event.target.value);
    };

    const sortedNotes = [...notes].sort((a, b) => {
        const [key, dir] = order.split('-');
        if (key === 'title') {
            return dir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (key === 'creationDate' || key === 'modificationDate') {
            return dir === 'asc' ? new Date(a[key]) - new Date(b[key]) : new Date(b[key]) - new Date(a[key]);
        }
    });

    return (
        <>
            <Select
                value={order}
                onChange={handleOrderChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
            >
                <MenuItem value="title-asc">Titolo Crescente</MenuItem>
                <MenuItem value="title-desc">Titolo Decrescente</MenuItem>
                <MenuItem value="creationDate-asc">Data di Creazione Crescente</MenuItem>
                <MenuItem value="creationDate-desc">Data di Creazione Decrescente</MenuItem>
                <MenuItem value="modificationDate-asc">Data di Modifica Crescente</MenuItem>
                <MenuItem value="modificationDate-desc">Data di Modifica Decrescente</MenuItem>
            </Select>
            <List>
                {sortedNotes.map((note) => (
                    <ListItem key={note.id}>
                        <ListItemText primary={note.title} />
                        <div>
                            <IconButton edge="end" aria-label="copy" onClick={() => handleCopyNote(note.id)}>
                                <ContentCopy />
                            </IconButton>
                            <IconButton edge="end" aria-label="add" onClick={() => onNoteModified(note.id)}>
                                <AddIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNote(note.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    </ListItem>
                ))}
            </List>
        </>
    );
}


export default NotesList;