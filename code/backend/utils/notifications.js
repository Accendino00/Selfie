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

const checkEvents = async () => {
  const eventsCollection = clientMDB.db("SelfieGD").collection('Events');
  
  // Otteniamo tutti gli eventi non recurring
  const now = new Date();
  const upcomingEvents = await eventsCollection.find({
    start: { $gte: now.toISOString() },
    isRecurring: false
  }).toArray();

  // Adesso andiamo a ottenere tutti quelli che sono recurring
  // recurring ha: daysOfWeek, timesToRepeat, startRecur, endRecur, startTime, endTime
  // times to repeat coincide con il numero di settimane nelle quali si ripete
  // daysOfWeek è un array del tipo: "[0,1]" per indicare domenica e lunedì, etc.
  
  // Quello che dobbiamo fare è controllare che:
  //    La data di inizio dell'evento + ((numero di occorrenze+1) * 7 giorni)
  //    è più grande della data attuale?
  //    inoltre, se end è null, allora non c'è una data di fine e quindi l'evento si richiede sempre

  const recurringEvents = await eventsCollection.aggregate([
    {
      $match: {
        isRecurring: true
      }
    },
    {
      $addFields: {
        timesToRepeatNumeric: {
          $cond: {
            if: { $eq: ["$timesToRepeat", null] },
            then: null,
            else: { $toInt: "$timesToRepeat" }
          }
        }
      }
    },
    {
      $addFields: {
        computedStartTimestamp: {
          $cond: {
            if: { $eq: ["$timesToRepeatNumeric", null] },
            then: { $toLong: new Date() },
            else: {
              $subtract: [
                { $toLong: new Date() },
                { $multiply: ["$timesToRepeatNumeric", 7 * 24 * 60 * 60 * 1000] }
              ]
            }
          }
        }
      }
    },
    {
      $addFields: {
        computedStart: { $toDate: "$computedStartTimestamp" }
      }
    },
    {
      $match: {
        start: { $gte: "$computedStart" }
      }
    }
  ]).toArray();
  
  

  // log
  console.log('Upcoming events:', upcomingEvents);
};

// Programma il controllo degli eventi ogni 30 secondi
schedule.scheduleJob('*/30 * * * * *', function(){
  console.log('Checking for upcoming events...');
  checkEvents();
});

module.exports = { checkEvents };
