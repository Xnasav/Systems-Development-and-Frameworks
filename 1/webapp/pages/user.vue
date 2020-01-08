<template>
  <div id="user">
    <input type="text" name="username" v-model="input.username" placeholder="Username" />
    <input type="password" name="password" v-model="input.password" placeholder="Password" />
    <input type="password" name="passwordRepeat" v-model="input.passwordRepeat" placeholder="Repeat Password" />
    <button type="button" v-on:click="createUser()">Create User</button>
  </div>
</template>

<script>
    import createuser from "~/apollo/mutations/createuser.gql"

    export default {
        name: 'Login',
        data() {
            return {
                input: {
                    username: "",
                    password: "",
                    passwordRepeat: ""
                }
            }
        },
        methods: {
            createUser() {
                if (this.input.passwordRepeat === this.input.password) {
                    this.$apollo.mutate({
                        // Query
                        mutation: createuser,
                        // Parameters
                        variables: {
                            login: this.input.username,
                            password: this.input.password
                        }
                    })
                    this.input = {
                        username: "",
                        password: "",
                        passwordRepeat: ""
                    }
                    alert("Created user " + this.input.username)
                } else {
                    alert("Passwords are not identical")
                }
            }
        }
    }
</script>

<style scoped>
  #createuser {
    width: 500px;
    border: 1px solid #CCCCCC;
    background-color: #FFFFFF;
    margin: auto;
    margin-top: 200px;
    padding: 20px;
  }
</style>
