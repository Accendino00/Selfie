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

const schedule = require('node-schedule');
const { clientMDB } = require('./dbmanagement');
const nodemailer = require('nodemailer'); // Assumendo che userai Nodemailer per l'invio delle email

function formatDateWithTime(date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}


function getNextYear() {
    const currentDate = new Date();
    const nextYear = currentDate.getFullYear() + 1;
    return nextYear;
};

const calculateAllRecurrencies = (event, finalYear) => {
  const recurrencies = [];
  let nextStartDate = new Date(event.start);
  let nextEndDate = event.end ? new Date(event.end) : null;

  const maxRecurrences = event.timesToRepeat ? parseInt(event.timesToRepeat) : Infinity;
  let counter = 0;

  while ((counter < maxRecurrences) && (nextStartDate.getFullYear() <= finalYear)) {
    if (event.daysOfWeek?.includes(nextStartDate.getDay()) ?? false) {
        const startDate = formatDateWithTime(nextStartDate);
        const endDate = nextEndDate ? formatDateWithTime(nextEndDate) : null;

        recurrencies.push({
            ...event,
            start: startDate,
            end: endDate
        });

        counter++;
    }

    nextStartDate.setDate(nextStartDate.getDate() + 7); // Add one week
    if (nextEndDate) {
        nextEndDate.setDate(nextEndDate.getDate() + 7); // Add one week to the end date
    }
  }

  return recurrencies;
};


async function checkEvents() {
  const eventsCollection = clientMDB.db("SelfieGD").collection('Events');
  const usersCollection = clientMDB.db("SelfieGD").collection('Users');
  const now = new Date();

  // Find all events that are either happening soon or need to be checked for recurring notifications
  const events = await eventsCollection.find({}).toArray();

  // add all recurrencies for repeated events
  // we consider recurrencies as singular events, with their own notification
  let allEvents = events
  for (let event of events) {
    if (event) {
        recurrencies = calculateAllRecurrencies(event, getNextYear())
        allEvents = allEvents.concat(recurrencies)
    }
  }

  for (const event of allEvents) {
      const owner = await usersCollection.findOne({ username: event.name });
      //const owner = event.name;
      const sharedUsers = event.shared.map(async username => await usersCollection.findOne({ name: username }));

      // Include both owner and shared users in the notification process
      const usersToNotify = [owner, ...await Promise.all(sharedUsers)];

      for (const user of usersToNotify) {
          if (!user) continue;  // Skip if user not found
          console.log("user.notifyNotice", user.notifyNotice, "user.username", user.username)

          const noticeTime = new Date(user.notifyNotice);
          const repeatCount = user.notifyRepeat;
          const eventStart = new Date(event.start);

          // Calculate the time intervals at which notifications should be sent
          for (let i = 0; i < repeatCount; i++) {
              const notificationTime = new Date(eventStart.getTime() - noticeTime.getTime() * (i + 1) / repeatCount);

              console.log("condizione 1: ", now > notificationTime, " condizione 2: ", now < new Date(notificationTime.getTime() + 30 * 1000))
              console.log("repeatcount: ", repeatCount, " event.start: ", eventStart.getTime(), " noticeTime: ", noticeTime.getTime())
              console.log("notificationTime: ", event.start - noticeTime * (i + 1) / repeatCount)

              if (now > notificationTime && now < new Date(notificationTime.getTime() + 30 * 1000)) { // 30-second window to send the notification
                  // Logic to send email notification
                  console.log(`[NOTIFICATION] Sending notification to ${user.name} for event ${event.name}`);
                  // Include email logic here, possibly using nodemailer
              }
          }
      }
  }

  //console.log('Upcoming events checked', events);
};

// Programma il controllo degli eventi ogni 30 secondi
schedule.scheduleJob('*/10 * * * * *', function(){
  console.log('Checking for upcoming events...');
  checkEvents();
});

module.exports = { checkEvents };
