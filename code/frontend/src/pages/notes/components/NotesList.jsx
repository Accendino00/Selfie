import React, { useState } from 'react';
import { Card, CardActions, CardContent, IconButton, Typography, TextField, Menu, MenuItem, Select } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopy from '@mui/icons-material/ContentCopy';
// Assumi che questo sia un file di stile che hai creato
import styles from './NotesListStyles.jsx';
import Cookies from 'js-cookie';


function NotesList({ notes, setNotes, onNoteDeleted, onNoteModified, onCopyNote }) { // Aggiungi onNoteDeleted come prop per gestire la cancellazione
    const token = Cookies.get('token');
    const [order, setOrder] = useState('title-asc');
    const [anchorEl, setAnchorEl] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

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

    console.log(notes);


    const sortedNotes = [...notes].sort((a, b) => {
        const [key, dir] = order.split('-');
        if (key === 'title') {
            return dir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (key === 'creationDate' || key === 'modificationDate') {
            return dir === 'asc' ? new Date(a[key]) - new Date(b[key]) : new Date(b[key]) - new Date(a[key]);
        }
    });

    const handleMenu = (event, id) => {
        setAnchorEl(prev => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleClose = (id) => {
        setAnchorEl(prev => ({ ...prev, [id]: null }));
    };

    const filteredNotes = sortedNotes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <TextField label="Search Notes" variant="outlined" fullWidth onChange={e => setSearchTerm(e.target.value)} />
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
            {filteredNotes.map((note) => (
                <Card key={note.id} sx={styles.card}>
                    <CardContent>
                        <Typography variant="h5">{note.title}</Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                        <IconButton aria-label="settings" onClick={(e) => handleMenu(e, note.id)}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl[note.id]}
                            keepMounted
                            open={Boolean(anchorEl[note.id])}
                            onClose={() => handleClose(note.id)}
                        >
                            <MenuItem onClick={() => handleCopyNote(note.id)}>Copy</MenuItem>
                            <MenuItem onClick={() => handleDeleteNote(note.id)}>Delete</MenuItem>
                        </Menu>
                        <IconButton onClick={() => onNoteModified(note.id)}>
                            <AddIcon />
                        </IconButton>
                    </CardActions>
                </Card>
            ))}
        </div>
    );
}


export default NotesList;