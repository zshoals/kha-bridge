const irc = require("irc");
const discord = require("discord.js");
const { stat } = require("fs");

require('http').createServer(function (_, res) {
    res.end();
}).listen(process.env.PORT);

try {
    function irc_say(channel, from, msg) {
        irc_client.say(channel, `<${from}> ${msg}`);
    }

    function discord_say(channel, from, msg) {
        channel.send(`**<${from}>** ${msg}`);
    }

    const irc_client = new irc.Client("irc.kode.tech", "kha-bridge", {
        channels: ["#kha", "#kinc", "#krom"],
    });

    irc_client.addListener("message#kha", function (from, msg) {
        discord_say(kha_channel, from, msg);
        discord_say(haxe_channel, from, msg);
    });

    irc_client.addListener("message#kinc", function (from, msg) {
        discord_say(kinc_channel, from, msg);
    });

    irc_client.addListener("message#krom", function (from, msg) {
        discord_say(krom_channel, from, msg);
    });

    const discord_client = new discord.Client();

    var kha_channel, kinc_channel, krom_channel, haxe_channel;

    discord_client.on("ready", () => {
        var status = 0;
        setInterval(function () {
            discord_client.user.setActivity(`${["Kha", "Kinc", "Krom"][status++]} take over the world`, { type: "WATCHING" });
            status = status % 3;
        }, 60000);

        discord_client.guilds.fetch("757530409876717609").then(guild => {
            kha_channel = guild.channels.cache.get("757530769315856425");
            kinc_channel = guild.channels.cache.get("757530799292678174");
            krom_channel = guild.channels.cache.get("757530822164348988");
        });

        discord_client.guilds.fetch("162395145352904705").then(guild => {
            haxe_channel = guild.channels.cache.get("501447516852715525");
        });
    });

    function message_to_string(msg) {
        let message = msg.content;
        msg.attachments.each(attachment => {
            message += `\n${attachment.url}`;
        });
        return message;
    }

    discord_client.on("message", msg => {
        if (msg.author.id !== "756864665518211203") {
            const content = message_to_string(msg);
            if (msg.channel.id === kha_channel.id) {
                irc_say("#kha", msg.author.username, content);
                discord_say(haxe_channel, msg.author.username, content);
            } else if (msg.channel.id === kinc_channel.id) {
                irc_say("#kinc", msg.author.username, content);
            } else if (msg.channel.id === krom_channel.id) {
                irc_say("#krom", msg.author.username, content);
            } else if (msg.channel.id === haxe_channel.id) {
                // msg.author.id;

                irc_say("#kha", msg.author.username, content);
                discord_say(kha_channel, msg.author.username, content);
            }
        }
    });

    discord_client.login(process.env.TOKEN);

} catch (e) {
    console.error(e);
}