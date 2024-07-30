import { ICalendar } from 'datebook'
import React from 'react'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import useTokenChecker from '../../utils/useTokenChecker';
import { Button, Dialog } from '@mui/material';


const Datebook = ({ events }) => {
    const token = Cookies.get('token');
    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const [open, setOpen] = useState(false);

    function addDaysToDate(days) {
        const currentDate = new Date(); // Get the current date
        currentDate.setDate(currentDate.getDate() + days); // Add 14 days
        return currentDate;
    }

    const calculateWeeks = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const differenceInTime = end.getTime() - today.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        const differenceInWeeks = Math.floor(differenceInDays / 7);
        return differenceInWeeks;
    };

    const setupEvent = (event) => {
        // standardizzo le date per assicurarmi che siano utili
        if (event) {


            let newEnd = null;
            if (event.end === null || event.end === "") {
                newEnd = new Date(2026, 0, 1)
            }

            //calcolo recurrence frequency (daily o weekly)
            //se l'evento ha daysOfWeek.length === 1, allora e' weekly
            let frequency = null;
            let weekdays = [];
            let count = 0;
            if (event.isRecurring) {
                // se ho daysofweek, allora devo metterlo per forza weekly perche'
                // datebook me lo richiede per settare i weekdays

                if (event.daysOfWeek) {
                    frequency = "WEEKLY";
                    weekdays = event.daysOfWeek;
                    newEnd = new Date(event.start);
                    if (event.timesToRepeat != 0 && event.timesToRepeat != '' && event.timesToRepeat != null) {
                        console.log('ciao', event)
                        count = (calculateWeeks(event.end)) * event.daysOfWeek.length;
                    }
                }
                // se ho timesToRepeat, ma non ho daysOfWeek, 
                // allora l'evento e' daily
                else if (!event.daysOfWeek && event.timesToRepeat > 0) {
                    frequency = "DAILY";
                    newEnd = addDaysToDate(event.timesToRepeat * 7);
                    count = event.timesToRepeat;

                }
                // se non ho ne' daysOfWeek ne' timesToRepeat, allora e' un evento
                // che dura tutti i giorni, in quanto e' un evento
                // ricorsivo. Se c'e' end, allora dura fino a end, altrimenti
                // fino all'inizio del 2026 ( sarebbe infinito ma Datebook 
                // non accetta eventi infiniti )
                //else {
                //    frequency = "DAILY";
                // }
            }

            if (weekdays) {
                // devo convertire un array di potenziali numeri da 0 a 6, 
                // ( non e' detto che ci siano 7 numeri ) in
                // un array di stringe con i nomi dei giorni
                // SU, MO, TU, WE, TH, FR or SA

                let weekdaysString = [];
                weekdays.forEach(day => {
                    switch (day) {
                        case 0:
                            weekdaysString.push("SU");
                            break;
                        case 1:
                            weekdaysString.push("MO");
                            break;
                        case 2:
                            weekdaysString.push("TU");
                            break;
                        case 3:
                            weekdaysString.push("WE");
                            break;
                        case 4:
                            weekdaysString.push("TH");
                            break;
                        case 5:
                            weekdaysString.push("FR");
                            break;
                        case 6:
                            weekdaysString.push("SA");
                            break;
                        default:
                            break;
                    }
                });
                weekdays = weekdaysString;
            }


            const eventData = {
                start: new Date(event.start),
                end: newEnd ? newEnd : new Date(event.end),
                title: event.title,
                recurrence: {

                }


            }
            if (weekdays.length > 0) {
                eventData.recurrence.weekdays = weekdays;
            }
            if (count > 0) {
                eventData.recurrence.count = count;
            }
            if (frequency === "WEEKLY") {
                eventData.recurrence.frequency = frequency;
            }
            if (event.description) {
                eventData.description = description;
            }
            if (event.location) {
                eventData.location = location;
            }

            console.log('eventData', eventData)

            return eventData;
        }
    }

    const downloadIcsFile = (icalendar) => {
        // Get the iCalendar data and ensure it uses CRLF for line endings
        let icsData = icalendar.render();
        icsData = icsData.replace(/\n/g, '\r\n'); // Replace LF with CRLF to comply with RFC 5545

        const blob = new Blob([icsData], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'events.ics');
        link.click();
    }

    const exportEvents = () => {
        let icalendar = null;

        events.map(event => {
            const eventDetails = setupEvent(event);
            if (eventDetails) {
                console.log('eventDetails', eventDetails)
                const newEvent = new ICalendar(eventDetails);
                if (icalendar === null) {
                    icalendar = new ICalendar(newEvent)
                } else {
                    icalendar.addEvent(newEvent);

                }
            }
        });
        if (icalendar !== null) downloadIcsFile(icalendar);
    };


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div>
            <Button onClick={handleOpen}>Export Events</Button>
            <Dialog open={open} onClose={handleClose}>
                <div>
                    <h2>Export Events</h2>
                    <Button onClick={() => { exportEvents(); handleClose(); }}>Export</Button>
                    <Button onClick={handleClose}>Cancel</Button>
                </div>
            </Dialog>
        </div>
    );
};


export default Datebook;