import React, { useState } from 'react';
import { Card, CardActions, CardContent, IconButton, Typography, TextField, Menu, MenuItem, Select } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopy from '@mui/icons-material/ContentCopy';
import styles from './NotesListStyles.jsx';
import Cookies from 'js-cookie';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import AccessDialogButton from './AccessDialogButton.jsx';
import AccessDialog from './AccessDialog.jsx';
import { Accessibility, Check } from '@mui/icons-material';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import { set } from 'date-fns';
import { Checkbox } from '@mui/material';

function NotesList({ notes, setNotes, showSharedNotes, setShowSharedNotes, onNoteDeleted, onNoteModified, onCopyNote, isDesktop }) {
    const token = Cookies.get('token');
    const [order, setOrder] = useState('title-asc');
    const [anchorEl, setAnchorEl] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [access, setAccess] = useState('');
    const [users, setUsers] = useState([]);
    const [currentNote, setCurrentNote] = useState(null); // State to track the current note


    NotesList.defaultProps = {
        notes: []
    };

    const handleDeleteNote = async (id) => {
        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
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
                    access: copiedNote.access,
                    users: [],
                    creationDate: copiedNote.creationDate,
                    modificationDate: copiedNote.modificationDate,
                }),
            });
        }).then(responseCopy => {
            if (responseCopy.ok) {
                return responseCopy.json();
            }
            throw new Error('Failed to copy the note');
        }).then(addedNote => {
            onCopyNote(addedNote);
        }).catch(error => {
            console.error('Failed to copy the note', error);
        });
    };

    //const handleShareNote = (id) => {
    //    fetch(`/api/notes/${id}`, {
    //        method: 'POST',
    //        headers: {
    //            'Content-Type': 'application/json',
    //            'Authorization': `Bearer ${token}`,
    //        },
    //        body: JSON.stringify({
    //            email: email,
    //        }),
    //    }).then(response => {
    //        if (response.ok) {
    //            return response.json();
    //        }
    //        throw new Error('Failed to share the note');
    //    }).then(sharedNote => {
    //        console.log(sharedNote);
    //    }).catch(error => {
    //        console.error('Failed to share the note', error);
    //    });
    //};

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

    const handleMenu = (event, id) => {
        setAnchorEl(prev => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleClose = (id) => {
        setAnchorEl(prev => ({ ...prev, [id]: null }));
    };

    const handleOpenDialog = (note) => {
        console.log('Opening dialog for note', note);
        setCurrentNote(note);
        setOpen(true);
    };
    
    const handleCheckboxChange = (event) => {
        setShowSharedNotes(event.target.checked);
    };

    const filteredNotes = sortedNotes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            {isDesktop ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <TextField label="Search Notes" variant="outlined" fullWidth onChange={e => setSearchTerm(e.target.value)} style={styles.textField}
                        InputProps={{
                            style: {
                                color: '#53ddf0',
                            }
                        }}
                        InputLabelProps={{
                            style: {
                                color: '#7d5ffc',
                            }
                        }}
                    />

                    <Select
                        value={order}
                        onChange={handleOrderChange}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    color: '#53ddf0',
                                    backgroundColor: '#111119',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiSelect-select': {
                                color: '#7d5ffc',
                            }
                        }}
                    >
                        <MenuItem value="title-asc">Titolo Crescente</MenuItem>
                        <MenuItem value="title-desc">Titolo Decrescente</MenuItem>
                        <MenuItem value="creationDate-asc">Data di Creazione Crescente</MenuItem>
                        <MenuItem value="creationDate-desc">Data di Creazione Decrescente</MenuItem>
                        <MenuItem value="modificationDate-asc">Data di Modifica Crescente</MenuItem>
                        <MenuItem value="modificationDate-desc">Data di Modifica Decrescente</MenuItem>
                    </Select>
                    <Checkbox
                        name="Shared"
                        checked={showSharedNotes}
                        onChange={handleCheckboxChange}
                        style={{ color: '#53ddf0' }}
                        label="Show Shared Notes"
                    />     
                    <ul>
                        {filteredNotes.map((note) => (
                            <li key={note.id}>
                                <Typography variant="h5" onClick={() => onNoteModified(note.id)} style={{ cursor: 'pointer' }}>
                                    {note.title}
                                </Typography>
                                <IconButton aria-label="SetAccess" onClick={() => handleOpenDialog(note)} style={{ color: '#53ddf0' }}>
                                    <AccessibilityIcon />
                                </IconButton>
                                <IconButton aria-label="copy" onClick={() => handleCopyNote(note.id)} style={{ color: '#53ddf0' }}>
                                    <FileCopyIcon />
                                </IconButton>
                                <IconButton aria-label="delete" onClick={() => handleDeleteNote(note.id)} style={{ color: '#53ddf0' }}>
                                    <DeleteIcon />
                                </IconButton>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    <TextField label="Search Notes" variant="outlined" fullWidth onChange={e => setSearchTerm(e.target.value)} />
                    <Select
                        value={order}
                        onChange={handleOrderChange}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                    >
                        <MenuItem value="title-asc" sx>Titolo Crescente</MenuItem>
                        <MenuItem value="title-desc">Titolo Decrescente</MenuItem>
                        <MenuItem value="creationDate-asc">Data di Creazione Crescente</MenuItem>
                        <MenuItem value="creationDate-desc">Data di Creazione Decrescente</MenuItem>
                        <MenuItem value="modificationDate-asc">Data di Modifica Crescente</MenuItem>
                        <MenuItem value="modificationDate-desc">Data di Modifica Decrescente</MenuItem>
                    </Select>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                        {filteredNotes.map((note) => (
                            <Card key={note.id} sx={{ maxWidth: '300px', margin: '10px' }}>
                                <CardContent onClick={() => onNoteModified(note.id)} style={{ cursor: 'pointer' }}>
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
                                        <MenuItem onClick={() => handleOpenDialog(note)}>Set Access</MenuItem>
                                    </Menu>
                                </CardActions>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            <AccessDialog
                open={open}
                setOpen={setOpen}
                setAccess={setAccess}
                setUsers={setUsers}
                onConfirm={async (accessType, usersList) => {
                    console.log('Setting access for note', currentNote, accessType, usersList);
                    if (currentNote) {
                        try {
                            const response = await fetch(`/api/notes/${currentNote.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    title: currentNote.title,
                                    note: currentNote.note,
                                    userId: currentNote.userId,
                                    access: accessType,
                                    users: usersList,
                                    creationDate: currentNote.creationDate,
                                    modificationDate: currentNote.modificationDate,
                                }),
                            });
                            if (response.ok) {
                                const updatedNote = await response.json();
                                setNotes(prevNotes => prevNotes.map(note =>
                                    note.id === updatedNote.id ? updatedNote : note
                                ));
                                setCurrentNote(null); // Reset current note after setting access
                            } else {
                                console.error('Failed to update the note access and users');
                            }
                        } catch (error) {
                            console.error('Failed to update the note access and users', error);
                        }
                    }
                }}
            />

        </div>
    );
}

export default NotesList;
