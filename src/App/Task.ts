import axios from "axios";
import { DateTime } from "@App/DateTime";
import type { Category, IItem, Item, MyPartial } from "@App/types";

export class Task {

    private readonly token: string;
    private readonly apiURL: string;

    constructor({ token, apiURL }: { token: string, apiURL: string }) {
        this.token = token;
        this.apiURL = apiURL;
    }

    /**
     * Return the API URL
     * @return string
     */
    public getApiURL(): string {
        return this.apiURL;
    }

    /**
     * Return the token
     * @return string
     */
    public getToken(): string {
        return this.token;
    }

    /**
     * Get all tasks
     * @return Promise<Item[]>
     * @method GET
     * @APIRoute APIURL/item/
     */
    public async getTasks(): Promise<Item[]> {
        const { data }: { data: Item[] } = await axios.get(`${this.apiURL}/item/`, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });
        return data;
    }

    /**
     * Get tasks by category according to the category ID
     * @param categoryId
     * @return Promise<Item[]>
     * @method GET
     * @APIRoute APIURL/item/:categoryId
     */
    public async getTasksByCategory(categoryId: number): Promise<Item[]> {

        const { data }: { data: Item[] } = await axios.get(`${this.apiURL}/item/${String(categoryId)}`, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });
        const done = data.filter(({
                                      start,
                                      state
                                  }) => new DateTime({ timestamp: Number(new Date(start)) }).format("Y-m-d") < new DateTime({ timestamp: Date.now() }).format("Y-m-d") && !state);
        if (done.length > 0) {
            done.forEach(({ id }) => this.toggleDone(id));
        }
        return data;
    }

    /**
     * Delete a task
     * @param id
     * @return Promise<void>
     * @method DELETE
     * @APIRoute APIURL/item/:id
     */
    public async deleteTask(id: number): Promise<void> {
        await axios.delete(`${this.apiURL}/item/${String(id)}`, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });
    }

    /**
     * Create a task
     * @param fd
     * @return Promise<Item[]>
     * @method POST
     * @APIRoute APIURL/item
     */
    public async createTask(fd: FormData): Promise<Item[]> {
        await axios.post(`${this.apiURL}/item`, fd, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });
        return this.getTasksByCategory(parseInt(fd.get("category").toString()));
    }

    /**
     * Change state of the task (done or not)
     * @param id
     * @param data
     * @return Promise<void>
     * @method PUT
     * @APIRoute APIURL/item/:id
     */
    public async toggleDone(id: number): Promise<void> {
        await axios.put(`${this.apiURL}/item/${String(id)}`, {}, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });
    }

    public async editTask(id: number, data: MyPartial<IItem & { name: string }>): Promise<void> {
        await axios.put(`${this.apiURL}/item/${String(id)}`, {}, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });
    }

    /**
     * Get all categories
     * @return Promise<Category[]>
     * @method GET
     * @APIRoute APIURL/category/all
     */
    public async getCategories(): Promise<Category[]> {
        const { data } = await axios.get<Category[]>(`${this.apiURL}/category/all`, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
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
    public async getCategory(id: number): Promise<Category> {
        const { data } = await axios.get<Category>(`${this.apiURL}/category/${String(id)}`, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });
        return data;
    }

    /**
     * Create a category
     * @param fd
     * @return Promise<Category[] | { error: string }>
     * @method POST
     * @APIRoute APIURL/category
     */
    public async createCategory(fd: FormData): Promise<Category[] | { error: string }> {
        const { data }: { data: { error: string } } = await axios.post(`${this.apiURL}/category/`, fd, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });

        if (data.error) {
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
    public async deleteCategory(id: number): Promise<void> {
        await axios.delete(`${this.apiURL}/category/${String(id)}`, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });
    }

    public static async setLocalStorage(key: string, value: string): Promise<void> {
        return new Promise<void>((resolve, reject): void => {
            resolve(localStorage.setItem(key, value));
            reject(new Error("Error"));
        });
    }

    public static async getLocalStorage<T>(key: string): Promise<T> {
        return new Promise<T>(((resolve, reject) => {
            resolve(JSON.parse(localStorage.getItem(key)));
            reject(new Error("Error"));
        }));
    }
}