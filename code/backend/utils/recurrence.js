 function noticeTimeToMilliseconds() {
    const timeUnits = {
      'min': 60000,
      'hour': 60000 * 60,
      'hours': 60000 * 60,
      'day': 60000 * 60 * 24,
      'days': 60000 * 60 * 24,
      'week': 60000 * 60 * 24 * 7,
      'weeks': 60000 * 60 * 24 * 7,
      'month': 60000 * 60 * 24 * 7 * 30,
      'months': 60000 * 60 * 24 * 7 * 30,
      'year': 60000 * 60 * 24 * 7 * 30 * 365,
      'years': 60000 * 60 * 24 * 7 * 30 * 365
    };

    const [number, unit] = selectedNotification?.split(' ') ?? [30, 'min'];

    const milliseconds = parseInt(number) * timeUnits[unit];

    return milliseconds;
  }

  function formatDateWithTime(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

const calculateAllRecurrencies = (event, finalYear) => {
    const recurrencies = [];
    let nextStartDate = new Date(event.start);
    let nextEndDate = event.end ? new Date(event.end) : null;

    const maxRecurrences = event.timesToRepeat ? parseInt(event.timesToRepeat) : Infinity;
    let counter = 0;

    while ((counter < maxRecurrences) && (nextStartDate.getFullYear() <= finalYear)) {
        if (event.daysOfWeek.includes(nextStartDate.getDay())) {
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


module.exports = { noticeTimeToMilliseconds, calculateAllRecurrencies };