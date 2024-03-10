import React from "react";
import styles from "../timer/TimerPageStyles";
import NotesEditor from "./components/NotesEditor";
import { Container } from "@mui/material";

function NotesPage() {
    return (
        <Container sx = {styles.container}>
            <NotesEditor />
        </Container>
    );
};

export default NotesPage;
