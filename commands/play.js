const ytdl = require('ytdl-core');
const getYoutubeVideoInfo = require('../helpers/getYoutubeVideoInfo');

const queue = new Map();

module.exports = {
    name: "play",
    aliases: ['skip', 'stop'],
    description: "play song",
    async execute(message, args, cmd, client, Discord){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) return message.channel.send('You need to join a voice channel first to execute this commande !');
        const permission = voiceChannel.permissionsFor(message.client.user); 
        if(!permission.has('CONNECT')) return message.channel.send('You dont have the correct permissions');
        if(!permission.has('SPEAK')) return message.channel.send('You dont have the correct permissions');

        const serverQueue = queue.get(message.guild.id);

        if(cmd === "play"){
            if(!args.length) return message.channel.send('You need to send the second argument !');
            let song = {};

            if(ytdl.validateURL(args[0])){
                const songInfo = await ytdl.getInfo(args[0]);
                song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url };
            }else{
                const songInfo = await getYoutubeVideoInfo(args.join(' '));
                if(songInfo){
                    song = { title: songInfo.snippet.title, url: `https://www.youtube.com/watch?v=${songInfo.id.videoId}` };
                }else{
                    message.channel.send('Error finding video');
                }
            }

            if(!serverQueue){

                const queueConstructor = {
                    voiceChannel,
                    textChannel: message.channel,
                    connection: null,
                    songs: []
                }

                queue.set(message.guild.id, queueConstructor);
                queueConstructor.songs.push(song);

                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    videoPlayer(message.guild, queueConstructor.songs[0]);
                } catch (error) {
                    queue.delete(message.guild.id);
                    message.channel.send('There was an error connecting !');
                    throw error;
                }
            }else{
                serverQueue.songs.push(song);
                return message.channel.send(`:headphones: **${song.title}** added to queue !`);
            }
        }
        else if (cmd === 'skip') skipSong(message, serverQueue);
        else if (cmd === 'stop') stopSong(message, serverQueue);
    }
}

const videoPlayer = async (guild, song) => {
    const songQueue = queue.get(guild.id);

    if(!song) {
        songQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly'});
    songQueue.connection.play(stream, { seek: 0, volume: 0.5})
    .on('finish', () => {
        songQueue.songs.shift();
        videoPlayer(guild, songQueue.songs[0]);
    });
    await songQueue.textChannel.send(`:arrow_forward: Now playing **${song.title}**`);
}

const skipSong = async(message, serverQueue) => {
    if(!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command !');
    if(!serverQueue){
        return message.channel.send(`There are no songs in queue`);
    }
    serverQueue.connection.dispatcher.end();
}

const stopSong = async(message, serverQueue) => {
    if(!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command !');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}