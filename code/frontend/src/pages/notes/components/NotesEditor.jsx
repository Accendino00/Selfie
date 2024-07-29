import React, { useState, useEffect } from 'react';
import { Paper, Button, Container, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// Assumi che questo sia un file di stile che hai creato
import styles from './NotesEditorStyles.jsx';
import Cookies from 'js-cookie';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';
import MarkdownShortcuts from 'quill-markdown-shortcuts';
import useTokenChecker from '../../../utils/useTokenChecker';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import './styles.css';
import AccessDialog from './AccessDialog.jsx';
import { set } from 'date-fns';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

// Register the Markdown module with Quill
Quill.register('modules/markdownShortcuts', MarkdownShortcuts);

function NotesEditor({ onNoteAdded, noteToModify, setNoteToModify, setVisualizeEditor, clear, setClear }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [noteInput, setNoteInput] = useState('');
    const token = Cookies.get('token');
    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [access, setAccess] = useState('');
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const quillRef = React.useRef(null);


    useEffect(() => {
        if (clear) {
            setTitle('');
            setCategory('');
            setNoteInput('');
            setCharCount(0);
            console.log('clearing');
            setClear(false);
        }
    }, [clear, setClear]); // Make sure 'setClear' is stable, consider useCallback if needed
    
    // For setting userId based on login status
    useEffect(() => {
        if (loginStatus) {
            const fetchUserId = async () => {
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
                }
                catch (error) {
                    console.error('Failed to fetch user id', error);
                }
            }
            fetchUserId();
        }
    }, [loginStatus, username, token]); // Dependencies to fetch user ID

    const handleOpenDialog = () => {
        setOpen(true);
    };
    
    const handleAddNoteWithAccess = async (accessType, usersList) => {
        console.log('Adding note with access', accessType, usersList);
        const newNote = noteInput.trim();
        const newTitle = title.trim();
        const newCategory = category.trim();
        if (newNote && newTitle) {
            try {
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: newTitle,
                        category: newCategory,
                        note: newNote,
                        userId: userId,
                        owner: username,
                        characters: charCount,
                        access: accessType, // include access field
                        users: usersList, // include users field
                        creationDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        modificationDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    }),
                });
                if (response.ok) {
                    const addedNote = await response.json();
                    setTitle('');
                    setCategory('');
                    setNoteInput('');
                    setCharCount(0);
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
            console.error('Title and note content are required');
        }
    };


    const handleModifyNote = async () => {
        const newNote = noteInput.trim();
        const newTitle = title.trim();
        const newCategory = category.trim();
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
                        category: newCategory,
                        note: newNote,
                        userId: noteToModify.userId,
                        owner: noteToModify.owner,
                        characters: charCount,
                        access: noteToModify.access, // include access field
                        users: noteToModify.users, // include users field
                        creationDate: noteToModify.creationDate,
                        modificationDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    }),
                });
                if (response.ok) {
                    const modifiedNote = await response.json();
                    setTitle('');
                    setCategory('');
                    setNoteInput('');
                    setCharCount(0);
                    setNoteToModify(null);
                    setVisualizeEditor(false);
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
            setCategory(noteToModify.category);
            setNoteInput(noteToModify.note);
            setCharCount(noteToModify.characters);
        }
    }, [noteToModify]); // Depend on noteToModify to trigger effect


    const handleInputChange = (value) => {
        setNoteInput(value);
        if (quillRef.current) {
            const charCount = quillRef.current.getEditor().getLength() - 1; // Get character count
            setCharCount(charCount);
        }
    };
    

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };

    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            ['link', 'image'],
            ['clean'],
        ],
        markdownShortcuts: {},
    };

    return (
        <Container sx={styles.container}>
                <Typography variant="h4" sx={{
        marginTop: '0.5em',
        marginBottom: '1em',
        fontWeight: '800',
        fontSize: '1.1em',
        color: "#53ddf0",
        textAlign: 'center',
        }}>Note Editor</Typography>
            <Paper elevation={3} sx={styles.paper}>
                <TextField
                    label="Title"
                    variant="outlined"
                    value={title}
                    onChange={handleTitleChange}
                    sx={styles.textField}
                    fullWidth
                    InputProps={{
                        style: {
                            color: '#53ddf0',
                        }
                    }}
                    InputLabelProps={{
                        style: {
                            color: '#53ddf043',
                            fontStyle: "italic",
                        }
                    }}
                />

                <TextField
                    label="Category"
                    variant="outlined"
                    value={category}
                    onChange={handleCategoryChange}
                    sx={styles.textField}
                    fullWidth
                    InputProps={{
                        style: {
                            color: '#53ddf0',
                        }
                    }}
                    InputLabelProps={{
                        style: {
                            color: '#53ddf043',
                            fontStyle: "italic",
                        }
                    }}
                />

                <Grid container direction="column">
                    <Box display="flex" style={styles.quill}>
                        <ReactQuill ref={quillRef} theme="snow" value={noteInput} onChange={handleInputChange} modules={modules} style={styles.actualQuill} />
                    </Box>
                    <Box display="flex" sx={{ marginTop: '30px',
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignContent: "center",
                        flexDirection: "row",
                        alignItems: "baseline",
                     }}>
                        <span 
                            style={{ color: '#53ddf0', fontSize: '1rem', marginRight: 'auto', width: "10em", maxWidth: "100%" }}
                        >
                            Character Count: {charCount}</span>
                        {noteToModify ? (
                            <Button sx={styles.modifyButton} onClick={handleModifyNote} variant="contained">
                                Modifica Appunto
                            </Button>
                        ) : (
                            <Button sx={styles.addButton} onClick={handleOpenDialog} variant="contained">
                                Aggiungi Appunto
                            </Button>
                        )}
                    </Box>
                </Grid>
            </Paper>
            <AccessDialog
                open={open}
                setOpen={setOpen}
                setAccess={setAccess}
                setUsers={setUsers}
                note = {noteToModify ? noteToModify : null}
                onConfirm={handleAddNoteWithAccess} // Call this function when confirming the dialog
            />
        </Container>
    );
}

export default NotesEditor;
