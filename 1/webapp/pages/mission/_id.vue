<template>
  <div v-if="mission">
    {{mission.message}}
  </div>
</template>

<script>
    import mission from '~/apollo/queries/mission'

    export default {
        apollo: {
            mission: {
                query: mission,
                prefetch: ({ route }) => ({ id: route.params.id }),
                variables() {
                    return {id: this.$route.params.id}
                }
            },
        },
        data() {
            return {
                isInEditMode: false,
                newMessage: ""
            }
        },
        methods: {
            markComplete() {
                this.completed = !this.completed
            },
            editTodo(id, newMessage) {
                this.$emit('edit-todo', id, newMessage)
                this.isInEditMode = !this.isInEditMode
                this.newMessage = ""
            }
        }
    }
</script>

<style scoped>
  .todo-item {
    background: #f4f4f4;
    padding: 10px;
    border-bottom: 1px #ccc dotted;
  }

  .is-complete {
    text-decoration: line-through;
  }
  .edit {
    background: #555;
    color: #fff;
    border: none;
    padding: 5px 9px;
    border-radius: 50%;
    cursor: pointer;
  }

  .del {
    background: #ff0000;
    color: #fff;
    border: none;
    padding: 5px 9px;
    border-radius: 50%;
    cursor: pointer;
    float: right;
  }

  #edit {
    display: flex;
  }
</style>
