<script lang="ts">
	import { API_URL } from "@App/config";
	import type { Token, User } from "@App/types";

	const token: Token | null = JSON.parse(localStorage.getItem("token"));
	let user: User;

	fetch(`${API_URL}/me`, {
		headers: {
			authorization: `Bearer ${token.token}`,
		},
	}).then((response) => response.json()).then((data) => {
		user = data;
	});
</script>

<div class="profile">
	<form>
		<div class="form__group">
			<input id="email" type="text" class="form__field field" value={user && user.email}>
			<label for="email" class="form__label">Email</label>
		</div>
		<div class="form__group">
			<input id="password" type="text" class="form__field field" placeholder="Mot de passe">
			<label for="password" class="form__label">Mot de passe</label>
		</div>
		<button class="edit__profile">Éditer le profil</button>
	</form>
</div>
