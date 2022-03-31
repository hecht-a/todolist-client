import type { Task } from "@App/Task";
import type { SvelteComponent } from "svelte";

export interface Error {
	message: string;
	color: string;
}

interface Base {
	id: number;
	name: string;
	created_at?: string;
	updated_at?: string;
}

export type Item = {
	state: 0 | 1;
	description: string;
	category: number;
	start: string;
	end: string;
} & Base;

export type Category = {
	items: Item[];
	owner: number;
	created_at: string;
	updated_at: string;
} & Base;

export type User = {
	email: string;
	remember_me_token?: string;
} & Base;

export type TRouter = { [P: string]: { name: string; component: SvelteComponent; alias?: string } };

export type MyPartial<T> = { [P in keyof T]?: T[P] };

export interface Token {
	type: string;
	token: string;
	expires_at: string;
}

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
