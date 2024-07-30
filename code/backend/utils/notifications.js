/**

set interval per ogni evento nel backend che ti manda la notifica per mail nei tempi giusti
    QUANDO DEVE MANDARE NOTIFICA?
        dipende dai settings dell'utente
        quindi sono dati sul profilo utente su mongo


ogni 30 secondi fai un controllo per vedere tutti gli eventi nel backend
    filtrando per ottenere tutti quelli che ANCORA NON SONO PASSATI

ottenuti gli eventi, per ogni evento:
    prendi la lista degli utenti associati, per ogni utente:
        se l'utente ha nei settings che deve ricevere la notifica in qualche modo
        allora manda notifica
            PER ESEMPIO
            un utente ha impostato 5 ripetizioni 1 ora prima.
            quindi tu ti fai il calcolo di 60 minuti / 5 = 12 minuti
            quindi, a 1 ora prima (o leggermente dopo)
                    a 1 ora - 12 minuti prima
                    etc.
                    12 minuti prima
            mandi la notifica.

            come fai a non ripetere nei controlli?
            con un contatore (pefffozza)

*/

const schedule = require("node-schedule");
const { clientMDB } = require("./dbmanagement");

const { transporter, mailSender } = require('./mailmanager');

function formatDateWithTime(date) {
  return new Date(`${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}`).toISOString();
}

function getNextYear() {
  const currentDate = new Date();
  const nextYear = currentDate.getFullYear() + 1;
  return nextYear;
}

const calculateAllRecurrencies = (event, finalYear) => {
  const recurrencies = [];
  let nextStartDate = new Date(event.start);
  let nextEndDate = event.end ? new Date(event.end) : null;

  // Se c'è uno startTime, allora modifico "nextStartDate" per includere l'ora
  if (event.startTime && event.startTime !== "") {
    const startTime = event.startTime.split(":");
    nextStartDate.setHours(parseInt(startTime[0]));
    nextStartDate.setMinutes(parseInt(startTime[1]));
    // converti a iso string
    nextStartDate = new Date(new Date(nextStartDate).toISOString());
  } else {
    // Se non c'è uno start time, allora imposto lo start ad 0 ore e 0 minuti
    nextStartDate.setHours(0);
    nextStartDate.setMinutes(0);
    // converti a iso string
    nextStartDate = new Date(new Date(nextStartDate).toISOString());
  }

  // Se c'è uno endTime, allora modifico "nextEndDate" per includere l'ora
  if (event.endTime) {
    const endTime = event.endTime.split(":");
    nextEndDate.setHours(parseInt(endTime[0]));
    nextEndDate.setMinutes(parseInt(endTime[1]));

    // converti a iso string
    nextEndDate = new Date(new Date(nextEndDate).toISOString());
  } else {
    // Se non c'è uno end time, allora imposto lo end ad 0 ore e 0 minuti
    if(nextEndDate) {
        nextEndDate.setHours(0);
        nextEndDate.setMinutes(0);
    }
    // converti a iso string
    nextEndDate = new Date(new Date(nextEndDate).toISOString());
  }

  


  const maxRecurrences = event.timesToRepeat
    ? parseInt(event.timesToRepeat)
    : Infinity;
  let counter = 0;

  while (counter < maxRecurrences && nextStartDate.getFullYear() <= finalYear) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      let currentDate = new Date(nextStartDate);
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + dayOffset));

      if (event.daysOfWeek?.includes(currentDate.getDay()) ?? false) {
        const startDate = formatDateWithTime(currentDate);
        const endDate = nextEndDate ? formatDateWithTime(nextEndDate) : null;

        recurrencies.push({
          ...event,
          start: startDate,
          end: endDate,
        });

    }
    }
    
    nextStartDate.setDate(nextStartDate.getDate() + 7); // Add one week
    if (nextEndDate) {
        nextEndDate.setDate(nextEndDate.getDate() + 7); // Add one week to the end date
    }
    counter++;
  }
  return recurrencies;
};

