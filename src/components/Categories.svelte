<script lang="ts">
	import { insertLoader } from "@App/insertLoader";
	import type { Category } from "@App/types";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { categoriesStore, errorStore, itemsStore, selectedCategoryStore, taskStore } from "@/stores";

	let error;
	let selectedCategory;

	errorStore.subscribe(() => {
		error = get(errorStore);
	});

	selectedCategoryStore.subscribe((value) => {
		selectedCategory = value;
	});

	const task = get(taskStore);

	let newCategory: string;
	let categories: Category[] = [];


	onMount(() => {
		void insertLoader(".container", async () => {
			categories = await task.getCategories();
			itemsStore.set(await task.getTasksByCategory(selectedCategory.id));
		});
	});

	async function createCategory (): Promise<void> {
		errorStore.set({ message: "", color: "" });
		if (newCategory === "" || newCategory === undefined) {
			errorStore.set({ message: "Le nom de la catégorie ne peut être vide.", color: "#BF616A" });
			return;
		}

		newCategory = newCategory.trim();

		void await insertLoader(".container", async () => {
			const cats: { error: string } | Category[] = await task.createCategory({ name: newCategory });

			if ("error" in cats) {
				errorStore.set({ message: "La catégorie existe déjà.", color: "#BF616A" });
				return;
			}
			newCategory = "";
			categoriesStore.set(cats);
			categories = get(categoriesStore);
			selectedCategoryStore.set(categories[categories.length - 1]);
			itemsStore.set(await task.getTasksByCategory(selectedCategory.id));
		});
	}

	async function changeCategory (e): Promise<void> {
		errorStore.set({ message: "", color: "transparent" });
		const category = await task.getCategory(parseInt(e.target.dataset.id, 10));
		selectedCategoryStore.set(category);
		await insertLoader(".container", async () => {
			itemsStore.set(await task.getTasksByCategory(selectedCategory.id));
		});
	}

	function deleteCategory (): void {
		errorStore.set({ message: "", color: "transparent" });
		void insertLoader(".container", async () => {
			const { id } = selectedCategory;
			await task.deleteCategory(id);
			categoriesStore.set((await task.getCategories()));
			categories = get(categoriesStore);
			selectedCategoryStore.set(categories[categories.length - 1]);
			itemsStore.set(await task.getTasksByCategory(selectedCategory.id));
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
						on:click={(e) => changeCategory(e)}>{category.name}</button>
			{/if}
		{/each}
	</div>
	{#if categories.length > 1}
		<button class="delete-category" on:click={() => deleteCategory()}>Supprimer la catégorie sélectionnée 🗑️
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
