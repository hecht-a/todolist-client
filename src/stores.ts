import { writable } from "svelte/store";
import type { Task } from "@App/Task";
import type { Category, Item } from "@App/types";

export const errorStore = writable<{ message: string; color: string }>({ message: "", color: "transparent" });

export const taskStore = writable<Task>();

export const categoriesStore = writable<Category[]>();

export const itemsStore = writable<Item[]>();

export const selectedCategoryStore = writable<Category>();
