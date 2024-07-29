import { ICalendar } from 'datebook'
import React from 'react'
import {useState, useEffect} from 'react'


const Datebook = () => {
    const [events, setEvents] = useState([])

    
        useEffect(() => {
            const interval = setInterval(() => {
              fetch(`/api/getEventsGeneric?calendars=&username=${username}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
                .then(response => response.json())
                .then(data => {
        
                  setEvents(data);
        
                })
                .catch(error => {
                  console.error("Error fetching events:", error)
        
                });
            }, 500);
        
            // Pulizia: interrompe il polling quando il componente viene smontato
            return () => clearInterval(interval);
          }, []);

    
    const setupEvent = (event) => {
        // standardizzo le date per assicurarmi che siano utili

        let newEnd = null;
        if(event.end === null || event.end === "") {
            newEnd = new Date(2026, 0, 1)
        }

        //calcolo recurrence frequency (daily o weekly)
        //se l'evento ha daysOfWeek.length === 1, allora e' weekly
        let frequency = "daily";
        let weekdays = [];
        let count = 0;
        // se ho daysofweek, allora devo metterlo per forza weekly perche'
        // datebook me lo richiede per settare i weekdays
        if(event.isRecurring){

            if(event.daysOfWeek){
                frequency = "weekly";
                weekdays = event.daysOfWeek;
            }
            // se ho anche timesToRepeat, ma non ho daysOfWeek, 
            // allora l'evento ha una durata di timesToRepeat settimane,
            // tutti i giorni della settimana, fino ad end, se c'e',
            // altrimenti fino a count, che e' il massimo numero di eventi
            // che si possono creare
            else if(!event.daysOfWeek && event.timesToRepeat > 0){
                frequency = "daily";
                count = event.timesToRepeat*7;
                
            } 
            // se non ho ne' daysOfWeek ne' timesToRepeat, allora e' un evento
            // che dura tutti i giorni, in quanto e' un evento
            // ricorsivo. Se c'e' end, allora dura fino a end, altrimenti
            // fino all'inizio del 2026 ( sarebbe infinito ma Datebook 
            // non accetta eventi infiniti )
            else {
                frequency = "daily";
            }
        }

        if(weekdays){
            // devo convertire un array di potenziali numeri da 0 a 6, 
            // ( non e' detto che ci siano 7 numeri ) in
            // un array di stringe con i nomi dei giorni
            // SU, MO, TU, WE, TH, FR or SA

            let weekdaysString = [];
            weekdays.forEach(day => {
                switch(day){
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
            description: event.description,
            location: event.location,
            recurrence: {
                frequency: frequency,
                count: count,
                weekdays: weekdays,
            }

    }

    const exportEvents = () => {
        const icalEvents = events.map(event => setupEvent(event));
        // You'd need a method here to actually export these as an .ics file or similar
        console.log(icalEvents); // For demonstration
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
}

export default Datebook;