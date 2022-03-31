import { DateTime } from "@App/DateTime";
import type { Category, Item } from "@App/types";
import axios from "axios";

export class Task {
	private readonly token: string;
	private readonly apiURL: string;

	constructor ({ token, apiURL }: { token: string; apiURL: string }) {
		this.token = token;
		this.apiURL = apiURL;
	}

	/**
	 * Return the API URL
	 * @return string
	 */
	public getApiURL (): string {
		return this.apiURL;
	}

	/**
	 * Return the token
	 * @return string
	 */
	public getToken (): string {
		return this.token;
	}

	/**
	 * Get all tasks
	 * @return Promise<Item[]>
	 * @method GET
	 * @APIRoute APIURL/item/
	 */
	public async getTasks (): Promise<Item[]> {
		const { data }: { data: Item[] } = await axios.get(`${this.apiURL}/items/`, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
		return data;
	}

	/**
	 * Get a tasks
	 * @return Promise<Item>
	 * @method GET
	 * @APIRoute APIURL/item/
	 */
	public async getTask (id: number): Promise<Item> {
		const { data }: { data: Item } = await axios.get(`${this.apiURL}/items/${id}`, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
		return data;
	}

	/**
	 * Get tasks by category according to the category ID
	 * @return Promise<Item[]>
	 * @method GET
	 * @APIRoute APIURL/item/:categoryId
	 * @param id
	 */
	public async getTasksByCategory (id: number): Promise<Item[]> {
		const { data } = await axios.get<Category>(`${this.apiURL}/categories/${String(id)}`, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
		const done = data.items.filter(
			({ start, state }) =>
				new DateTime({ timestamp: Number(new Date(start)) }).format("Y-m-d") <
					new DateTime({ timestamp: Date.now() }).format("Y-m-d") && !state,
		);
		if (done.length > 0) {
			done.forEach(({ id }) => this.toggleDone(id));
		}
		return data.items;
	}

	/**
	 * Delete a task
	 * @param id
	 * @return Promise<void>
	 * @method DELETE
	 * @APIRoute APIURL/item/:id
	 */
	public async deleteTask (id: number): Promise<void> {
		await axios.delete(`${this.apiURL}/items/${String(id)}`, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
	}

	/**
	 * Create a task
	 * @return Promise<Item[]>
	 * @method POST
	 * @APIRoute APIURL/item
	 * @param body
	 */
	public async createTask (body: {
		name: string;
		state: boolean;
		category: number;
		start: string;
		end: string;
		description: string;
	}): Promise<Item[]> {
		await axios.post(`${this.apiURL}/items`, body, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
		return this.getTasksByCategory(body.category);
	}

	/**
	 * Change state of the task (done or not)
	 * @param id
	 * @return Promise<void>
	 * @method PUT
	 * @APIRoute APIURL/item/:id
	 */
	public async toggleDone (id: number): Promise<void> {
		const item = await this.getTask(id);

		await axios.put(
			`${this.apiURL}/items/${id}`,
			{
				state: !item.state,
			},
			{
				headers: {
					Authorization: `Bearer ${this.token}`,
				},
			},
		);
	}

	/**
	 * Get all categories
	 * @return Promise<Category[]>
	 * @method GET
	 * @APIRoute APIURL/category/all
	 */
	public async getCategories (): Promise<Category[]> {
		const { data } = await axios.get<Category[]>(`${this.apiURL}/categories`, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
		return data;
	}

	/**
	 * Get a category according to the id in parameter
	 * @param id
	 * @return Promise<Category>
	 * @method GET
	 * @APIRoute APIURL/category/:id
	 */
	public async getCategory (id: number): Promise<Category> {
		const { data } = await axios.get<Category>(`${this.apiURL}/categories/${String(id)}`, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
		return data;
	}

	/**
	 * Create a category
	 * @return Promise<Category[] | { error: string }>
	 * @method POST
	 * @APIRoute APIURL/category
	 * @param category
	 */
	public async createCategory (category: { name: string }): Promise<Category[] | { error: string }> {
		const { data }: { data: { error: string } } = await axios.post(`${this.apiURL}/categories/`, category, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});

		if ("error" in data) {
			return data;
		}
		return this.getCategories();
	}

	/**
	 * Delete a category
	 * @param id
	 * @return Promise<void>
	 * @method DELETE
	 * @APIRoute APIURL/category/:id
	 */
	public async deleteCategory (id: number): Promise<void> {
		await axios.delete(`${this.apiURL}/categories/${String(id)}`, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
	}

	public static async setLocalStorage (key: string, value: string): Promise<void> {
		return new Promise<void>((resolve, reject): void => {
			resolve(localStorage.setItem(key, value));
			reject(new Error("Error"));
		});
	}

	public static async getLocalStorage<T> (key: string): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			resolve(JSON.parse(localStorage.getItem(key)));
			reject(new Error("Error"));
		});
	}
}
