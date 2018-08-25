const { Command } = require('discord.js-commando');
//const {ExtendedCommand} = require('../../core/')
const Youtube = require('discord-helpers/integrations/youtube');
const Util = require('discord-helpers/util');
/**
* Command responsible for playing whatever is saved in memory for given guild
* @type {module.PlayCommand}
*/
module.exports = class PlayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            aliases: ['listen', 'stream'],
            group: 'music',
            memberName: 'play',
            description: 'Plays loaded queue',
            examples: ['play'],
            guildOnly: true,
            clientPermissions: ['CONNECT', 'SPEAK'],
            args: [
                {
                    key: 'query',
                    prompt: 'Youtube URL or a song search text. E.g. `daft punk get lucky` or `https://www.youtube.com?v=qODMVRDehXE`',
                    type: 'string',
                    default: "abortthesearch"
                }
            ]
        });
        
        try {
            this._initListeners();
        } catch (e) {
            console.log('Failed to initialize PlayCommand listeners', e);
        }
    }
    
    /**
    *
    * @param msg
    * @returns {Promise.<Message|Message[]>}
    */
    async run(msg, {query}) {
        this.rChannel = msg.channel;
        if(query != 'abortthesearch'){
            let loaderMsg;
            try {
                let indicatorMsg = (await msg.say('Searching for music. Please be patient.'));
                loaderMsg = await Util.constructLoadingMessage(await msg.say(':hourglass_flowing_sand:'), ':hourglass_flowing_sand:');
                
                let results = await this.client.youtube.search(query);
                indicatorMsg.delete();
                loaderMsg.delete();
                
                if (results.length === 0) return (await msg.say(`Couldnt find any songs for query: \`${args.query}\`. Please make sure the link is correct and try again.`)).delete(5000);
                
                if (results.length > 50 || results.length === 1) {
                    this.client.music.loadTracks(results, msg.guild, msg.author.id);
                    (await msg.say(`${results.length} track(s) have been added to the music queue.`)).delete(12000)
                } else {
                    this.client.music.loadTracks([results[0]], msg.guild, msg.author.id);
                    (await msg.say(`1 track(s) have been added to the music queue.`))
                    await msg.say("We got more than one result. Please use `!get` for specific selection")
                    
                }
            } catch (e) {
                if (loaderMsg && typeof loaderMsg.delete === 'function') loaderMsg.delete();
                console.log(e);
                await msg.say('Something went horribly wrong! Please try again later.')
            }
        }
        
        
        
        
        
        if(msg.guild.voiceConnection == null){
            try {
                let user = msg.member;
                if (!user.voiceChannel) return (await msg.say('You must join voice channel first before using this command')).delete(12000);
                else {
                    if (user.voiceChannel.joinable){
                        var connection = await user.voiceChannel.join();
                        (await msg.say(`Joined Voice Channel - \`${connection.channel.name}\``)).delete(12000);
                    }
                    else return msg.say(`I can't join channel ${user.voiceChannel.name}. Missing permissions.`)
                }
            } catch (e) {
                console.log(e);
                return msg.say('Something went horribly wrong! Please try again later.')
            }
        }
        try {
            await this.client.music.play(msg.guild);
            debugger;
        } catch (e) {
            console.log(e);
            return msg.say('Something went horribly wrong! Please try again later.')
        }
    }
    
    _initListeners()
    {
        
        this.client.music.on('playing', async (track, guild) => {
            var channel = this.rChannel;
            if(typeof channel == 'undefined'){
                target = guild.channels.find("name", "musica")
            }
            if (guild.voiceConnection) {
                let playingMessage = this.client.music.messages.get(guild.id);
                if (playingMessage && playingMessage.deletable) playingMessage.delete();
                
                if (channel) this.client.music.savePlayerMessage(guild, (await channel.send({embed: this.client.music.getInfo(guild)})));
                else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
            }
        });
        
        this.client.music.on('play', (text, guild) => {
            var channel = this.rChannel;
            if(typeof channel == 'undefined'){
                target = guild.channels.find("name", "musica")
            }
            if (guild.voiceConnection) {
                
                if (channel) channel.send(text);
                else console.log(`No text channel found for guild ${guild.id}/${guild.name} to display music playing embed.`)
            }
        });
        
        this.client.music.on('error', text => { throw text; });
    }
};
