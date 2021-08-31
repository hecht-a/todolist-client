<script lang="ts">
    import { API_URL } from "@App/config";

    function login() {
        const form = document.querySelector(".form");
        const email = form.querySelector<HTMLInputElement>("#email");
        const password = form.querySelector<HTMLInputElement>("#password");
        const formData = new FormData();
        formData.append("email", email.value);
        formData.append("password", password.value);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${<string>API_URL}/login`);
        xhr.send(formData);
        xhr.onload = () => {
            localStorage.setItem("UserData", xhr.response);
        };
        xhr.onloadend = () => {
            window.location.href = "/";
        };
    }
</script>

<div class="form">
    <h1 class="app-title">Connexion</h1>
    <form on:submit|preventDefault={login}>
        <div class="form__group">
            <input id="email" class="form__field" type="text" aria-label="Enter a new todo item" placeholder="Email">
            <label for="email" class="form__label">Email</label>
        </div>
        <div class="form__group">
            <input id="password" class="form__field" type="password" aria-label="Enter your password"
                   placeholder="Password">
            <label for="password" class="form__label">Mot de passe</label>
        </div>
        <a href="/register" class="link">S'inscrire</a>
        <button type="submit">Se connecter</button>
    </form>
</div>