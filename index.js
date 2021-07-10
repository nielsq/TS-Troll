
var channelList = new Map();
var clientList = new Map();
var jailList = new Map();


const request = require('request');
const { TeamSpeak, TeamSpeakChannel } = require("ts3-nodejs-library")


  const teamspeak = new TeamSpeak({
    host: "",
    queryport: 10011, //optional
    serverport: 9987,
    username: "",
    password: "",
    nickname: "Teamspeak Bot"
  })
  
  teamspeak.on("ready", () => {
    console.log("Teamspeak Connected")
    genClientsList()
    genChannelList()
  })

  teamspeak.on("clientconnect", ev =>{
    ev.client.message("Hallo")
    clientList.set(ev.client.cid, ev.client)

    jailList.forEach(value =>{
      if(value.databaseId == ev.client.databaseId){
        ev.client.move(value.cid)
        ev.client.poke("Welcome back to your jail")
      }
    })

  })

  teamspeak.on("clientdisconnect", ev => {
    clientList.delete(ev.client.clid)

  })
  
  teamspeak.on("error", () => {
    //teamspeak had an error
  })

  teamspeak.on("clientmoved",ev =>{
    console.log(ev.client.nickname + " moved to " + ev.channel.name )

    jailList.forEach(value =>{
      if(value.databaseId == ev.client.databaseId && ev.channel.cid != value.cid){
        ev.client.move(value.cid)
        ev.client.poke("You stay in right there")
      }
    })

    if(ev.channel.name == "[cspacer] Ausgang"){
      //ev.client.kickFromServer()
    }
  })

  teamspeak.on("textmessage", async ev =>  {

    if(ev.msg.startsWith("!movernd")){
      
      if(ev.msg.split(" ").length == 1){
        ev.invoker.move(channelList.get(getRandomChannelKey()).cid)
      } else {
        for( i = 0; i < parseInt(ev.msg.split(" ")[1]); i++){
          await sleep(1000)
          ev.invoker.move(channelList.get(getRandomChannelKey()).cid)
        }
      }
    } else if(ev.msg.startsWith("!jail")){

      console.log("Jailing " + ev.msg.split(' ')[1] + " into " + ev.msg.split(' ')[2])

      var obj = {
        databaseId : null,
        cid : null
      };
      var successUser = false;
      var successChannel = false;
      var clid 
      var currc


      clientList.forEach((value) =>{
        if(value.nickname == ev.msg.split(' ')[1] ){
          console.log("Jailing the dbid " + value.databaseId)
          clid = value.clid;
          obj.databaseId = value.databaseId
          successUser = true
        }
      })

      channelList.forEach((value) =>{
        if(value.name == ev.msg.split(' ')[2] ){
          obj.cid = value.cid
          console.log("Jailing into cid " + obj.cid)
          successChannel = true;
        }
      })


      if(successChannel && successUser){

        jailList.set(obj.databaseId, obj)
        
        teamspeak.clientPoke(clid,"You have been Jailed")
        ev.invoker.message("Successfully jailed")

       

      } else if (!successChannel && successUser){
        ev.invoker.message("Channel not found")
        console.log("Channel not found")
      } else if (successChannel && !successUser){
        ev.invoker.message("User not found")
        console.log("User not found")
      } else {
        ev.invoker.message("Channel and User not found")
        console.log("Channel and User not found")
      }

      
      
    
    } else if(ev.msg.startsWith("!unjail")){
      jailList.delete(ev.invoker.databaseId)
      ev.invoker.message("You are free")
    } else if(ev.msg.startsWith("!getClid")){
      
      clientList.forEach((value) =>{
        
        if(value.nickname == ev.msg.split(' ')[1] ){
          ev.invoker.message(value.clid)
        }

      })

    } else if(ev.invoker.nickname == "Teamspeak Bot") {
      console.log("Bot sended message")
    } else if(ev.msg == "!kickall") {
      const clients = await teamspeak.clientList({ clientType: 0 })
      clients.forEach(client => {

        client.kickFromServer()
    })
    } else {

      if(false){
        console.log("cat fact incoming")
      
        request('https://catfact.ninja/fact?max_length=100', function (error, response, body) {
          ev.invoker.message(JSON.parse(body).fact)
        });
      } else {
        console.log("CUCK")
      
        request('https://api.chucknorris.io/jokes/random', function (error, response, body) {
          ev.invoker.message(JSON.parse(body).value)
        });
      }
      
      
    }
    
  })
  
  async function genClientsList(){

    const clients = await teamspeak.clientList({ clientType: 0 })
    clients.forEach(client => {
      if(client.nickname == "Niels" || client.nickname == "Fynn"  ){
        client.message("Hallo")
      }
      clientList.set(client.clid, client)
    })
  }

  async function genChannelList(){

    const channels = await teamspeak.channelList()
    channels.forEach(channel => {

      channelList.set(channel.cid, channel)
    })
 
  }

  function getRandomChannelKey(collection) {
    let index = Math.floor(Math.random() * channelList.size);
    let cntr = 0;
    for (let key of channelList.keys()) {
      if (cntr++ === index) {
          return key;
      }
    }
  } 

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 
