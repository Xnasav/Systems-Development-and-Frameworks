<template>
    <div>
        <div v-bind:key="mission.id" v-for="mission in missions">
            <MissionItem v-bind:mission="mission" v-on:del-mission="$emit('del-mission', mission.id)" v-on:edit-mission="editMission"/>
        </div>
    </div>
</template>

<script>
    import MissionItem from './MissionItem.vue'

    export default {
        name: "Missions",
        components: {
            MissionItem
        },
        props: ["missions"],
        methods: {
            editMission(id, newMessage){
                this.$emit('edit-mission', id, newMessage)
            }
        }
    }
</script>

<style scoped>

</style>