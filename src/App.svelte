<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";

  import Todo from "./views/Todo.svelte";
  import Login from "./views/Login.svelte";
  import Logout from "./views/Logout.svelte";
  import Register from "./views/Register.svelte";
  import Home from "./views/Home.svelte";
  import Calendar from "./views/Calendar.svelte";
  import Profile from "./views/Profile.svelte";
  import type { TRouter, UserData } from "./App/types";

  const userData: UserData = JSON.parse(localStorage.getItem("UserData"));

  const routes: TRouter = {
    "/": {
      name: "Home",
      component: Home
    },
    "todolist": {
      name: "Todolist",
      component: Todo
    },
    "/calendar": {
      name: "Calendar",
      component: Calendar
    },
    "login": {
      name: "Login",
      component: Login
    },
    "logout": {
      name: "Logout",
      component: Logout
    },
    "register": {
      name: "Register",
      component: Register
    },
    "profile": {
      name: "Profile",
      component: Profile
    }
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
      {#if userData}
        <Link to="logout">Logout</Link>
        <Link to="profile">{userData.email}</Link>
      {:else}
        <Link to="login">Login</Link>
        <Link to="register">Register</Link>
      {/if}
    </div>
    <div class="container">
      {#each Object.keys(routes) as route}
        <Route path="{route}" component="{routes[route].component}"/>
      {/each}
    </div>
  </Router>
</main>