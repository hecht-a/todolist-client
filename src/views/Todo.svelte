<script lang="ts">
    import { Task } from "@App/Task";
    import { onDestroy, onMount } from "svelte";
    import { insertLoader } from "@App/insertLoader";
    import type { Cate, Item } from "@App/types";
    import { API_URL } from "@/config";
    import DefaultMessage from "@Components/DefaultMessage.svelte";
    import Categories from "@Components/Categories.svelte";
    import TodoList from "@Components/TodoList.svelte";
    import CreateTaskModal from "@Components/modals/CreateTaskModal.svelte";

    if (!localStorage.getItem("UserData")) {
        window.location.href = "/login";
    }

    onDestroy(() => {
        if (localStorage.getItem("date")) {
            localStorage.removeItem("date");
        }
    });

    const task = new Task({
        token: JSON.parse(localStorage.getItem("UserData")).token,
        apiURL: API_URL
    });

    let categories: Cate[] = [];
    let selectedCategory: Cate = { name: "default", id: -1 };
    let todoItems: Item[] = [];
    let sorted = false;
    let error = { message: "", color: "transparent" };

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

    function deleteTodo(id: number) {
        initError({ message: "", color: "" });
        void insertLoader(".container", async() => {
            await task.deleteTask(id);
            setItems(await task.getTasksByCategory(getSelectedCategory().id));
        });
    }

    function editTodo(id: number) {
        initError({ message: "", color: "" });
        void insertLoader(".container", async() => {
            await task.editTask(id, { description: "" });
            setItems(await task.getTasksByCategory(getSelectedCategory().id));
        });
    }

    function sort(e) {
        initError({ message: "", color: "" });
        e.target.classList.toggle("sorted");
        sorted = !sorted;
    }

    function openModal() {
        document.querySelector(".modal").setAttribute("data-visible", "true");
        initError({ message: "", color: "" });
    }

    function initError({ message, color }: { message: string, color: string }) {
        error.message = message;
        error.color = color;
    }

    function setItems(items: Item[]) {
        todoItems = items;
    }

    function getItems(): Item[] {
        return todoItems;
    }

    function setSelectedCategory(category: Cate) {
        selectedCategory = category;
    }

    function getSelectedCategory(): Cate {
        return selectedCategory;
    }

    function setCategories(cats: Cate[]) {
        categories = cats;
    }

    function getCategories(): Cate[] {
        return categories;
    }
</script>

<div class="todolist">
    <h3 class="app-title">todos</h3>
    <h5 class="app-subtitle">{selectedCategory.name}</h5>
    <Categories setCategories={setCategories}
                getCategories={getCategories}
                error={error}
                initError={initError}
                task={task}
                setItems={setItems}
                setSelectedCategory={setSelectedCategory}
                getSelectedCategory={getSelectedCategory}
    />

    <div class="list">
        <div class="form__btn">
            <button class="sort" on:click={sort}>trié</button>
        </div>
        {#if todoItems.length > 0}
            {#if sorted}
                <div class="title">
                    <h2>Finies ({todoItems.filter((item) => item.state).length})</h2>
                    <button class="delete-todo"
                            on:click={() => todoItems.filter((item) => item.state).forEach((item) => deleteTodo(item.id))}></button>
                </div>
                <TodoList classes="todo-list-sorted"
                          cond={todoItems.filter((item) => item.state)}
                          deleteTodo={deleteTodo}
                          initError={initError}
                          getItems={getItems}
                          task={task}
                          selectedCategory={selectedCategory}
                          setItems={setItems}
                />
                <div class="title">
                    <h2>Non finies ({todoItems.filter((item) => !item.state).length})</h2>
                    <button class="delete-todo"
                            on:click={() => todoItems.filter((item) => !item.state).forEach((item) => deleteTodo(item.id))}></button>
                </div>
                <TodoList classes="todo-list-sorted"
                          cond={todoItems.filter((item) => !item.state)}
                          deleteTodo={deleteTodo}
                          initError={initError}
                          getItems={getItems}
                          task={task}
                          selectedCategory={selectedCategory}
                          setItems={setItems}
                />
            {:else}
                <TodoList classes="todo-list-unsorted"
                          cond={todoItems}
                          deleteTodo={deleteTodo}
                          initError={initError}
                          getItems={getItems}
                          task={task}
                          selectedCategory={selectedCategory}
                          setItems={setItems}
                />
            {/if}
        {:else}
            <DefaultMessage/>
        {/if}
    </div>

    <button class="show__modal" on:click={openModal}>Ajouter une tâche</button>

    <CreateTaskModal error={error}
                     selectedCategory={selectedCategory}
                     task={task}
                     initError={initError}
                     deleteTodo={deleteTodo}
                     setItems={setItems}
    />
</div>