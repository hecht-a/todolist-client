<script lang="ts">
    import { API_URL } from "@App/config";
    import { errorStore } from "@/stores";
    import { get } from "svelte/store";

    const error = get(errorStore);

    function register (): void {
        const form = document.querySelector(".form");
        const email = form.querySelector<HTMLInputElement>("#email").value;
        const password = form.querySelector<HTMLInputElement>("#password").value;
        const passwordConfirmation = form.querySelector<HTMLInputElement>("#password_confirmation").value;
        if (password !== passwordConfirmation) {
            errorStore.set({ message:"Les mots de passe ne correspondent pas.", color: "" });
            return;
        }
        fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password, passwordConfirmation })
        }).then((response) => response.json())
            .then((data) => {
                localStorage.setItem("token", JSON.stringify(data));
                window.location.href = "/login";
            });
    }
</script>

<div class="form">
    <h1 class="app-title">S'inscrire</h1>
    {#if error.message !== ""}
        <div class="error">{error.message}</div>
    {/if}
    <form on:submit|preventDefault={() => register()}>
        <div class="form__group">
            <input id="email" class="form__field" type="text" aria-label="Enter a new todo item" placeholder="Email">
            <label for="email" class="form__label">Email</label>
        </div>
        <div class="form__group">
            <input id="password" class="form__field" type="password" aria-label="Enter your password"
                   placeholder="Password">
            <label for="password" class="form__label">Mot de passe</label>
        </div>
        <div class="form__group">
            <input id="password_confirmation" class="form__field" type="password" aria-label="Enter your password"
                   placeholder="Password confirmation">
            <label for="password_confirmation" class="form__label">Confirmer le mot de passe</label>
        </div>
        <a href="/login" class="link">Se connecter</a>
        <button type="submit">S'inscrire</button>
    </form>
</div>
