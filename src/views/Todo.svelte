<script lang="ts">
    import { DateTime } from "../App/DateTime";
    import { Task } from "../App/Task";
    import TodoList from "../components/TodoList.svelte";
    import { onMount, onDestroy } from "svelte";
    import { insertLoader } from "../App/insertLoader";
    import { compareDate } from "../App/compareDate";
    import type { Item, UserData, Category } from "../App/types";

    if(!localStorage.getItem("UserData")) {
        window.location.href = "/login";
    }

    onDestroy(() => {
        if(localStorage.getItem("date")) {
            localStorage.removeItem("date");
        }
    });

    const task = new Task({ token: JSON.parse(localStorage.getItem("UserData")).token, apiURL: "http://localhost:3333" });

    let selectedId = -1;
    let categories: {name: string, id: number}[] = JSON.parse(localStorage.getItem("categories")) || [];
    let selectedCategory: {name: string, id: number} = categories[0] || { name: "default", id: -1 };
    let todoItems: Item[] = JSON.parse(localStorage.getItem("items")) || [];
    let newCategory: string;
    let sorted = false;
    let error = { message: "", color: "transparent" };

    let newTodo: string;
    let description = "";
    const date = Number(new Date(localStorage.getItem("date"))) || Date.now();
    let start: string = new DateTime({ timestamp: date }).format("Y-m-dTH:i");
    let end: string = new DateTime({ timestamp: date }).format("Y-m-dTH:i");

    onMount(() => {
        const modal = document.querySelector(".modal");
        if(localStorage.getItem("date")) {
            modal.setAttribute("data-visible", "true");
        }

        modal.addEventListener("click", (e: MouseEvent) => {
            if(!(e.target as HTMLElement).classList.contains("modal")) {
                return;
            }
            modal.setAttribute("data-visible", "false");
        });

        const calendarEvents = document.querySelector(".container").querySelector("#calendar-events");
        if(calendarEvents) {
            calendarEvents.remove();
        }

        void insertLoader(".container", async() => {
            const category = await task.getCategories();
            categories = category.map(({ name, id }) => ({ name, id }));
            if(selectedCategory.name === "default" && selectedCategory.id === -1) {
                selectedCategory = categories[0];
                selectedId = selectedCategory.id;
            }
            todoItems = await task.getTasksByCategory(selectedId === -1 ? selectedCategory.id : selectedId);
        });
    });

    function changeCategory(e) {
        error = { message: "", color: "transparent" };
        selectedId = e.target.getAttribute("data-id");
        selectedCategory = { name: e.target.value, id: e.target.getAttribute("data-id") };
        void insertLoader(".container", async() => {
            todoItems = await task.getTasksByCategory(selectedId);
        });
    }

    function deleteCategory() {
        error = { message: "", color: "transparent" };
        void insertLoader(".container", async() => {
            await task.deleteCategory(selectedCategory.id);
            categories = await task.getCategories();
            const cats = categories.map(({ name, id }) => ({ name, id }));
            selectedCategory = cats[cats.length - 1];
            todoItems = await task.getTasksByCategory(selectedCategory.id);
        });
    }

    function toggleDone(id: number) {
        const { start, state } = todoItems.filter(({ id: itemId }) => itemId === id)[0];
        if(!compareDate(new Date(), new Date(start))) {
            console.log("ok")
            return;
        }

        error = { message: "", color: "transparent" };
        void insertLoader(".container", async() => {
            await task.toggleDone(id);
            todoItems = await task.getTasksByCategory(selectedCategory.id);
        });
    }

    function deleteTodo(id: number) {
        error = { message: "", color: "transparent" };
        void insertLoader(".container", async() => {
            await task.deleteTask(id);
            todoItems = await task.getTasksByCategory(selectedCategory.id);
        });
    }

    function sort(e) {
        error = { message: "", color: "transparent" };
        e.target.classList.toggle("sorted");
        sorted = !sorted;
    }

    async function addTodoToCategory() {
        error = { message: "", color: "transparent" };

        if(newTodo === "" || newTodo === undefined) {
            error.message = "La tâche ne peut être vide.";
            error.color = "#BF616A";
            return;
        }

        const startD = new DateTime({ timestamp: Number(start === "" ? new Date() : new Date(start)) });
        const endD = new DateTime({ timestamp: Number(end === "" ? new Date() : new Date(end)) });

        const fd = new FormData();
        fd.append("name", newTodo.trim());
        fd.append("state", String(0));
        fd.append("category", String(selectedCategory.id));
        fd.append("owner", String((await Task.getLocalStorage<UserData>("UserData")).id));
        fd.append("start", startD.format("Y-m-d H:i"));
        fd.append("end", endD.format("Y-m-d H:i"));
        fd.append("description", description.trim());

        insertLoader(".container", async() => {
            todoItems = await task.createTask(fd);
        });

        newTodo = "";
        description = "";
        start = "";
        end = "";
        error.message = "La tâche a bien été ajoutée";
        error.color = "#A3BE8C";

        if(localStorage.getItem("date")) {
            localStorage.removeItem("date");
        }
        start = new DateTime({ timestamp: Date.now() }).format("Y-m-dTH:i");
        end = new DateTime({ timestamp: Date.now() }).format("Y-m-dTH:i");
    }

    async function createCategory() {
        error = { message: "", color: "transparent" };
        if(newCategory === "" || newCategory === undefined) {
            error.message = "Le nom de la catégorie ne peut être vide.";
            error.color = "#BF616A";
            return;
        }

        newCategory = newCategory.trim();
        const fd = new FormData();
        fd.append("name", newCategory.trim());
        fd.append("owner", String((await Task.getLocalStorage<UserData>("UserData")).id));

        void insertLoader(".container", async() => {
            const cats: { error: string } | Category[] = await task.createCategory(fd);

            if("error" in cats) {
                error.message = "La catégorie existe déjà.";
                error.color = "#BF616A";
                return;
            }

            newCategory = "";
            categories = cats.map(({ id, name }) => ({ id, name }));
            selectedCategory = categories[categories.length - 1];
            todoItems = await task.getTasksByCategory(selectedCategory.id);
        });
    }

    function closeModal() {
        document.querySelector(".modal").setAttribute("data-visible", "false");
        error = { message: "", color: "" };
    }

    function openModal() {
        document.querySelector(".modal").setAttribute("data-visible", "true")
        error = {message: "", color: ""}
    }

    function setDate(e) {
        e.preventDefault();
        if(compareDate(new Date(start), new Date(end))) {
            error.message = "La date de début doit être inférieure à la date de fin.";
            error.color = "#BF616A";
            return;
        }

        if(compareDate(new Date(), new Date(e.target.valueAsNumber)) || compareDate(new Date(), new Date(start)) || compareDate(new Date(), new Date(end))) {
            error.message = "La date de début et/ou de fin ne peut pas être antérieure à la date d'aujourd'hui.";
            error.color = "#BF616A";
            return;
        }

        error = { message: "", color: "" };
        return;
    }

    function initError({message, color}: {message: string, color: string}) {
        error.message = message;
        error.color = color;
    }
