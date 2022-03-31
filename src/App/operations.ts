import { errorStore, itemsStore, taskStore } from "@/stores";
import { insertLoader } from "@App/insertLoader";

let task;
taskStore.subscribe((value) => {
	task = value;
});

export function deleteTodo (id: number): void {
	errorStore.set({ message: "", color: "" });
	void insertLoader(".container", async () => {
		await task.deleteTask(id);
		itemsStore.set(await task.getTasksByCategory((await task.getCategories())[0].id));
	});
}
