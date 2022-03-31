<script lang="ts">
    import { Calendar } from "@App/Calendar";
    import { API_URL } from "@App/config";
    import { insertLoader } from "@App/insertLoader";
    import { Task } from "@App/Task";
    import { onDestroy, onMount } from "svelte";

    if (!localStorage.getItem("token")) {
        window.location.href = "/login";
    }

    onDestroy(() => {
        if (localStorage.getItem("date")) {
            localStorage.removeItem("date");
        }
    });

    onMount(() => {
        const calendarEvents = document.querySelector(".container").querySelector("#calendar-events");
        if (calendarEvents) {
            calendarEvents.remove();
        }

        const task = new Task({
            token: JSON.parse(localStorage.getItem("token"))["token"],
            apiURL: API_URL
        });

        let calendarElement: HTMLElement = document.querySelector("#calendar");

        let current = new Date();
        let search = "";

        const urlInfos = window.location.href.split("?")[1];
        if (urlInfos) {
            if (urlInfos.match(/date=(\d{1,2}\/){2}\d{4}/g)) {
                search = "dmy";
                const [day, month, year] = urlInfos.split("=")[1].split("/");
                current = new Date(Number(year), Number(month) - 1, Number(day));
            } else if (urlInfos.match(/date=(\d{1,2}\/)\d{4}/g)) {
                search = "my";
                const [month, year] = urlInfos.split("=")[1].split("/");
                current = new Date(Number(year), Number(month) - 1);
            }
        }

        const calendar = new Calendar(calendarElement, {
            min: new Date(),
            max: new Date(new Date().getFullYear() + Infinity, 10),
            task,
            current,
            search
        });

        insertLoader("#calendar", async () => {
            await calendar.setTasks();
        }).catch();
    });
</script>

<div id="calendar"></div>
