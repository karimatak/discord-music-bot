require('dotenv').config();
const express = require('express');
const app = express();
const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const { validateURL } = require("ytdl-core");
const getYoutubeVideoInfo = require("./youtube");

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on porte ${PORT}`)
})

app.get('/', (req,res) => {
    return res.send('Hello world !')
})

const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);
const prefix = "!";

client.on('message', async (message) => {
    if (message.author.bot) return;    
    if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong :ping_pong: !\n This message had a latency of ${timeTaken}ms.`);
    }

    if (command === "whois") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`${args.join(" ")} is a human being with a big brain\n This message had a latency of ${timeTaken}ms.`);
    }

    if(command === "play") {
        const videoInfo = await getYoutubeVideoInfo(args.join(' '));

        const {id: {videoId}, snippet: {title} } = videoInfo;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        if(!validateURL(videoUrl)){
            message.reply("This Youtube url is not valide !");
        }else{
        
            if(message.member.voice.channel){
            const connection = await message.member.voice.channel.join();
            const embed = new Discord.MessageEmbed({title: `Start playing: **${title}**`, url: videoUrl});
            message.channel.send(embed);

            const dispatcher = connection.play(ytdl(videoUrl, { filter: 'audioonly'}))
            
            dispatcher.on('finish', () => {
                message.reply("Thank you for listenning have a good day !");
                connection.disconnect();
            })
            } else{
                message.reply("You need to join a voice channel first !");
            }
        }
    }

})