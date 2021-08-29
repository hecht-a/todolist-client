<script lang="ts">
    export let onSubmit;
    export let bindValue;
    export let id;
    export let label;
</script>

<form class="form__group" on:submit|preventDefault={onSubmit}>
    <input id={id} class="form__field field {id}-input" type="text" aria-label="Enter a new category" placeholder={label} bind:value={bindValue}>
    <label for={id} class="{id}-label form__label">{label}</label>
</form>