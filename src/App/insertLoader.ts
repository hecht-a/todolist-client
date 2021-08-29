export async function insertLoader(element: string, instruction: () => Promise<void> | void): Promise<void> {
    document.querySelector(element).insertAdjacentHTML("beforeend", "<div class='loader'><div class='lds-roller'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>");

    await instruction();

    document.querySelector(".loader").remove();
}