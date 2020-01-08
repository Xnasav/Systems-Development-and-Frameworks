<template>
  <div>
    <div v-bind:key="mission.id" v-for="mission in missions">
      <MissionItem v-bind:mission="mission" v-on:del-todo="$emit('del-mission', mission.id)"
                   v-on:edit-mission="editMission"/>
    </div>
  </div>
</template>

<script>
    import MissionItem from "./Missions/MissionItem";
    import missions from '~/apollo/queries/missions'


    export default {
        name: "Missions",
        components: {
            MissionItem
        },
        props: ["mission"],
        apollo: {
            missions: {
                prefetch: true,
                query: missions,
                variables() {
                    return {limit: 2, skip: 0}
                }
            },
        },
        methods: {
            editMission(id, newMessage) {
                console.log(id + " " + newMessage)
            }
        }
    }
</script>

<style scoped>

</style>
