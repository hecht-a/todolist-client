export async function insertLoader(element: string, fn: () => Promise<void> | void): Promise<void> {
    document.querySelector(element).insertAdjacentHTML("beforeend", "<div class='loader'><div class='lds-roller'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>");

    await fn();

    if (document.querySelector(".loader")) {
        document.querySelector(".loader").remove();
    }
}