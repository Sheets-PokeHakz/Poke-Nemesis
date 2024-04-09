const Discord = require("discord.js-selfbot-v13");
const client = new Discord.Client({
  checkUpdate: false
});
const express = require('express');
const {
  solveHint,
  checkRarity
} = require("pokehint");
const {
  ocrSpace
} = require('ocr-space-api-wrapper');

const config = require('./config.json');
const json = require('./namefix.json');
const allowedChannels = []; // Add your allowed channel IDs to this array or leave it like [] if you want it to catch from all channels
let isSleeping = false;
let isSpamming = true;


//------------------------- KEEP-ALIVE--------------------------------//

const app = express();
if (Number(process.version.slice(1).split(".")[0]) < 8) {
  throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");
}
app.get("/", (req, res) => {
  res.status(200).send({
    success: "true"
  });
});
app.listen(process.env.PORT || 3000);

//-------------------------SOME EXTRA FUNCTIONS----------------------------//

function findOutput(input) {
  if (json.hasOwnProperty(input)) {
    return json[input];
  } else {
    return input;
  }
}


function checkSpawnsRemaining(string) {
  const match = string.match(/Spawns Remaining: (\d+)/);
  if (match) {
    const spawnsRemaining = parseInt(match[1]);
    console.log(spawnsRemaining)
  }
}

function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spam() {
  if (isSpamming) {
    const channel = client.channels.cache.get(config.spamChannelID);
    const result = Math.random().toString(36).substring(2, 15);
    channel.send(result + "PokeNemesis Spamming Hard");
    const randomInterval = getRandomInterval(1500, 5000); // Random interval for spam between 1 second and 5 seconds
    setTimeout(spam, randomInterval);
  }
}
//-------------------------READY HANDLER+SPAMMER-----------------------//


client.on('ready', () => {
  console.log("PokeNemesis");
  console.log(`Account: ${client.user.username} is ONLINE.`);
  console.log(" ");
  console.log("Note: When you're using Incense, make sure it occurs in a separate channel where hint bots like pokename/sierra aren't enabled to send messages there!");
  console.log(" ");
  console.log("Use $help to know about commands");

  const channel = client.channels.cache.get(config.spamChannelID);

  // (Removed duplicate getRandomInterval function)

  function spam() {
    if (isSpamming) {
      const result = Math.random().toString(36).substring(2, 15);
      channel.send(result + "PokeNemesis Spamming Hard");
      const randomInterval = getRandomInterval(1500, 5000); // Random interval for spam between 1 second and 5 seconds
      setTimeout(spam, randomInterval);
    }
  }

  spam();
});

//-------------------------Anti-Crash-------------------------//

process.on("unhandledRejection", (reason, p) => {
  if (reason == "Error: Unable to identify that pokemon.") { } else {
    console.log(" [antiCrash] :: Unhandled Rejection/Catch");
    console.log(reason, p);
  }
});
process.on("uncaughtException", (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch");
  console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  console.log(" [antiCrash] :: Multiple Resolves");
  console.log(type, promise, reason);
});

//----------------------------AUTOCATCHER--------------------------------------//

