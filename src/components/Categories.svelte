<script lang="ts">
    export let categories: {name: string, id: number}[];
    export let selectedCategory;
    export let changeCategory;
    export let deleteCategory;
</script>

<div class="categories">
    <div class="button_cat_container">
        {#each categories as category}
            {#if category.name === selectedCategory.name}
                <p class="button selected">{category.name}</p>
            {:else}
                <button class="category" value={category.name} data-id="{category.id}" on:click={changeCategory}>{category.name}</button>
            {/if}
        {/each}
    </div>
    <div>
        {#if categories.length > 1}
            <button class="delete-category" on:click={deleteCategory}>Supprimer la catégorie sélectionnée 🗑️</button>
        {/if}
    </div>
</div>