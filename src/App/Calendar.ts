import type { Task } from "./Task";
import { DateTime } from "./DateTime";
import { insertLoader } from "./insertLoader";
import { removeChildren } from "./removeChildren";
import type { Item, Options } from "./types";

export class Calendar {
    public static readonly days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    public static readonly months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    private date: Date;
    private search: string;
    private today: Date;
    private value: Date;
    private selectedDay: DateTime | null;

    private day: number;
    private month: number;
    private year: number;

    private min: Date;
    private max: Date;

    private userElement: HTMLElement;

    private calendarWrapper: HTMLDivElement;
    private calendarElement: HTMLDivElement;
    private calendarHeader: HTMLElement;
    private calendarHeaderTitle: HTMLHeadingElement;
    private navigationWrapper: HTMLDivElement;
    private previousMonthArrow: HTMLAnchorElement;
    private nextMonthArrow: HTMLAnchorElement;
    private calendarGridDays: HTMLElement;
    private calendarGrid: HTMLElement;
    private eventsSection: HTMLElement;
    private calendarDayElementType: string;

    private dayAsText: string;
    private monthAsText: string;
    private dateAsText: string;
    private yearAsText: string;

    private callback: (date: Date) => void;
    private activeDateElement: HTMLElement;

    public task: Task;

    constructor(element: HTMLElement, options: Options) {
        this.task = options.task;

        this.date = options.current;
        this.search = options.search;
        this.formatDateToInit(this.date);

        this.day = this.date.getDay();
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();

        this.today = this.date;

        this.value = this.date;

        this.min = options.min;
        this.max = options.max;
        this.formatDateToInit(this.min);
        this.formatDateToInit(this.max);

        this.userElement = element;
        this.setDateText();

        this.calendarWrapper = document.createElement("div");
        this.calendarElement = document.createElement("div");
        this.calendarHeader = document.createElement("header");
        this.calendarHeaderTitle = document.createElement("h4");
        this.navigationWrapper = document.createElement("div");
        this.previousMonthArrow = document.createElement("a");
        this.nextMonthArrow = document.createElement("a");
        this.calendarGridDays = document.createElement("section");
        this.calendarGrid = document.createElement("section");
        this.eventsSection = document.createElement("section");
        this.calendarDayElementType = "time";

        this.calendarWrapper.id = "calendar-wrapper";
        this.calendarElement.id = "calendar-element";
        this.calendarGridDays.id = "calendar-days";
        this.calendarGrid.id = "calendar-grid";
        this.navigationWrapper.id = "navigation-wrapper";
        this.previousMonthArrow.id = "previous-month";
        this.nextMonthArrow.id = "next-month";
        this.eventsSection.id = "calendar-events";
        this.eventsSection.classList.add("modal");
        this.eventsSection.setAttribute("data-visible", "false");

        this.insertHeaderIntoCalendarWrapper();
        this.insertCalendarGridDaysHeader();
        this.insertDaysIntoGrid();
        this.insertNavigationButtons();
        this.calendarWrapper.appendChild(this.calendarElement);
        document.querySelector(".container").appendChild(this.eventsSection);

        this.userElement.appendChild(this.calendarWrapper);
    }

