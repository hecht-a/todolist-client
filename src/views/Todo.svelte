<script lang="ts">
	import type { Item } from "@App/types";
	import Categories from "@Components/Categories.svelte";
	import DefaultMessage from "@Components/DefaultMessage.svelte";
	import CreateTaskModal from "@Components/modals/CreateTaskModal.svelte";
	import TodoList from "@Components/TodoList.svelte";
	import { onDestroy, onMount } from "svelte";
	import { get } from "svelte/store";
	import { errorStore, itemsStore, selectedCategoryStore } from "@/stores";
	import { deleteTodo } from "@App/operations";

	const error = get(errorStore);
	let selectedCategory ;
	selectedCategoryStore.subscribe((value) => {
		if (value) {
			selectedCategory = value;
		}
	});

	let todoItems: Item[] = [];
	itemsStore.subscribe((value) => {
		if (value) {
			todoItems = value;
		}
	});



	if (!localStorage.getItem("token")) {
		window.location.href = "/login";
	}

	onDestroy(() => {
		if (localStorage.getItem("date")) {
			localStorage.removeItem("date");
		}
	});

	let sorted = false;

	onMount(() => {
		const modal = document.querySelector(".modal");
		if (localStorage.getItem("date")) {
			modal.setAttribute("data-visible", "true");
		}

		modal.addEventListener("click", (e: MouseEvent) => {
			if (!(e.target as HTMLElement).classList.contains("modal")) {
				return;
			}
			modal.setAttribute("data-visible", "false");
		});

		const calendarEvents = document.querySelector(".container").querySelector("#calendar-events");
		if (calendarEvents) {
			calendarEvents.remove();
		}
	});

	function sort (e): void {
		errorStore.set({ message: "", color: "" });
		e.target.classList.toggle("sorted");
		sorted = !sorted;
	}

	function openModal (): void {
		document.querySelector(".modal").setAttribute("data-visible", "true");
		errorStore.set({ message: "", color: "" });
	}
</script>

<div class="todolist">
	<h5 class="app-subtitle">{selectedCategory && selectedCategory.name}</h5>
	<Categories
	/>

	<div class="list">
		<div class="form__btn">
			<button class="sort" on:click={(e) => sort(e)}>trié</button>
		</div>
		{#if todoItems.length > 0}
			{#if sorted}
				<div class="title">
					<h2>Finies ({todoItems.filter((item) => item.state).length})</h2>
					<button class="btn-todo delete-todo"
							on:click={() => todoItems.filter((item) => item.state).forEach((item) => deleteTodo(item.id))}></button>
				</div>
				<TodoList classes="todo-list-sorted" cond={todoItems.filter((item) => item.state)} />
				<div class="title">
					<h2>Non finies ({todoItems.filter((item) => !item.state).length})</h2>
					<button class="btn-todo delete-todo"
							on:click={() => todoItems.filter((item) => !item.state).forEach((item) => deleteTodo(item.id))}></button>
				</div>
				<TodoList classes="todo-list-sorted" cond={todoItems.filter((item) => !item.state)} />
			{:else}
				<TodoList classes="todo-list-unsorted" cond={todoItems} />
			{/if}
		{:else}
			<DefaultMessage />
		{/if}
	</div>

	<button class="show__modal" on:click={() => openModal()}>Ajouter une tâche</button>

	<CreateTaskModal error={error} />
</div>
