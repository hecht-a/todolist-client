<script lang="ts">
    import { Task } from "../App/Task";
    import type { Cate, Category, Error, Item, UserData } from "../App/types";
    import { insertLoader } from "../App/insertLoader";
    import { onMount } from "svelte";

    export let initError: ({ message, color }: Error) => void;
    export let task: Task;
    export let setItems: (items: Item[]) => void;
    export let error: Error;
    export let setSelectedCategory: (category: Cate) => void;
    export let getSelectedCategory: () => Cate;
    export let setCategories: (cats: Cate[]) => void;
    export let getCategories: () => Cate[];
    let newCategory: string;

    let categories = [];
    let selectedCategory = getSelectedCategory();

    onMount(() => {
        void insertLoader(".container", async() => {
            const category = await task.getCategories();
            categories = category.map(({ name, id }) => ({ name, id }));
            if (getSelectedCategory().name === "default" && getSelectedCategory().id === -1) {
                setSelectedCategory(categories[0]);
            }
            setItems(await task.getTasksByCategory(getSelectedCategory().id));
        }).then(() => {
            selectedCategory = getSelectedCategory();
        });
    });

    async function createCategory() {
        initError({ message: "", color: "" });
        if (newCategory === "" || newCategory === undefined) {
            initError({ message: "Le nom de la catégorie ne peut être vide.", color: "#BF616A" });
            return;
        }

        newCategory = newCategory.trim();
        const fd = new FormData();
        fd.append("name", newCategory.trim());
        fd.append("owner", String((await Task.getLocalStorage<UserData>("UserData")).id));

        void await insertLoader(".container", async() => {
            const cats: { error: string } | Category[] = await task.createCategory(fd);

            if ("error" in cats) {
                initError({ message: "La catégorie existe déjà.", color: "#BF616A" });
                return;
            }
            newCategory = "";
            setCategories(cats.map(({ id, name }) => ({ id, name })));
            categories = getCategories();
            setSelectedCategory(categories[categories.length - 1]);
            selectedCategory = getSelectedCategory();
            setItems(await task.getTasksByCategory(getSelectedCategory().id));
        });
    }

    function changeCategory(e) {
        error = { message: "", color: "transparent" };
        setSelectedCategory({ name: e.target.value, id: e.target.getAttribute("data-id") });
        selectedCategory = getSelectedCategory();
        void insertLoader(".container", async() => {
            setItems(await task.getTasksByCategory(getSelectedCategory().id));
        });
        console.log(selectedCategory);
    }

    function deleteCategory() {
        error = { message: "", color: "transparent" };
        void insertLoader(".container", async() => {
            const { id } = getSelectedCategory();
            await task.deleteCategory(id);
            setCategories((await task.getCategories()).map(({ name, id }) => ({ name, id })));
            categories = getCategories();
            setSelectedCategory(categories[categories.length - 1]);
            selectedCategory = getSelectedCategory();
            setItems(await task.getTasksByCategory(selectedCategory.id));
        });
    }
</script>

<div class="categories">
    <div class="button_cat_container">
        {#each categories as category}
            {#if category.name === selectedCategory.name}
                <p class="button selected">{category.name}</p>
            {:else}
                <button class="category" value={category.name} data-id="{category.id}"
                        on:click={changeCategory}>{category.name}</button>
            {/if}
        {/each}
    </div>
    {#if categories.length > 1}
        <button class="delete-category" on:click={deleteCategory}>Supprimer la catégorie sélectionnée 🗑️
        </button>
    {/if}
</div>

{#if error.message !== ""}
    <div class="error" style="color: {error.color}">{error.message}</div>
{/if}

<form on:submit|preventDefault={createCategory}>
    <div class="form__group">
        <input id="category" class="form__field field category-input" type="text" aria-label="Enter a new category"
               placeholder="E.g. Supermarket" bind:value={newCategory}>
        <label for="category" class="category-label form__label">Catégorie</label>
    </div>
</form>