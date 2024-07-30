import React, { useState } from 'react';
import { Card, CardActions, CardContent, IconButton, Typography, TextField, Menu, MenuItem, Select, Paper } from '@mui/material';
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
import { Box } from '@mui/material';
import { Form } from 'react-router-dom';
import { FormControlLabel } from '@mui/material';
import parse from 'html-react-parser';
import useTokenChecker from '../../../utils/useTokenChecker.jsx';
import './stylesList.css';
import { useNavigate } from 'react-router-dom';

import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import FilterAltIcon from '@mui/icons-material/FilterAlt';

function NotesList({ notes, setNotes, showSharedNotes, setShowSharedNotes, onNoteDeleted, onNoteModified, onCopyNote, isDesktop, user }) {
    const token = Cookies.get('token');
    const [order, setOrder] = useState('title-asc');
    const [anchorEl, setAnchorEl] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [access, setAccess] = useState('');
    const [users, setUsers] = useState([]);
    const [currentNote, setCurrentNote] = useState(null); // State to track the current note
    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const navigate = useNavigate();


    NotesList.defaultProps = {
        notes: []
    };

    const handleDeleteNote = async (id) => {
        handleClose(id);
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
        handleClose(id);
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
            let newAccess;
            if (copiedNote.access === 'public') {
                newAccess = 'private';
            } else {
                newAccess = copiedNote.access;
            }
            return fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: copiedNote.title + ' (Copy)',
                    category: copiedNote.category,
                    note: copiedNote.note,
                    userId: user,
                    owner: username,
                    characters: copiedNote.characters,
                    access: newAccess,
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

    const handleOrderChange = (event) => {
        setOrder(event.target.value);
    };

    const sortedNotes = [...notes].sort((a, b) => {
        const [key, dir] = order.split('-');
        if (key === 'title') {
            return dir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (key === 'creationDate' || key === 'modificationDate') {
            return dir === 'asc' ? new Date(a[key]) - new Date(b[key]) : new Date(b[key]) - new Date(a[key]);
        } else if (key === 'length') {
            return dir === 'asc' ? a.characters - b.characters : b.characters - a.characters;
        }
    });

    const handleMenu = (event, id) => {
        setAnchorEl(prev => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleClose = (id) => {
        setAnchorEl(prev => ({ ...prev, [id]: null }));
    };

    const handleOpenDialog = (note) => {
        handleClose(note.id);
        console.log('Opening dialog for note', note);
        setCurrentNote(note);
        setOpen(true);
    };

    const handleCheckboxChange = (event) => {
        setShowSharedNotes(event.target.checked);
    };

    const filteredNotes = sortedNotes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <Box sx={{
            backgroundColor: "#111119",
            marginTop: "20px",
            marginBottom: "20px",
            borderRadius: "20px",
            paddingBottom: "20px",
        }}>
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
                <Accordion sx={{ backgroundColor: '#1d1d2f', color: 'white', width: "100%", borderRadius: "20px 20px 0px 0px", marginBottom: "20px" }}>
                    <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ backgroundColor: '#7d5ffc', borderRadius: "19px 19px 0px 0px" }}>
                        <Typography> <FilterAltIcon /> Filter notes</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ backgroundColor: '#1d1d2f', borderRadius: "20px 20px 0px 0px" }}>
                        <Box style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: "20px",
                            marginTop: "20px",
                        }}>
                            <TextField label="Search Notes" variant="outlined" fullWidth onChange={e => setSearchTerm(e.target.value)}
                                InputProps={{
                                    style: {
                                        color: '#53ddf0',
                                    }
                                }}
                                InputLabelProps={{
                                    style: {
                                        color: '#7d5ffc',

                                    }
                                }} />
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
                                            fontWeight: 'bold',
                                            backgroundColor: '#111119',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }}
                                sx={{
                                    width: "100%",
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
                                <MenuItem value="length-asc">Lunghezza Note Crescente</MenuItem>
                                <MenuItem value="length-desc">Lunghezza Note Decrescente</MenuItem>
                            </Select>
                            <FormControlLabel
                                control={<Checkbox
                                    checked={showSharedNotes}
                                    onChange={handleCheckboxChange}
                                    style={{ color: '#53ddf0' }}
                                />}
                                label="Show Shared"
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Box style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                }}>
                    {filteredNotes.map((note) => (
                        <Box key={note.id} style={{

                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: "#111119",
                            borderRadius: "10px",
                            boxShadow: "0px 0px 0px #53ddf063",
                            padding: "8px",
                            margin: "5px",
                        }}>
                            <Card key={note.id} sx={{
                                maxWidth: '300px',
                                margin: '10px',
                                padding: '10px',
                                height: "208px",
                                width: "147px",
                                overflow: "hidden",
                            }}
                            >
                                <CardContent onClick={() => onNoteModified(note.id)} style={{ cursor: 'pointer' }}>
                                    <Typography variant="body2" component="div"
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            textAlign: 'justify',
                                            textShadow: "0px 0px 0px white !important",

                                            zoom: "0.3",
                                            overflowWrap: "break-word",
                                            textWrap: "wrap",
                                            height: "370px",
                                        }}
                                    >{parse(note.note.substring(0, 200))}</Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <IconButton aria-label="settings" onClick={(e) => handleMenu(e, note.id)}
                                        sx={{
                                            position: 'relative',
                                            left: '80%',
                                        }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        id="simple-menu"
                                        anchorEl={anchorEl[note.id]}
                                        keepMounted
                                        open={Boolean(anchorEl[note.id])}
                                        onClose={() => handleClose(note.id)}
                                        sx={{
                                            '& .MuiMenu-paper': {
                                                backgroundColor: '#111119',
                                                color: '#53ddf0',
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                    >
                                        <MenuItem onClick={() => handleCopyNote(note.id)}>Copy</MenuItem>
                                        {((note.access === 'specified' && note.users.includes(user)) || note.access === 'private' || note.userId === user) &&
                                            <MenuItem onClick={() => handleDeleteNote(note.id)}>Delete</MenuItem>}
                                        {note.userId === user &&
                                            <MenuItem onClick={() => handleOpenDialog(note)}>Set Access</MenuItem>}
                                    </Menu>
                                </CardActions>
                            </Card>
                            <Box sx={{
                                width: "147px",
                                display: "flex",
                                flexDirection: "column",
                                flexWrap: "wrap",
                                backgroundColor: "#111119",
                                borderRadius: "10px",
                                boxShadow: note.owner == username ? "1px 1px 0px rgb(238 79 252), -1px -1px 0px #7d5ffc" : "1px 1px 0px #5ffcf6, -1px -1px 0px rgb(255 244 43)",
                                padding: "8px",
                                margin: "5px",
                                marginTop: "0px",
                                marginBottom: "9px",
                            }}>
                                <Typography variant="caption" sx={{
                                    fontSize: "0.65em",
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    justifyContent: "space-between",
                                    alignItems: "baseline",
                                }} color="#ffffff88">Title  <span style={{ fontSize: "1.7em", color: "#53ddf0" }}> {note.title} </span></Typography>
                                <Divider color="#fff" sx={{ height: "0px !important", color: "#ffffff55" }} />
                                <Typography variant="caption" sx={{
                                    fontSize: "0.5em",
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    justifyContent: "space-between",
                                    alignItems: "baseline",
                                    lineHeight: "2",
                                }} color="#ffffff88">Creation Date  <span style={{ fontSize: "1.5em", color: "#53ddf0" }}>{new Date(note.creationDate).toLocaleDateString()}</span></Typography>
                                <Divider sx={{ height: "0px !important", color: "#ffffff55" }} />
                                <Typography variant="caption" sx={{
                                    fontSize: "0.65em",
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    justifyContent: "space-between",
                                    alignItems: "baseline",
                                }} color="#ffffff88">Owner  <span style={{ fontSize: "1.2em", color: "#53ddf0" }}>{note.owner}</span></Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
            <AccessDialog
                open={open}
                setOpen={setOpen}
                setAccess={setAccess}
                setUsers={setUsers}
                note={currentNote}
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
                                    category: currentNote.category,
                                    note: currentNote.note,
                                    userId: currentNote.userId,
                                    owner: currentNote.owner,
                                    characters: currentNote.characters,
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

        </Box>
    );
}

export default NotesList;
