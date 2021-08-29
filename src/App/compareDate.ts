/**
 * Compare if date1 is superior than comparator.
 * @param date1
 * @param comparator
 */
export function compareDate(date1: Date, comparator: Date): boolean {
    return date1.getDate() >= comparator.getDate() && date1.getMonth() >= comparator.getMonth() && date1.getFullYear() >= comparator.getFullYear();
}