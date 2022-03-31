<script lang="ts">
	import { API_URL } from "@App/config";
	import type { Token, TRouter, User } from "@App/types";
	import Calendar from "@Views/Calendar.svelte";
	import Login from "@Views/Login.svelte";
	import Logout from "@Views/Logout.svelte";
	import Profile from "@Views/Profile.svelte";
	import Register from "@Views/Register.svelte";
	import Todo from "@Views/Todo.svelte";
	import { Link, Route, Router } from "svelte-routing";
	import { Task } from "@App/Task";
	import { selectedCategoryStore, taskStore } from "@/stores";
	import { get } from "svelte/store";

	const token: Token | null = JSON.parse(localStorage.getItem("token"));
	let user: User;

	if (token) {
		fetch(`${API_URL}/me`, {
			headers: {
				authorization: `Bearer ${token.token}`,
			},
		}).then((response) => {
			if(response.status !== 200) {
				localStorage.removeItem("token");
			}
			return response.json();
		}).then((data) => {
			user = data;
		});

		taskStore.set(new Task({
			token: token.token,
			apiURL: API_URL,
		}));

		get(taskStore).getCategories().then((categories) => selectedCategoryStore.set(categories[0]));
	}

	const routes: TRouter = {
		"todolist": {
			name: "Todolist",
			component: Todo,
			alias: "/",
		},
		"calendar": {
			name: "Calendar",
			component: Calendar,
		},
		"login": {
			name: "Login",
			component: Login,
		},
		"logout": {
			name: "Logout",
			component: Logout,
		},
		"register": {
			name: "Register",
			component: Register,
		},
		"profile": {
			name: "Profile",
			component: Profile,
		},
	};
</script>

<main>
	<Router>
		<div class="header">
			{#each Object.keys(routes) as route}
				{#if !["login", "logout", "register", "profile"].includes(route)}
					<Link to="{route}">{routes[route].name}</Link>
				{/if}
			{/each}
			{#if user}
				<Link to="logout">Logout</Link>
				<Link to="profile">{user.email}</Link>
			{:else}
				<Link to="login">Login</Link>
				<Link to="register">Register</Link>
			{/if}
		</div>
		<div class="container">
			{#each Object.keys(routes) as route}
				<Route path="{route}" component="{routes[route].component}" />
				{#if routes[route].alias}
					<Route path="{routes[route].alias}" component="{routes[route].component}" />
				{/if}
			{/each}
		</div>
	</Router>
</main>
