<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { Calendar } from "@App/Calendar";
    import { Task } from "@App/Task";
    import { insertLoader } from "@App/insertLoader";
    import { API_URL } from "@/config";

    if (!localStorage.getItem("UserData")) {
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
            token: JSON.parse(localStorage.getItem("UserData"))["token"],
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

        insertLoader("#calendar", async() => {
            await calendar.setTasks();
        }).catch();
    });
</script>

<div id="calendar"></div>