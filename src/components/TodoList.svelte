<script lang="ts">
    import Item from "./Item.svelte";
    import { insertLoader } from "../App/insertLoader";

    export let cond;
    export let classes;
    export let initError;
    export let openEditTodoModal;
    export let getItems;
    export let task;
    export let selectedCategory;
    export let deleteTodo;
    export let setItems;

    function toggleDone(id: number) {
        const { start } = getItems().filter(({ id: itemId }) => itemId === id)[0];
        if (new Date(start).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
            return;
        }

        initError({ message: "", color: "" });
        void insertLoader(".container", async() => {
            await task.toggleDone(id);
            setItems(await task.getTasksByCategory(selectedCategory.id));
        });
    }
</script>

<ul class="todo-list {classes}">
    {#each cond.sort((a, b) => Number(new Date(a.start)) - Number(new Date(b.start))) as todo (todo.id)}
        <Item todo={todo} toggleDone={toggleDone} deleteTodo={deleteTodo} openEditTodoModal={openEditTodoModal}
              initError={initError}/>
    {/each}
</ul>