<template>
  <div>
    <div v-bind:key="mission.id" v-for="mission in missions">
      <MissionItem v-bind:mission="mission" v-on:del-todo="$emit('del-mission', mission.id)" v-on:edit-mission="editMission"/>
    </div>
  </div>
</template>

<script>
    import MissionItem from "./Missions/MissionItem";

    export default {
        name: "Missions",
        components: {
            MissionItem
        },
        props: ["mission"],
        data() {
            return {
                missions: [
                    { id: '1', message: 'Destroy terror', completed: false},
                    { id: '2', message: 'Do agent stuff', completed: false},
                    { id: '3', message: 'Eat', completed: false}
                ],
                nextTodoId: 4
            }
        },
        methods: {
            editMission(id, newMessage){
                console.log(id + " " + newMessage)
            }
        }
    }
</script>

<style scoped>

</style>
