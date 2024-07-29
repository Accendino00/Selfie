import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Checkbox,
  FormControlLabel,
  TextField,
  Button
} from "@mui/material";
import { set } from "date-fns";

function AccessDialog({ open, setOpen, setAccess, setUsers, onConfirm, note }) {
  const [userInput, setUserInput] = useState("");
  const [users, updateUsers] = useState(note != null ? note.users && note.users.length > 0 ? note.users : [] : []);
  const [checkedPrivate, setCheckedPrivate] = useState(note != null ? note.access === "private" : false);
  const [checkedPublic, setCheckedPublic] = useState(note != null ? note.access === "public" : false);
  const [checkedSpecified, setCheckedSpecified] = useState(note != null ? note.access === "specified" : false);

  useEffect(() => {
    if (note != null) {
      setCheckedPrivate(note.access === "private");
      setCheckedPublic(note.access === "public");
      setCheckedSpecified(note.access === "specified");
      updateUsers(note.users && note.users.length > 0 ? note.users : []);
    }
  }, [note]);

  const handleClose = () => {
    setOpen(false);
    setUserInput("");
  };

  const handleConfirm = () => {
    const accessType = checkedPrivate ? "private" : checkedPublic ? "public" : "specified";
    setAccess(accessType);
    setUsers(users);
    onConfirm(accessType, users); // Pass the access type and users to the callback
    handleClose();
    };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (name === "private") {
      setCheckedPrivate(checked);
      setCheckedPublic(false);
      setCheckedSpecified(false);
    } else if (name === "public") {
      setCheckedPrivate(false);
      setCheckedPublic(checked);
      setCheckedSpecified(false);
    } else if (name === "specified") {
      setCheckedPrivate(false);
      setCheckedPublic(false);
      setCheckedSpecified(checked);
    }
  };

  const handleUserAdd = () => {
    if (userInput.trim() !== "") {
      const updatedUsers = [...users, userInput.trim()];
      updateUsers(updatedUsers);
      setUserInput("");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Lista di Accesso</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Checkbox
              name="private"
              checked={checkedPrivate}
              onChange={handleCheckboxChange}
            />
          }
          label="Private"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="public"
              checked={checkedPublic}
              onChange={handleCheckboxChange}
            />
          }
          label="Public"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="specified"
              checked={checkedSpecified}
              onChange={handleCheckboxChange}
            />
          }
          label="Specified"
        />
        {checkedSpecified && (
          <div>
            <TextField
              label="Add User"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <Button onClick={handleUserAdd}>Add</Button>
            <div>
              <ul>
                {users.map((user, index) => (
                  <li key={index}>{user}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <Button onClick={handleConfirm}>Confirm</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogContent>
    </Dialog>
  );
}

export default AccessDialog;
