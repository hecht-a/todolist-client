<script lang="ts">
    import { DateTime } from "@App/DateTime";
    import type { Item } from "@App/types";
    import { deleteTodo } from "@App/operations";
    import { errorStore } from "@/stores";

    export let todo: Item;
    export let toggleDone: (id: number) => void;
    export let openEditTodoModal: (id: number) => void;
</script>

<li class="todo-item {todo.state ? 'done' : ''}">
    {#if new Date(todo.start).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0) }
        <input id={todo.id} type="checkbox"/>
        <label for={todo.id} class="tick" on:click={() => toggleDone(todo.id)}></label>
    {:else }
        <p class="tick" on:click={() => errorStore.set({ message: "L'événement est déjà passé.", color: "#BF616A" })}></p>
    {/if}
    <div>
        <p>{todo.name}</p>
        <p>{new DateTime({ timestamp: Number(new Date(todo.start)) }).format("d-m-Y")}</p>
    </div>
    <button class="btn-todo edit-todo" on:click={() => openEditTodoModal(todo.id)}></button>
    <button class="btn-todo delete-todo" on:click={() => deleteTodo(todo.id)}></button>
</li>
