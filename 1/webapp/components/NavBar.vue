<template>
  <div class="nav">
    <nuxt-link to="/" class="brand">Mission Report</nuxt-link>
    <nav>
      <nuxt-link v-if="isLoggedIn" to="/mission">Missions</nuxt-link>&nbsp;
      <nuxt-link v-if="!isLoggedIn" to="/user">Create User</nuxt-link>
      <nuxt-link v-if="!isLoggedIn" to="/login">Login</nuxt-link>
      <nuxt-link v-else to="/login">logout</nuxt-link>
    </nav>
  </div>
</template>

<script>
    import {LoginEvent} from '~/plugins/login-event'

    export default {
        name: 'NavBar',
        data() {
            return {
                isLoggedIn: false
            }
        },
        created() {
            LoginEvent.$on('login', () => {
                this.isLoggedIn = this.$apolloHelpers.getToken()
            });
        }
    }
</script>

<style scoped>
  .brand {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.5em;
    color: #39b982;
    text-decoration: none;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
  }

  .nav .nav-item {
    box-sizing: border-box;
    margin: 0 5px;
    color: rgba(0, 0, 0, 0.5);
    text-decoration: none;
  }

  .nav .nav-item.router-link-exact-active {
    color: #39b982;
    border-bottom: solid 2px #39b982;
  }

  .nav a {
    display: inline-block;
  }
</style>
