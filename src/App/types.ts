import type { SvelteComponent } from "svelte";
import type { Task } from "@App/Task";

export interface Error {
    message: string;
    color: string;
}

export interface Cate {
    name: string;
    id: number;
}

export type TRouter = { [P: string]: { name: string, component: SvelteComponent, alias?: string } }

export type MyPartial<T> = { [P in keyof T]?: T[P] };

export interface UserData {
    id: number;
    email: string;
    token: string;
    created_at: string;
    updated_at: string;
}

interface Default {
    readonly id: number;
    name: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly owner: number;
}

export interface IItem {
    state?: boolean;
    description?: string;
    category?: number;
    start?: string;
    end?: string;
}

interface ICategory {
    uuid: string;
}

export type Category = Default & ICategory
export type Item = Default & IItem

export interface Options {
    min: Date;
    max: Date;
    task: Task;
    current?: Date;
    search?: string;
}

export interface DateTimestamp {
    timestamp: number;
}

export interface FullDate {
    year: number;
    month: number;
    date?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    ms?: number;
}

export type Format = "d" | "m" | "W" | "Y" | "N" | "H" | "i" | "l" | "F";