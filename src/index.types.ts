export interface CronOptions {
    cronTime: string,
    onTick: () => void,
    start: boolean,
    timeZone: string,
}

export interface jsonUser {
    id: number,
    counts: number
}