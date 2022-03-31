import type { DateTimestamp, Format, FullDate } from "@App/types";

export class DateTime extends Date {

    private readonly value: DateTimestamp | FullDate;
    public static readonly enDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    public static readonly frDays = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    public static readonly months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    constructor (value: DateTimestamp | FullDate) {
        if ("timestamp" in value) {
            super(value.timestamp);
        } else {
            super(value.year, value.month, value.date ?? null, value.hours ?? null, value.minutes ?? null, value.seconds ?? null, value.ms ?? null);
        }
        this.value = value;
    }

    public removeMonth (amount: number): DateTime {
        if ("timestamp" in this.value) {
            const date = new DateTime(this.value);
            return new DateTime({ timestamp: date.setMonth(date.getMonth() - amount) });
        } else {
            return new DateTime({ ...this.value, month: this.value.month - amount });
        }
    }

    public addMonth (amount: number): DateTime {
        if ("timestamp" in this.value) {
            const date = new DateTime(this.value);
            return new DateTime({ timestamp: date.setMonth(date.getMonth() + amount) });
        } else {
            return new DateTime({ ...this.value, month: this.value.month + amount });
        }
    }

    public removeDay (amount: number): DateTime {
        if ("timestamp" in this.value) {
            const date = new DateTime(this.value);
            return new DateTime({ timestamp: date.setDate(date.getDate() - amount) });
        } else {
            return new DateTime({ ...this.value, date: this.value.date - amount });
        }
    }

    public addDay (amount: number): DateTime {
        if ("timestamp" in this.value) {
            const date = new DateTime(this.value);
            return new DateTime({ timestamp: date.setDate(date.getDate() + amount) });
        } else {
            return new DateTime({
                ...this.value,
                date: (this.value.date ?? new DateTime({ timestamp: DateTime.now() }).getDate()) + amount
            });
        }
    }

    public getWeek (): number {
        const oneJan = new Date(this.getFullYear(), 0, 4);
        const a = Math.ceil((((new DateTime(this.value).getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
        return a === 0 ? a + 1 : a;
    }

    public format (format: string, capitalize?: { capitalize?: Format[] }): string {
        let dateStr = "";
        const date = new DateTime(this.value);
        for (let i = 0; i < format.length; i++) {
            switch (format[i]) {
                // jour du mois avec 0 initiaux (01 à 31)
                case "d":
                    dateStr += date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
                    break;
                // mois au format numérique (1 à 12)
                case "m":
                    dateStr += date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
                    break;
                // numéro de la semaine
                case "W":
                    dateStr += date.getWeek();
                    break;
                // année sur 4 chiffres
                case "Y":
                    dateStr += date.getFullYear();
                    break;
                // jour de la semaine au format numérique (1 pour lundi à 7 pour dimanche)
                case "N":
                    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
                    const day = DateTime.enDays[date.getDay()];
                    dateStr += days.indexOf(day) + 1;
                    break;
                // heure au format 24h avec 0 initiaux
                case "H":
                    dateStr += date.getHours() > 10 ? date.getHours() : `0${date.getHours()}`;
                    break;
                // minutes avec 0 initiaux
                case "i":
                    dateStr += date.getMinutes() > 10 ? date.getMinutes() : `0${date.getMinutes()}`;
                    break;
                case "l":
                    const d = DateTime.frDays[date.getDay()];
                    dateStr += capitalize && capitalize.capitalize.includes("l") ? d[0].toUpperCase() + d.slice(1).toLowerCase() : d;
                    break;
                case "F":
                    const m = DateTime.months[date.getMonth()];
                    dateStr += capitalize && capitalize.capitalize.includes("F") ? m[0].toUpperCase() + m.slice(1).toLowerCase() : m;
                    break;
                default:
                    dateStr += format[i];
                    break;
            }
        }
        return dateStr;
    }

    public getLastMonday (month: number, year: number, day = 3): DateTime {
        const date = new DateTime({ month: month - 1, year, date: day });
        if (date.getDay() === 1 || day > 1) {
            return date;
        } else {
            while (date.getDay() !== 1) {
                if (day < 1) {
                    month -= 1;
                    day = (new DateTime({ timestamp: date.setDate(date.getDate() - 1) })).getDate();
                }
                return this.getLastMonday(month, year, day - 1);
            }
        }
    }
}