client.on('messageCreate', async message => {
  if (message.content === "$captcha_completed" && message.author.id === config.OwnerID) {
    isSleeping = false;
    message.channel.send("Autocatcher Started!");
  }

  if (message.content === "$help" && message.author.id === config.OwnerID) {
    // ...
  }

  // New "stop" command to stop spamming
  if (message.content === "$stop" && message.author.id === config.OwnerID) {
    isSpamming = false;
    message.channel.send("Spamming stopped!");
  }

  // New "start" command to start spamming
  if (message.content === "$start" && message.author.id === config.OwnerID) {
    isSpamming = true;
    message.channel.send("Spamming started!");
    spam();
  }

  if (!isSleeping) {
    if (message.content.includes("Please tell us") && message.author.id === "716390085896962058") {
      isSleeping = true;
      message.channel.send("Autocatcher Stopped, Captcha Detected! Use `$captcha_completed` once the captcha is solved.");
      setTimeout(async () => {  // <--- Added () here
        isSleeping = false;
      }, 18000000); // 5 hours
    } else if (message.content.startsWith("$say") && message.author.id == config.OwnerID) {
      let say = message.content.split(" ").slice(1).join(" ");
      message.channel.send(say);
    } else if (message.content.startsWith("$react") && message.author.id == config.OwnerID) {
      let msg;
      try {
        const args = message.content.slice(1).trim().split(/ +/g);
        msg = await message.channel.messages.fetch(args[1]);
      } catch (err) {
        message.reply(`Please specify the message ID as an argument like "$react <messageID>".`);
      }
      if (msg) {
        try {
          msg.react("✅");
          message.react("✅");
        } catch (err) {
          message.react("❌");
          console.log(err);
        }
      }
    } else if (message.content.startsWith("$click") && message.author.id == config.OwnerID) {
      let msg;
      try {
        var args = message.content.slice(1).trim().split(/ +/g);
        msg = await message.channel.messages.fetch(args[1]);
      } catch (err) {
        message.reply(`Please specify the message ID as an argument like "$click <messageID>".`);
      }
      if (msg) {
        try {
          await msg.clickButton();
          message.react("✅");
        } catch (err) {
          message.react("❌");
          console.log(err);
        }
      }
    } else if (message.author.id === '854233015475109888') {
        const messageContent = message.content;
        const colonIndex = messageContent.indexOf(':');
        if (colonIndex !== -1) {
          const pokemonName = messageContent.substring(0, colonIndex).trim();
          message.channel.send(`<@716390085896962058> c ${pokemonName}`);
          console.log("A Pokemon Spawned, Catching ");
    } else if (allowedChannels.length > 0 && !allowedChannels.includes(message.channel.id)) {
              return;
            }
            const Pokebots = ["696161886734909481", "874910942490677270"]; //sierra ,pokename
            if (Pokebots.includes(message.author.id)) {
              let preferredURL = null;
              message.embeds.forEach((e) => {
                if (e.image) {
                  const imageURL = e.image.url;
                  if (imageURL.includes("prediction.png")) {
                    preferredURL = imageURL;
                  } else if (imageURL.includes("embed.png") && !preferredURL) {
                    preferredURL = imageURL;
                  }
                }
              });

              if (preferredURL) {
                let url = preferredURL;


                async function main() {
                  try {
                    const res1 = await ocrSpace(url, {
                      apiKey: `${config.ocrSpaceApiKey}`
                    });
                    const name1 = res1.ParsedResults[0].ParsedText.split('\r')[0];
                    const name5 = name1.replace(/Q/g, 'R');
                    const name = findOutput(name5);

                    const delay = Math.floor(Math.random() * 6 + 5) * 1000; //interval from 5-10seconds
                    console.log("A Pokemon Spawned, Catching in " + (delay / 1000) + "seconds")
                    setTimeout(async () => {
                      message.channel.send(`<@716390085896962058> c ${name}`)
                        .then(a => { }).catch(error => {
                          console.error(error);
                          const channel = client.channels.cache.get(config.errorChannelID)
                          channel.send(error)
                        })


                      const filter = (msg) => msg.author.id === "716390085896962058";
                      const collector = new Discord.MessageCollector(message.channel, filter, {
                        max: 1,
                        time: 13000
                      }); // Collect only one message in 10 seconds

                      collector.on('collect', async (collected) => {


                        if (collected.content.includes("Congratulations")) {

                          function capitalizeFirstLetter(str) {
                            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                          }

                          let rareity;
                          const name2 = capitalizeFirstLetter(name)
                          try {
                            rareity = await checkRarity(`${name2}`)
                          } catch {
                            rareity = "Not Found in Database"
                          }
                          const logchannel = client.channels.cache.get(config.logChannelID)
                          logchannel.send("[" + collected.guild.name + "/#" + collected.channel.name + "] " + "**__" + name2 + "__** " + "Rarity " + rareity + " PokeNemesis").then(b => { }).catch(error => {

                            console.error(error);
                            const channel = client.channels.cache.get(config.errorChannelID)
                            channel.send(error)
                          })

                          collector.stop();


                        }



                      });


                    }, delay);


                  } catch (error) {
                    console.error(error);
                    const channel = client.channels.cache.get(config.errorChannelID)
                    channel.send(error)
                  }
                }
              }
              main()
            }

          }
        }
      
    
  
});
client.login(process.env['TOKEN']) 
