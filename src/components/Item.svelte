<script lang="ts">
    import { DateTime } from "../App/DateTime";

    export let todo;
    export let toggleDone;
    export let deleteTodo;
    export let initError;
    export let openEditTodoModal;
</script>

<li class="todo-item {todo.state ? 'done' : ''}">
    {#if new Date(todo.start).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0) }
        <input id={todo.id} type="checkbox"/>
        <label for={todo.id} class="tick" on:click={toggleDone(todo.id)}></label>
    {:else }
        <p class="tick" on:click={initError({ message: "L'événement est déjà passé.", color: "#BF616A" })}></p>
    {/if}
    <div>
        <p>{todo.name}</p>
        <date>{new DateTime({ timestamp: Number(new Date(todo.start)) }).format("d-m-Y")}</date>
    </div>
    <button class="btn-todo edit-todo" on:click={openEditTodoModal(todo.id)}></button>
    <button class="btn-todo delete-todo" on:click={deleteTodo(todo.id)}></button>
</li>