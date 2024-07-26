import React from "react";
import { IconButton } from "@mui/material";
import { Accessibility } from "@mui/icons-material";
import AccessDialog from "./AccessDialog";

function AccessDialogButton({ open, setOpen, setAccess, setUsers, onConfirm }) {
    return (
        <>
            <IconButton color="inherit" onClick={() => setOpen(true)}>
                <Accessibility />
            </IconButton>
            <AccessDialog open={open} setOpen={setOpen} setAccess={setAccess} setUsers={setUsers} onConfirm={onConfirm} />
        </>
    );
}

export default AccessDialogButton;