async function checkEvents() {
  const eventsCollection = clientMDB.db("SelfieGD").collection("Events");
  const usersCollection = clientMDB.db("SelfieGD").collection("Users");
  const now = new Date();
  
  // Find all events that are either happening soon or need to be checked for recurring notifications
  let events = await eventsCollection.find({});
  if (!events) return;

  try{

    events= await events.toArray();
  } catch (error) {
    events = [events];
  }

  // add all recurrencies for repeated events
  // we consider recurrencies as singular events, with their own notification
  let allEvents = events;
  for (let event of events) {
      // if the event isn't single and its a recurring event, calculate all recurrencies
      if (event) {
          recurrencies = calculateAllRecurrencies(event, getNextYear());
          allEvents = allEvents.concat(recurrencies);
        }
    }
    
    for (const event of allEvents) {
        const owner = await usersCollection.findOne({ username: event.name });
        //const owner = event.name;
        const sharedUsers = event.shared.map(
      async (username) => await usersCollection.findOne({ name: username })
    );
    
    // Include both owner and shared users in the notification process
    const usersToNotify = [owner, ...(await Promise.all(sharedUsers))];
    
    for (const user of usersToNotify) {
        if (!user) continue; // Skip if user not found
        //if (user.username != 'bus') continue    //SCOMMENTA PER VEDERE SOLO I LOG DI UN UTENTE SPECIFICO
        
        const noticeTime = user.notifyNotice;
        const repeatCount = user.notifyRepeat;
        const eventStart = new Date(event.start);
        


      // Calculate the time intervals at which notifications should be sent
      for (let i = 0; i < repeatCount; i++) {
        const notificationTime = new Date(
          eventStart.getTime() -
            (noticeTime * i) / (repeatCount == 1 ? 1 : repeatCount - 1)
        );

        if (
          now > notificationTime &&
          now < new Date(notificationTime.getTime() + 30 * 1000)
        ) {
          // 30-second window to send the notification
          // Logic to send email notification
          console.log(
            `[NOTIFICATION] Sending notification to ${user.username} for event ${event.title}`
          );
          console.log("utente: ", user);
          console.log("event: ", event);

          /**
                   * Un esempio dell'oggetto evento è:
                   *    event:  {
                            _id: new ObjectId('66a81fcfc03dc3eb49d71218'),
                            title: 'questo evento verrà aggiornato',
                            description: '',
                            color: '',
                            allDay: false,
                            start: '2024-07-29T23:34:00.000Z',
                            end: '2024-07-30T22:00:00.000Z',
                            timesToRepeat: 0,
                            calendar: [ 'Base Calendar' ],
                            name: 'np',
                            location: '',
                            invitedUsers: [],
                            shared: [],
                            isShared: false,
                            isRecurring: false,
                            daysOfWeek: null,
                            startTime: null,
                            endTime: null,
                            startRecur: null,
                            endRecur: null
                        }

                        esempio di utente:
                        utente:  {
                            _id: new ObjectId('66a81f47c03dc3eb49d71214'),
                            username: 'np',
                            password: '$2a$08$z3gpW3ohdL.wh.W2SpT5Ce0hVm6Gx/r9..fjzk1MS/68vFoPHmnc.',
                            truename: 'nuovoprof',
                            birthdate: '',
                            notifyNotice: '3600000',
                            notifyRepeat: '10'
                        }
                   */


            // Sending a mail to the user
            try {
                let attempts = 0;
                const maxAttempts = 5;
                let emailSent = false;
        
                // Tentativo di invio email
                while (attempts < maxAttempts && !emailSent) {
                    try {
                        await transporter.sendMail({
                            from: mailSender,
                            to: user.email, 
                            subject: `Promemoria per l'evento "${event.title}"`,
                            html: `<p>Ciao <b>${user.truename=='' ? user.username : user.truename}</b>,</p><p>Questa è un promemoria per l'evento "${event.title}" che inizia il ${new Date(event.start).getDate()}/${new Date(event.start).getMonth() + 1}/${new Date(event.start).getFullYear()} alle ${new Date(event.start).getHours()}:${new Date(event.start).getMinutes()}.
                            <br> <br> Cordiali saluti, <br>Il team di Selfie</p>`,
                        });
                        emailSent = true;
                    } catch (error) {
                        console.log(error);
                        attempts++;
                        console.log(`Tentativo ${attempts} di invio email a ${user.email} fallito.`);
                    }
                }
        
                if (!emailSent) {
                    // Se dopo 5 tentativi l'email non è stata inviata invia un errore
                    console.log('Impossibile inviare l\'email di verifica. Riprova più tardi.');
                } else {
                    console.log('Email di verifica inviata con successo.');
                }
            } catch (error) {
                console.log('Errore nel processo di invio dell\'email. Riprova più tardi.');
            }
        }
      }
    }
  }
}

// Programma il controllo degli eventi ogni 30 secondi
schedule.scheduleJob("*/30 * * * * *", function () {
  console.log("Checking for upcoming events...");
  checkEvents();
});

module.exports = { checkEvents };
