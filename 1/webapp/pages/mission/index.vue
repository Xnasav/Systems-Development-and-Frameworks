<template>
  <div>
    <ul>
      <li v-for="mission in missions" :key="missions.id">
        <NuxtLink :to="`mission/${mission.id}`">
          {{ mission.message }} {{ mission.completed }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script>
    import missions from '~/apollo/queries/missions'


    export default {
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
