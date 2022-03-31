<script lang="ts">
    import { DateTime } from "@App/DateTime";
    import { insertLoader } from "@App/insertLoader";
    import { Task } from "@App/Task";
    import type { Category, Error, Item as IItem, User } from "@App/types";

    export let error: Error;
    export let selectedCategory: Category;
    export let task: Task;
    export let initError: ({ message, color }: Error) => void;
    export let setItems: (items: IItem[]) => void;

    const date = Number(new Date(localStorage.getItem("date"))) || Date.now();
    let newTodo: string;
    let description = "";
    let start: string = new DateTime({ timestamp: date }).format("Y-m-dTH:i");
    let end: string = new DateTime({ timestamp: date }).format("Y-m-dTH:i");

    function closeModal (): void {
        document.querySelector(".modal").setAttribute("data-visible", "false");
        initError({ message: "", color: "" });
    }

    async function addTodoToCategory (): Promise<void> {
        initError({ message: "", color: "" });

        if (newTodo === "" || newTodo === undefined) {
            initError({ message: "La tâche ne peut être vide.", color: "#BF616A" });
            return;
        }

        if (newTodo.trim().length > 30) {
            initError({ message: "La tâche ne peut excéder 30 caractères.", color: "#BF616A" });
            return;
        }

        const startD = new DateTime({ timestamp: Number(start === "" ? new Date() : new Date(start)) });
        const endD = new DateTime({ timestamp: Number(end === "" ? new Date() : new Date(end)) });

        const fd = new FormData();
        fd.append("name", newTodo.trim());
        fd.append("state", String(0));
        fd.append("category", String(selectedCategory.id));
        fd.append("owner", String((await Task.getLocalStorage<User>("token")).id));
        fd.append("start", startD.format("Y-m-d H:i"));
        fd.append("end", endD.format("Y-m-d H:i"));
        fd.append("description", description.trim());

        void await insertLoader(".container", async () => {
            setItems(await task.createTask(fd));
        });

        newTodo = "";
        description = "";
        start = "";
        end = "";
        initError({ message: "La tâche a bien été ajoutée", color: "#A3BE8C" });

        if (localStorage.getItem("date")) {
            localStorage.removeItem("date");
        }
        start = new DateTime({ timestamp: Date.now() }).format("Y-m-dTH:i");
        end = new DateTime({ timestamp: Date.now() }).format("Y-m-dTH:i");
    }

    function setDate (e): void {
        e.preventDefault();
        if (new Date(start).setHours(0, 0, 0, 0) > new Date(end).setHours(0, 0, 0, 0)) {
            initError({ message: "La date de début doit être inférieure à la date de fin.", color: "#BF616A" });
            return;
        }

        if (new Date().setHours(0, 0, 0, 0) > new Date(e.target.valueAsNumber).setHours(0, 0, 0, 0) ||
            new Date().setHours(0, 0, 0, 0) > new Date(start).setHours(0, 0, 0, 0) ||
            new Date().setHours(0, 0, 0, 0) > new Date(end).setHours(0, 0, 0, 0)) {
            initError({
                message: "La date de début et/ou de fin ne peut pas être antérieure à la date d'aujourd'hui.",
                color: "#BF616A"
            });
            return;
        }

        initError({ message: "", color: "" });
        return;
    }
</script>

<div class="modal" data-visible="false">
    <div class="form__task__container">
        <button class="close__modal" on:click={closeModal} aria-label="Fermer la fenêtre">✗</button>
        <h1 class="modal__title">Ajout de tâche(s) dans la catégorie "{selectedCategory.name}"</h1>
        {#if error.message !== ""}
            <div class="error" style="color: {error.color}">{error.message}</div>
        {/if}
        <form class="form__task" on:submit|preventDefault={addTodoToCategory}>
            <div class="form__group">
                <input id="task" class="form__field field" type="text" aria-label="Enter a new todo item"
                       placeholder="E.g. Build a web app" bind:value={newTodo}>
                <label for="task" class="todo-label form__label">Tâche</label>
            </div>
            <div class="form__group">
                <input id="description" class="form__field field" type="text" aria-label="Enter a new todo item"
                       placeholder="E.g. Build a web app" bind:value={description}>
                <label for="description" class="todo-label form__label">Description</label>
            </div>
            <div class="form__group">
                <input id="start" on:change={(e) => setDate(e)} class="form__field field" type="datetime-local"
                       aria-label="Enter a new todo item" placeholder="HH:MM" bind:value={start}>
                <label for="start" class="todo-label form__label">Start</label>
            </div>
            <div class="form__group">
                <input id="end" on:change={(e) => setDate(e)} class="form__field field" type="datetime-local"
                       aria-label="Enter a new todo item" placeholder="HH:MM" bind:value={end}>
                <label for="end" class="todo-label form__label">End</label>
            </div>
            <button class="add__task">Ajouter</button>
        </form>
    </div>
</div>