    public getDaysInMonth(month: number, year: number): DateTime[] {
        if((!month && month !== 0) || (!year && year !== 0)) {
            return;
        }

        const date = new DateTime({ year, month, date: 1 });
        const days: DateTime[] = [];

        while(date.getMonth() === month) {
            days.push(new DateTime({ timestamp: Number(date) }));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }

    public formatDateToInit(date: Date): void {
        if(!date) {
            return;
        }
        date.setHours(0, 0, 0);
    }

    public setDateText(): void {
        const [day, month, date, year] = this.date.toString().split(" ");
        this.dayAsText = day;
        this.monthAsText = month;
        this.dateAsText = date;
        this.yearAsText = year;
    }

    public insertHeaderIntoCalendarWrapper(): void {
        this.calendarHeaderTitle.textContent = `${Calendar.months[this.month]} - ${this.year}`;
        this.calendarHeader.appendChild(this.calendarHeaderTitle);
        this.calendarWrapper.appendChild(this.calendarHeader);
    }

    public insertCalendarGridDaysHeader(): void {
        Calendar.days.forEach((day) => {
            const dayElement = document.createElement("span");
            dayElement.textContent = day;
            this.calendarGridDays.appendChild(dayElement);
        });
        this.calendarElement.appendChild(this.calendarGridDays);
    }

    public insertNavigationButtons(): void {
        const div = document.createElement("div");
        div.classList.add("btn-container");
        this.previousMonthArrow.innerHTML = "&lt;";
        this.previousMonthArrow.classList.add("btn");
        this.nextMonthArrow.innerHTML = "&gt;";
        this.nextMonthArrow.classList.add("btn");

        this.previousMonthArrow.setAttribute("aria-label", "Go to previous month");
        this.nextMonthArrow.setAttribute("aria-label", "Go to next month");

        div.appendChild(this.previousMonthArrow);
        div.appendChild(this.nextMonthArrow);

        this.navigationWrapper.appendChild(div);

        this.previousMonthArrow.addEventListener("click", () => {
                if (this.month === 0) {
                    this.month = 11;
                    this.year -= 1;
                } else {
                    this.month -= 1;
                }
                this.updateCalendar();
        });

        this.nextMonthArrow.addEventListener("click", () => {
                if (this.month === 11) {
                    this.month = 0;
                    this.year += 1;
                } else {
                    this.month += 1;
                }
                this.updateCalendar();
        });
        this.calendarHeader.appendChild(this.navigationWrapper);
    }

    public insertDaysIntoGrid(): void {
        this.calendarGrid.innerHTML = "";
        let days = this.getDaysInMonth(this.month, this.year);
        const firstDayOfMonth = days[0].getDay() === 0 ? 7 : days[0].getDay();

        if(firstDayOfMonth > 1) {
            days = Array(firstDayOfMonth - 1).fill(false, 0).concat(days);
        }

        for (const date1 of days) {
            const dateElement = document.createElement(date1 ? this.calendarDayElementType : "span");
            const pDay = document.createElement("p");
            const pEvents = document.createElement("p");
            const pEventsDone = document.createElement("p");
            pEvents.id = "amount-events";
            pEventsDone.id = "amount-events-done";
            dateElement.appendChild(pDay);
            dateElement.appendChild(pEvents);
            dateElement.appendChild(pEventsDone);
            const dateE = date1.toString().split(" ")[2];

            const dateIsTheCurrentValue = this.value.toString() === date1.toString();
            if(dateIsTheCurrentValue) {
                this.activeDateElement = dateElement;
            }

            dateElement.setAttribute("value", date1 instanceof DateTime ? date1.format("d/m/Y") : date1);
            dateElement.id = date1 instanceof DateTime ? date1.format("d/m/Y") : date1;

            pDay.classList.add("number__day");
            pDay.textContent = date1 ? dateE : "";

            const handleSelectedEvent = (event) => {
                const modal = document.querySelector(".modal");
                modal.setAttribute("data-visible", "true");
                if(dateElement.nodeName.toLowerCase() === this.calendarDayElementType && !dateElement.classList.contains("disabled")) {
                    document.querySelectorAll(".selected").forEach((element) => {
                            element.classList.remove("selected");
                    });
                    event.target.classList.add("selected");
                    this.value = new Date(dateElement.getAttribute("value"));
                    this.onValueChange(this.callback);

                    if(event.target.classList.contains("selected")) {
                        let elem = event.target;
                        if(elem.tagName === "P") {
                            elem = elem.parentElement;
                        }
                        const [date, month, year] = elem.getAttribute("value").split("/");
                        this.selectedDay =  new DateTime({ year: Number(year), month: Number(month) - 1, date: Number(date) });
                        this.setTasks().catch();
                    } else {
                        this.selectedDay = null;
                    }
                }
            };

            void this.task.getTasks().then((tasks): void => {
                const events = tasks.filter((task) => new DateTime({ timestamp: Number(new Date(task.start)) }).format("Y-m-d") === new DateTime({ timestamp: Number(date1) }).format("Y-m-d"));
                const undone = events.filter(({ state }) => !state);
                if (events.length > 0) {
                    const d = document.getElementById(`${date1.format("d/m/Y")}`);
                    const p = d.querySelector("#amount-events");
                    const pDone = d.querySelector("#amount-events-done");
                    p.textContent = events.length > 1 ? `${events.length} tâches` : `${events.length} tâche`;
                    pDone.textContent = undone.length > 1 ? `${undone.length} non finies` : `${undone.length} non finie`;
                }
            });

            dateElement.addEventListener("click", handleSelectedEvent);

            if ((this.min || this.max) && (date1.toString() !== this.today.toString() && (date1 < this.min || date1 > this.max))) {
                dateElement.classList.add("disabled");
                dateElement.classList.add("over");
                dateElement.removeEventListener("click", handleSelectedEvent);
            }
            this.calendarGrid.appendChild(dateElement);
        }

        this.calendarElement.appendChild(this.calendarGrid);
        this.activeDateElement.classList.add("selected");
        const [date, month, year] = this.activeDateElement.getAttribute("value").split("/");
        this.selectedDay =  new DateTime({ year: Number(year), month: Number(month) - 1, date: Number(date) });
    }

    public updateCalendar(): void {
        this.date = new Date(this.year, this.month);
        this.setDateText();

        this.day = this.date.getDay();
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();

        window.requestAnimationFrame(() => {
            this.calendarHeaderTitle.textContent = `${Calendar.months[this.month]} - ${this.year}`;
            this.insertDaysIntoGrid();
        });
    }

    public onValueChange(callback: (date: Date) => void): void {
        if(this.callback) {
            return this.callback(this.value);
        }
        this.callback = callback;
    }

    public async setTasks(): Promise<void> {
        let tasks: Item[];
        await insertLoader("main", async() => {
            tasks = await this.task.getTasks();
        });

        const events = tasks.filter((task) => new DateTime({ timestamp: Number(new Date(task.start)) }).format("Y-m-d") === new DateTime({ timestamp: Number(this.selectedDay) }).format("Y-m-d"));
        const undone = events.filter(({ state }) => !state);

        const d = document.getElementById(`${this.selectedDay.format("d/m/Y")}`);
        const p = d.querySelector("#amount-events");
        const pDone = d.querySelector("#amount-events-done");

        if(events.length > 0) {
            p.textContent = events.length > 1 ? `${events.length} tâches` : `${events.length} tâche`;
            pDone.textContent = undone.length > 1 ? `${undone.length} non finies` : `${undone.length} non finie`;
        } else {
            p.textContent = "";
        }

        const div: HTMLDivElement = document.querySelector("#events") || document.createElement("div");
        div.id = "events";

        if(div.children.length > 0) {
            removeChildren(div);
        }

        const date = document.createElement("h1");
        date.classList.add("modal__title");
        date.textContent = this.selectedDay.format("l d F Y", { capitalize: ["l"] });
        if(this.search) {
            this.eventsSection.setAttribute("data-visible", "true");
        }

        const closeModal = document.createElement("button");
        closeModal.classList.add("close__modal");
        closeModal.textContent = "✗";
        closeModal.addEventListener("click", () => {
            this.eventsSection.setAttribute("data-visible", "false");
            removeChildren(this.eventsSection);
            if(this.search !== "") {
                if(this.search === "dmy") {
                    window.location.href = window.location.href.split("?")[0];
                }
                this.search = "";
            }
        });

        const observer = new MutationObserver(() => {
            if(this.eventsSection.getAttribute("data-visible") === "true") {
                document.addEventListener("keydown", (e) => {
                    if(e.code === "Escape") {
                        this.eventsSection.setAttribute("data-visible", "false");
                        removeChildren(this.eventsSection);
                    }
                }, { once: true });
            }
        });

        observer.observe(this.eventsSection, { attributes: true });

        div.appendChild(date);
        div.insertAdjacentHTML("beforeend", "<h4><a class='add-event-from-day' href='/todolist'>Ajouter</a> un nouvel événement ce jour</h4>")

        div.querySelector("a[href='/todolist']").addEventListener("click", (e) => {
            localStorage.setItem("date", this.selectedDay.toString());
        });
        div.appendChild(closeModal);

        const eventsContainer = document.createElement("div");
        eventsContainer.classList.add("events__container");

        if(events.length === 0) {
            const div = document.createElement("div");
            div.classList.add("no__events");
            const h3 = document.createElement("h3");
            h3.textContent = "Il n'y a pas d'événements pour ce jour.";

            div.appendChild(h3);
            eventsContainer.appendChild(div);
        }

        for (const { id, name, start, end, state, description, category } of events) {
            const cat = await this.task.getCategory(category);

            const event = document.createElement("div");
            event.classList.add("event");

            const li = document.createElement("li");
            li.classList.add(`todo-item`);
            if(state) {
                li.classList.add("done");
            }

            const inputState = document.createElement("input");
            inputState.type = "checkbox";
            inputState.checked = state;
            li.appendChild(inputState);
            event.appendChild(li);

            const labelState = document.createElement("label");
            labelState.setAttribute("for", String(id));
            labelState.classList.add("tick");
            li.appendChild(labelState);

            labelState.addEventListener("click", () => {
                insertLoader("main", () => {
                    void this.task.toggleDone(id).then(() => {
                        void this.setTasks();
                    });
                });
            });

            const pName = document.createElement("p");
            pName.textContent = `Nom: ${name}`;
            event.appendChild(pName);

            const pCategory = document.createElement("p");
            pCategory.textContent = `Catégorie: ${cat.name}`;
            event.appendChild(pCategory);

            if(description !== null) {
                const pDescription = document.createElement("p");
                pDescription.textContent = `Description: ${description}`;
                event.appendChild(pDescription);
            }

            const pStart = document.createElement("p");
            pStart.textContent = `Début: ${new DateTime({ timestamp: Number(new Date(start)) }).format("d/m/Y")}`;
            event.appendChild(pStart);

            const pEnd = document.createElement("p");
            pEnd.textContent = `Fin: ${new DateTime({ timestamp: Number(new Date(end)) }).format("d/m/Y")}`;
            event.appendChild(pEnd);

            const btnDelete = document.createElement("button");
            btnDelete.id = "delete-task";
            event.appendChild(btnDelete);
            btnDelete.addEventListener("click", () => {
                void this.task.deleteTask(id).then(() => {
                    void this.setTasks();
                });
            });

            eventsContainer.appendChild(event);
        }
        div.append(eventsContainer);
        this.eventsSection.appendChild(div);
    }
}