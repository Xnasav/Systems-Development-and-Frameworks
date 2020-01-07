<template>
  <div id="app">
    <Header></Header>
    <AddMission v-on:addMission="addMission"></AddMission>
    <Missions v-bind:missions="missions" v-on:del-mission="deleteMission" v-on:edit-mission="editMission"/>
  </div>
</template>

<script>
import Missions from './components/Missions'
import AddMission from './components/AddMission'
import Header from './components/layout/Header'


export default {
  name: 'app',
  components: {
    Header,
    Missions,
    AddMission
  },
  data() {
    return {
      missions: [
        { id: '1', message: 'Einkaufen', completed: false},
        { id: '2', message: 'Aufräumen', completed: false},
        { id: '3', message: 'Putzen', completed: false}
      ],
      nextMissionId: 4
    }
  },
  methods: {
    addMission(newMission) {
      newMission.id = this.nextMissionId++
      this.missions.push(newMission)
    },
    editMission(id, newMessage) {
      this.missions.map(mission => {
        if(mission.id === id) {
          mission.message = newMessage
        }
      })
    },
    deleteMission(id) {
      this.missions = this.missions.filter(mission => mission.id != id)
    }
  }
}
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.4;
  }
  .btn {
    display: inline-block;
    border: none;
    background: #555;
    color: #fff;
    padding: 7px 20px;
    cursor: pointer;
  }
  .btn:hover {
    background: #666;
  }
</style>
