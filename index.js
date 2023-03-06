(async()=>{
    // default imports
    //token in line 106
    const events = require('events');
    const { exec } = require("child_process")
    const logs = require("discord-logs")
    const Discord = require("discord.js")
    const { 
        MessageEmbed, 
        MessageButton, 
        MessageActionRow, 
        Intents, 
        Permissions, 
        MessageSelectMenu 
    }= require("discord.js")
    const fs = require('fs');
    let process = require('process');
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // block imports
    let URL = require('url')
    let https = require("https")
    const Database  = require("easy-json-database")
    
    // define s4d components (pretty sure 90% of these arnt even used/required)
    let s4d = {
        Discord,
        fire:null,
        joiningMember:null,
        reply:null,
        player:null,
        manager:null,
        Inviter:null,
        message:null,
        notifer:null,
        checkMessageExists() {
            if (!s4d.client) throw new Error('You cannot perform message operations without a Discord.js client')
            if (!s4d.client.readyTimestamp) throw new Error('You cannot perform message operations while the bot is not connected to the Discord API')
        }
    };

    // check if d.js is v13
    if (!require('./package.json').dependencies['discord.js'].startsWith("^13.")) {
      let file = JSON.parse(fs.readFileSync('package.json'))
      file.dependencies['discord.js'] = '^13.12.0'
      fs.writeFileSync('package.json', JSON.stringify(file))
      exec('npm i')
      throw new Error("Seems you arent using v13 please re-run or run `npm i discord.js@13.12.0`");
    }

    // check if discord-logs is v2
    if (!require('./package.json').dependencies['discord-logs'].startsWith("^2.")) {
      let file = JSON.parse(fs.readFileSync('package.json'))
      file.dependencies['discord-logs'] = '^2.0.0'
      fs.writeFileSync('package.json', JSON.stringify(file))
      exec('npm i')
      throw new Error("discord-logs must be 2.0.0. please re-run or if that fails run `npm i discord-logs@2.0.0` then re-run");
    }

    // create a new discord client
    s4d.client = new s4d.Discord.Client({
        intents: [
            Object.values(s4d.Discord.Intents.FLAGS).reduce((acc, p) => acc | p, 0)
        ],
        partials: [
            "REACTION", 
            "CHANNEL"
        ]
    });

    // when the bot is connected say so
    s4d.client.on('ready', () => {
        console.log(s4d.client.user.tag + " is alive!")
    })

    // upon error print "Error!" and the error
    process.on('uncaughtException', function (err) {
        console.log('Error!');
        console.log(err);
    });

    // give the new client to discord-logs
    logs(s4d.client);

    // pre blockly code
    s4d.database = new Database('./database.json')

    // blockly code
    var random_coin, coins, coin_answer, give_answer;
    
    function mathRandomInt(a, b) {
      if (a > b) {
        // Swap a and b to ensure a is smaller.
        var c = a;
        a = b;
        b = c;
      }
      return Math.floor(Math.random() * (b - a + 1) + a);
    }
    
    function colourRandom() {
      var num = Math.floor(Math.random() * Math.pow(2, 24));
      return '#' + ('00000' + num.toString(16)).substr(-6);
    }
    
    
    await s4d.client.login('TOKEN').catch((e) => {
            const tokenInvalid = true;
            const tokenError = e;
            if (e.toString().toLowerCase().includes("token")) {
                throw new Error("An invalid bot token was provided!")
            } else {
                throw new Error("Privileged Gateway Intents are not enabled! Please go to https://discord.com/developers and turn on all of them.")
            }
        });
    
    s4d.client.on('messageCreate', async (s4dmessage) => {
      if (!((s4dmessage.author).bot)) {
        if (!s4d.database.has(String(('coins-' + String((s4dmessage.author).id))))) {
          s4d.database.set(String(('coins-' + String((s4dmessage.author).id))), 0);
        }
        random_coin = mathRandomInt(1, 10);
        coins = s4d.database.get(String(('coins-' + String((s4dmessage.author).id))));
        s4d.database.add(String(('coins-' + String((s4dmessage.author).id))), parseInt(random_coin));
        if ((s4dmessage.content) == '$bal') {
          var embed = new Discord.MessageEmbed()
             embed.setColor((colourRandom()));
            embed.setTitle('ACCOUNT');
            embed.setThumbnail(((s4dmessage.author).displayAvatarURL({format:"png"})));
            embed.setDescription(([s4dmessage.author,' you currently have ',coins,' coins in your account.'].join('')));
            (s4dmessage.channel).send({embeds:[embed]});
    
        } else if (((s4dmessage.content) || '').startsWith('$bal' || '')) {
          if (!((s4dmessage.content) == '$bal')) {
            try{
                      if (!s4d.database.has(String(('coins-' + String((s4dmessage.mentions.members.first().user).id))))) {
                s4d.database.set(String(('coins-' + String((s4dmessage.mentions.members.first().user).id))), 0);
              }
              var embed = new Discord.MessageEmbed()
                 embed.setColor((colourRandom()));
                embed.setTitle('ACCOUNT');
                embed.setThumbnail(((s4dmessage.mentions.members.first().user).displayAvatarURL({format:"png"})));
                embed.setDescription(([s4dmessage.mentions.members.first().user,' currently has ',s4d.database.get(String(('coins-' + String((s4dmessage.mentions.members.first().user).id)))),' coins in their account.'].join('')));
                (s4dmessage.channel).send({embeds:[embed]});
    
    
                }catch(err){
                      s4dmessage.channel.send({content:String('ping a valid member')});
    
                };
                }
        }
        if (((s4dmessage.content) || '').startsWith('$editcoins' || '')) {
          if ((s4dmessage.member).permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            try{
                      if (!s4d.database.has(String(('coins-' + String((s4dmessage.mentions.members.first().user).id))))) {
                s4d.database.set(String(('coins-' + String((s4dmessage.mentions.members.first().user).id))), 0);
              }
              (s4dmessage.channel).send(String('how many coins do you want to add')).then(() => { (s4dmessage.channel).awaitMessages({filter:(m) => m.author.id === (s4dmessage.member).id,  time: (10*60*1000), max: 1 }).then(async (collected) => { s4d.reply = collected.first().content;
               s4d.message = collected.first();
                 coin_answer = (s4d.reply);
                if ((coin_answer % 2 === 0 || coin_answer % 2 === 1) && coin_answer >= -1000000 && coin_answer <= 1000000) {
                  s4d.database.add(String(('coins-' + String((s4dmessage.mentions.members.first().user).id))), parseInt(coin_answer));
                  s4dmessage.channel.send({content:String((['added ',coin_answer,' coins to the member'].join('')))});
                } else {
                  s4dmessage.channel.send({content:String('enter a valid number between -1000000 and 1000000 and also redo the edit coins process to edit coins of a member')});
                }
    
               s4d.reply = null; }).catch(async (e) => { console.error(e);  });
              })
    
                }catch(err){
                      s4dmessage.channel.send({content:String('ping a valid memeber')});
    
                };
                } else {
            s4dmessage.channel.send({content:String('you need the manage server permission to use this command')});
          }
        } else if (((s4dmessage.content) || '').startsWith('$reset' || '')) {
          if ((s4dmessage.member).permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            try{
                      s4d.database.set(String(('coins-' + String((s4dmessage.mentions.members.first().user).id))), (coins - coins));
              var embed = new Discord.MessageEmbed()
                 embed.setColor((colourRandom()));
                embed.setDescription(([s4dmessage.author,' reset the coin count for ',s4dmessage.mentions.members.first().user,' to 0'].join('')));
                (s4dmessage.channel).send({embeds:[embed]});
    
    
                }catch(err){
                      s4dmessage.channel.send({content:String('ping a valid memeber')});
    
                };
                } else {
            s4dmessage.channel.send({content:String('you need the manage server permission to use this command')});
          }
        }
        if (((s4dmessage.content) || '').startsWith('$give' || '')) {
          try{
                    if (!s4d.database.has(String(('coins-' + String((s4dmessage.mentions.members.first().user).id))))) {
              s4d.database.set(String(('coins-' + String((s4dmessage.mentions.members.first().user).id))), 0);
            }
            (s4dmessage.channel).send(String('how many coins do you want to give to the member')).then(() => { (s4dmessage.channel).awaitMessages({filter:(m) => m.author.id === (s4dmessage.member).id,  time: (10*60*1000), max: 1 }).then(async (collected) => { s4d.reply = collected.first().content;
             s4d.message = collected.first();
               give_answer = (s4d.reply);
              if (give_answer % 2 === 0 || give_answer % 2 === 1) {
                if (coins >= give_answer) {
                  s4d.database.subtract(String(('coins-' + String((s4dmessage.author).id))), parseInt(give_answer));
                  s4d.database.add(String(('coins-' + String((s4dmessage.mentions.members.first().user).id))), parseInt(give_answer));
                  var embed = new Discord.MessageEmbed()
                     embed.setColor((colourRandom()));
                    embed.setDescription(([s4dmessage.author,' you successfully gave ',give_answer,' coins to ',s4dmessage.mentions.members.first().user].join('')));
                    (s4dmessage.channel).send({embeds:[embed]});
    
                } else {
                  s4dmessage.channel.send({content:String('you dont have enough coins to donate to the member')});
                }
              } else {
                s4dmessage.channel.send({content:String('enter a valid number and also redo the give process to give coins to the member')});
              }
    
             s4d.reply = null; }).catch(async (e) => { console.error(e);  });
            })
    
              }catch(err){
                    s4dmessage.channel.send({content:String('ping a valid memeber')});
    
              };
              }
      }
    
    });
    
    return s4d
})();
