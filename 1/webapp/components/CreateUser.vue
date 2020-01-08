<template>
  <div id="createuser">
    <input type="text" name="username" v-model="input.username" placeholder="Username" />
    <input type="password" name="password" v-model="input.password" placeholder="Password" />
    <input type="password" name="passwordRepeat" v-model="input.passwordRepeat" placeholder="Repeat Password" />
    <button type="button" v-on:click="createUser()">Create User</button>
  </div>
</template>

<script>
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
                    console.log("User created")
                } else {
                    console.log("Passwords are not the same")
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
