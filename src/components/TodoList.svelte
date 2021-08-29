<script>
    import Item from "./Item.svelte";
    export let toggleDone;
    export let deleteTodo;
    export let cond;
    export let classes;
    export let initError;
</script>

<ul class="todo-list {classes}">
    {#each cond.sort((a, b) => Number(new Date(a.start)) - Number(new Date(b.start))) as todo (todo.id)}
        <Item todo={todo} toggleDone={toggleDone} deleteTodo={deleteTodo} initError={initError} />
    {/each}
</ul>