</script>

<div class="todolist">
    <h3 class="app-title">todos</h3>
    <h5 class="app-subtitle">{selectedCategory.name}</h5>
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

    {#if error.message !== ""}
        <div class="error" style="color: {error.color}">{error.message}</div>
    {/if}

    <form on:submit|preventDefault={createCategory}>
        <div class="form__group">
            <input id="category" class="form__field field category-input" type="text" aria-label="Enter a new category" placeholder="E.g. Supermarket" bind:value={newCategory}>
            <label for="category" class="category-label form__label">Catégorie</label>
        </div>
    </form>

    <div class="list">
        <div class="form__btn">
            <button class="sort" on:click={sort}>trié</button>
        </div>
        {#if todoItems.length > 0}
            {#if sorted}
                <div class="title">
                    <h2>Finies ({todoItems.filter((item) => item.state).length})</h2>
                    <button class="delete-todo" on:click={() => todoItems.filter((item) => item.state).forEach((item) => deleteTodo(item.id))}></button>
                </div>
                <TodoList classes="todo-list-sorted" cond={todoItems.filter((item) => item.state)} toggleDone={toggleDone} deleteTodo={deleteTodo} initError={initError} />
                <div class="title">
                    <h2>Non finies ({todoItems.filter((item) => !item.state).length})</h2>
                    <button class="delete-todo" on:click={() => todoItems.filter((item) => !item.state).forEach((item) => deleteTodo(item.id))}></button>
                </div>
                <TodoList classes="todo-list-sorted" cond={todoItems.filter((item) => !item.state)} toggleDone={toggleDone} deleteTodo={deleteTodo} initError={initError} />
            {:else}
                <TodoList classes="todo-list-unsorted" cond={todoItems} toggleDone={toggleDone} deleteTodo={deleteTodo} initError={initError} />
            {/if}
        {:else}
            <div class="empty-state">
                <h2 class="empty-state__title">Ajoute ta première tâche</h2>
                <p class="empty-state__description">Que veut tu accomplir comme tâche aujourd'hui?</p>
            </div>
        {/if}
    </div>

    <button class="show__modal" on:click={openModal} >Ajouter une tâche</button>

    <div class="modal" data-visible="false">
        <div class="form__task__container">
            <button class="close__modal" on:click={closeModal} aria-label="Fermer la fenêtre">✗</button>
            <h1 class="modal__title">Ajout de tâche(s) dans la catégorie "{selectedCategory.name}"</h1>
            {#if error.message !== ""}
                <div class="error" style="color: {error.color}">{error.message}</div>
            {/if}
            <form class="form__task" on:submit|preventDefault={addTodoToCategory}>
                <div class="form__group">
                    <input id="task" class="form__field field" type="text" aria-label="Enter a new todo item" placeholder="E.g. Build a web app" bind:value={newTodo}>
                    <label for="task" class="todo-label form__label">Tâche</label>
                </div>
                <div class="form__group">
                    <input id="description" class="form__field field" type="text" aria-label="Enter a new todo item" placeholder="E.g. Build a web app" bind:value={description}>
                    <label for="description" class="todo-label form__label">Description</label>
                </div>
                <div class="form__group">
                    <input id="start" on:change={setDate} class="form__field field" type="datetime-local" aria-label="Enter a new todo item" placeholder="HH:MM" bind:value={start}>
                    <label for="start" class="todo-label form__label">Start</label>
                </div>
                <div class="form__group">
                    <input id="end" on:change={setDate} class="form__field field" type="datetime-local" aria-label="Enter a new todo item" placeholder="HH:MM" bind:value={end}>
                    <label for="end" class="todo-label form__label">End</label>
                </div>
                <button class="add__task">Ajouter</button>
            </form>
        </div>
    </div>
</div>