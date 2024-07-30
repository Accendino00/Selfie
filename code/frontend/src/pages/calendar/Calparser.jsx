import React, { useState, useEffect } from 'react';
import ICAL from 'ical.js';
import { EventSeat } from '@mui/icons-material';
import Cookies from 'js-cookie';
import useTokenChecker from '../../utils/useTokenChecker';
import { Input } from '@mui/material';
import { Button } from '@mui/material';


const Calparser = () => {

    const { loginStatus, isTokenLoading, username } = useTokenChecker();
    const token = Cookies.get('token');
    const [events, setEvents] = useState([]);
    const uploadInputRef = React.createRef();


    function parseIcsFile(fileContent) {
        try {
            const jcalData = ICAL.parse(fileContent);
            const comp = new ICAL.Component(jcalData);
            const events = comp.getAllSubcomponents('vevent').map(vevent => {
                const event = new ICAL.Event(vevent);
                console.log('event', event.rrule);
                // Extracting recurrence rule data
                let recurrenceData = {};
                const rruleProperty = vevent.getFirstPropertyValue('rrule');
                if (rruleProperty) {
                    recurrenceData = {
                        freq: rruleProperty.freq,
                        byday: rruleProperty.parts.BYDAY
                    };
                }
                console.log('recurrenceData', recurrenceData);

                return {
                    summary: event.summary,
                    location: event.location,
                    startDate: event.startDate.toString(),
                    endDate: event.endDate.toString(),
                    //duration la prendo come se fosse timesToRepeat
                    duration: event.duration.weeks,
                    // recurrence e' un oggetto con freq e byday
                    // byday e' un array di stringhe con i giorni della settimana
                    // ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
                    // freq e' una stringa con la frequenza della ripetizione
                    // 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
                    recurrence: recurrenceData

                };
            });
            return events;
        } catch (error) {
            console.error("Error parsing ICS file:", error);
            return [];
        }
    }

    useEffect(() => {
        saveEvents();
    }, [events]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                const parsedEvents = parseIcsFile(fileContent);
                console.log('parsedevents', parsedEvents);
                setEvents(parsedEvents);
                //saveEvents();
            };
            reader.readAsText(file);
        }
    };

    const setupEvent = (event) => {
        const eventData = {
            start: new Date(event.startDate),
            end: new Date(event.endDate),
            title: event.summary,
            name: username,
            shared: [],
            invitedUsers: [],
            calendar: ['Base Calendar'],
            location: '',
            description: '',
            isShared: false,
        };

        if (event.recurrence) {
            console.log('event.recurrence', event.recurrence.byday);
            if (event.recurrence.byday) {
                eventData.isRecurring = true;
                eventData.daysOfWeek = event.recurrence.byday.map(day => {
                    switch (day) {
                        case 'SU':
                            return 0;
                        case 'MO':
                            return 1;
                        case 'TU':
                            return 2;
                        case 'WE':
                            return 3;
                        case 'TH':
                            return 4;
                        case 'FR':
                            return 5;
                        case 'SA':
                            return 6;
                    }
                });
            }
            if (event.recurrence.freq) {
                if (event.recurrence.freq === 'DAILY') {
                    eventData.timesToRepeat = event.duration;
                }
            }
            if (!event.duration && event.recurrence.byday) {
                eventData.end = null;
            }
            if (eventData.isRecurring) {
                eventData.startRecur = eventData.start;
            }
        }
        console.log('eventData1', eventData);
        return eventData;
    }


    const saveEvents = async () => {

        for (const event of events) {
            const eventData = setupEvent(event);
            console.log('eventData', eventData);

            fetch('/api/addEvents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData),
            })
                .then(response => response.json())
                .then(data => {

                    console.log('Success:', data);
                })
                .catch(error => console.error('Error saving event:', error));


        }
    };



    return (
        <div>
            <input
                ref={uploadInputRef}
                onChange={handleFileChange}
                type="file"
                hidden
            />
            <Button
                component="label"
                onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
                sx={{ textShadow: "0px 0px 0px #fff0" }}
            >
                Upload File
            </Button>
        </div>
    );

}

export default Calparser;
