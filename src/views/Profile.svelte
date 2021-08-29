<script>
    const userData = JSON.parse(localStorage.getItem("UserData"));
</script>

<div class="profile">
    <form>
        <div class="form__group">
            <input id="email" type="text" class="form__field field" value={userData.email}>
            <label for="email" class="form__label">Email</label>
        </div>
        <div class="form__group">
            <input id="password" type="text" class="form__field field" placeholder="Mot de passe">
            <label for="password" class="form__label">Mot de passe</label>
        </div>
        <button class="edit__profile">Éditer le profil</button>
    </form>
</div>