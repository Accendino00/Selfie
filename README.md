# Selfie

Selfie è un progetto sviluppato con lo scopo di creare una piattaforma interattiva e user-friendly. L'obiettivo principale è quello di fornire agli utenti uno strumento per la gestione delle attività quotidiane, come la gestione delle attività e degli eventi trami un calendario, la possibilità di creare note e la gestione del tempo di studio tramite la tecnica del pomodoro. Il progetto è suddiviso in due parti: il frontend e il backend. 

### Backend

Il backend di Selfie è stato sviluppato utilizzando NodeJS e ExpressJS, scelti per familiarità. La struttura del backend è organizzata in quattro sezioni principali:

- Middleware: Gestisce le richieste in arrivo e verifica che l'utente sia autenticato prima di permettere l'accesso alle risorse richieste. Questo assicura che solo utenti autorizzati possano interagire con il sistema.

- Routes: Contiene le API chiamate dal frontend per vari servizi. Le route definiscono i punti di accesso per le diverse funzionalità dell'applicazione, garantendo una comunicazione chiara e strutturata tra il frontend e il backend.

- Utils: Racchiude funzioni di utilità che supportano le operazioni del backend ma non sono strettamente legate alle route. 

- Server.js: Il file principale che avvia il server e si occupa di indirizzare le richieste alle route appropriate. Questo file è il punto di ingresso dell'applicazione backend e garantisce che tutte le richieste siano correttamente gestite e risposte.

### Frontend    

Il frontend di Selfie è stato interamente realizzato utilizzando React e Material-UI (MUI). Queste tecnologie sono state scelte per la loro facilità d'uso e per la capacità di creare interfacce utente moderne e responsive. La struttura del frontend è organizzata come segue:

- Public: Questa directory contiene le risorse statiche utilizzate nel sito, come immagini e suoni. Questi file sono accessibili direttamente dal client e vengono utilizzati per arricchire l'esperienza utente.

- Src/Pages: In questa directory sono stati suddivisi i componenti principali del progetto, ciascuno con i relativi componenti secondari e i file di stile.

- Main.jsx: Questo file imposta la gerarchia dei componenti dell'applicazione, definendo quali componenti vengono caricati e in quale ordine. È il punto di ingresso del frontend e configura la struttura dell'interfaccia utente.

### Autori:
```json
{
    nome: Davide Donati
    email: davide.donati16@studio.unibo.it
    contributo: pomodoro, note, homepage, eventi condivisi, task condivise, homepage
},

{ 
    nome: Giuseppe Forciniti
    email: giuseppe.forciniti4@studio.unibo.it
    contributo: calendario, eventi, attività, notifiche, navbar, login/register, homepage
}    

```