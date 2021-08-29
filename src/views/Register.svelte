<script lang="ts">
    let error = "";
    function register() {
        const form = document.querySelector(".form");
        const email = form.querySelector<HTMLInputElement>("#email");
        const password = form.querySelector<HTMLInputElement>("#password");
        const passwordConfirmation = form.querySelector<HTMLInputElement>("#password_confirmation");
        if(password.value !== passwordConfirmation.value) {
            error = "Les mots de passe ne correspondent pas.";
            return;
        }
        const formData = new FormData();
        formData.append("email", email.value);
        formData.append("password", password.value);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:3333/register");
        xhr.send(formData);
        xhr.onload = () => {
            const response = JSON.parse(xhr.response);
            if(response.error) {
                const mailError = response["errors"].filter((err) => err.rule === "unique")[0];
                if(mailError) {
                    error = "Un utilisateur existe déjà avec cet email.";
                }
            }
        };

        xhr.onloadend = () => {
            const xhr2 = new XMLHttpRequest();
            xhr2.open("POST", "http://localhost:3333/login");
            xhr2.send(formData);
            xhr2.onload = () => {
                localStorage.setItem("UserData", xhr2.response);
            };
            xhr2.onloadend = () => {
                window.location.href = "/todolist";
            };
        };
    }
</script>

<div class="form">
    <h1 class="app-title">S'inscrire</h1>
    {#if error !== ""}
        <div class="error">{error}</div>
    {/if}
    <form on:submit|preventDefault={register}>
        <div class="form__group">
            <input id="email" class="form__field" type="text" aria-label="Enter a new todo item" placeholder="Email">
            <label for="email" class="form__label">Email</label>
        </div>
        <div class="form__group">
            <input id="password" class="form__field" type="password" aria-label="Enter your password" placeholder="Password">
            <label for="password" class="form__label">Mot de passe</label>
        </div>
        <div class="form__group">
            <input id="password_confirmation" class="form__field" type="password" aria-label="Enter your password" placeholder="Password confirmation">
            <label for="password_confirmation" class="form__label">Confirmer le mot de passe</label>
        </div>
        <a href="/login" class="link">Se connecter</a>
        <button type="submit">S'inscrire</button>
    </form>
</div>