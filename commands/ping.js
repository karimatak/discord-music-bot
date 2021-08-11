module.exports = {
    name: "ping",
    description: "This is how fast i am",
    async execute(message) {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong :ping_pong: !\n This message had a latency of ${timeTaken}ms.`);
    }
}