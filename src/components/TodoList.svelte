<script lang="ts">
    import { insertLoader } from "@App/insertLoader";
    import type { Item as IItem } from "@App/types";
    import Item from "@Components/Item.svelte";
    import { errorStore, itemsStore, selectedCategoryStore, taskStore } from "@/stores";
    import { get } from "svelte/store";

    export let cond: IItem[];
    export let classes: string;
    export let openEditTodoModal: () => void;

    const task = get(taskStore);
    const items = get(itemsStore);
    const selectedCategory = get(selectedCategoryStore);

    function toggleDone (id: number): void {
        const { start } = items.filter(({ id: itemId }) => itemId === id)[0];
        if (new Date(start).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
            return;
        }

        errorStore.set({ message: "", color: "" });
        void insertLoader(".container", async () => {
            await task.toggleDone(id);
            itemsStore.set(await task.getTasksByCategory(selectedCategory.id));
        });
    }
</script>

<ul class="todo-list {classes}">
    {#each cond.sort((a, b) => Number(new Date(a.start)) - Number(new Date(b.start))) as todo (todo.id)}
        <Item todo={todo} toggleDone={toggleDone} openEditTodoModal={openEditTodoModal} />
    {/each}
</ul>
