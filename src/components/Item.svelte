<script lang="ts">
    import { DateTime } from "../App/DateTime";
    import { compareDate } from "../App/compareDate";

    export let todo;
    export let toggleDone;
    export let deleteTodo;
    export let initError;
</script>

<li class="todo-item {todo.state ? 'done' : ''}">
    {#if compareDate(new Date(todo.start), new Date()) }
        <input id={todo.id} type="checkbox" />
        <label for={todo.id} class="tick" on:click={toggleDone(todo.id)}></label>
    {:else }
        <label class="tick" on:click={initError({ message: "L'événement est déjà passé.", color: "#BF616A" })}></label>
    {/if}
    <span>{todo.name}: {new DateTime({ timestamp: Number(new Date(todo.start)) }).format("d-m-Y")}</span>
    <button class="delete-todo" on:click={deleteTodo(todo.id)}></button>
</li>