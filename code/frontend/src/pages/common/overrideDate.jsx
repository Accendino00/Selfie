let baseDate = new Date(); // Default base date

export const setBaseDate = (newDate) => {
    baseDate = newDate;
};

const OriginalDate = Date;

function CustomDate(...args) {
    if (args.length) {
        return new OriginalDate(...args);
    }
    return new OriginalDate(baseDate);
}

CustomDate.prototype = OriginalDate.prototype;
CustomDate.parse = OriginalDate.parse;
CustomDate.UTC = OriginalDate.UTC;
CustomDate.now = () => baseDate.getTime();

export default CustomDate;
