module.exports = (Discord, client, message) => {
    const prefix = "!";
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    try {
        command.execute(message, args, cmd, client, Discord);
    } catch (error) {
        message.reply("There was an error trying to execute this command!");
        console.log(error)
    }
}

// Add see Aliases for skip and stop