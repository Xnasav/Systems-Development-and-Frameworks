### Start the server

```shell script
npm install
npm start
```

#####  GraphQL queries
```javascript
# Write your query or mutation here
query AllMissions{
  missions{
    message
    completed
    id
  }
}

mutation NewMission{
  addMission(message: "Apollo Server starten") {
    message
  }
}

mutation RemoveMission{
  deleteMission(id: 3)
}

mutation EditMission{
  editMission(id: 3, message: "Apollo Server zweimal Starten"){
    message
  }
}

mutation FirstLogin{
  login(usr:"dducky", pwd:"phantomiasiscool")
}

mutation FinishItem{
  finishMission(id:1){
    message
  	completed
  }
}
```