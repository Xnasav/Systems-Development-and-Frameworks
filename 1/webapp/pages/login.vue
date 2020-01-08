<template>
  <div v-if="!isLoggedIn" id="login" :key="isLoggedIn">
    <h1>Login</h1>
    <input type="text" name="username" v-model="input.username" placeholder="Username"/>
    <input type="password" name="password" v-model="input.password" placeholder="Password"/>
    <button type="button" v-on:click="login()">Login</button>
  </div>
  <div v-else>
    <h1>Logout</h1>
    <button type="button" v-on:click="logout()">Logout</button>
  </div>

</template>

<script>
    import login from "~/apollo/mutations/login"
    import {LoginEvent} from '~/plugins/login-event'

    export default {
        name: 'Login',
        data() {
            return {
                input: {
                    username: "",
                    password: ""
                },
                isLoggedIn: false
            }
        },
        created() {
            this.emitLogin()
        },
        methods: {
            emitLogin() {
                this.isLoggedIn = this.$apolloHelpers.getToken()
                LoginEvent.$emit('login')
            },
            login() {
                this.$apollo.mutate({
                    // Query
                    mutation: login,
                    // Parameters
                    variables: {
                        login: this.input.username,
                        password: this.input.password
                    }
                }).then((result) => {
                    const token = result.data.login
                    this.$apolloHelpers.onLogin(token)
                    this.emitLogin()
                })
                this.input = {
                    username: "",
                    password: "",
                }
                alert("Logged in")
            },
            logout() {
                this.$apolloHelpers.onLogout()
                this.emitLogin()

            }
        }
    }
</script>

<style scoped>
  #login {
    width: 500px;
    border: 1px solid #CCCCCC;
    background-color: #FFFFFF;
    margin: auto;
    margin-top: 200px;
    padding: 20px;
  }
</style>
