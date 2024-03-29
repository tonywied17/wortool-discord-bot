/*
 * File: c:\Users\tonyw\Desktop\git-222-bot\222-discord-bot\commands\music\play.js
 * Project: c:\Users\tonyw\Desktop\ReggieBot\paapp2-discord-bot
 * Created Date: Saturday February 3rd 2024
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon February 12th 2024 1:48:20 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2024 MolexWorks / Tone Web Design
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const {
    joinVoiceChannel,
    createAudioResource,
    createAudioPlayer,
    AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const YouTube = require("youtube-sr").default;

global.queues = global.queues || new Map();
global.players = global.players || new Map();

/**
 * Play Command
 * @type {import('discord.js').SlashCommand}
 * @description Plays a YouTube video in your voice channel!
 * @options {string} query - The YouTube video URL or a search query
 */
module.exports = {
    isAdmin: false,
    isRoleManager: false,
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays a YouTube video in your voice channel!")
        .addStringOption((option) =>
            option
            .setName("query")
            .setDescription("The YouTube video URL or a search query")
            .setRequired(true)
        ),
    async execute(interaction) {
        const query = interaction.options.getString("query");
        let videoUrl, videoTitle, videoThumbnail;

        if (ytdl.validateURL(query)) {
            const videoInfo = await ytdl.getInfo(query);
            videoUrl = query;
            videoTitle = videoInfo.videoDetails.title;
            videoThumbnail = videoInfo.videoDetails.thumbnails[0].url;
        } else {
            const searchResult = await YouTube.searchOne(query);
            if (!searchResult) {
                await interaction.reply({
                    content: "No results found!",
                    ephemeral: true,
                });
                return;
            }
            videoUrl = `https://www.youtube.com/watch?v=${searchResult.id}`;
            videoTitle = searchResult.title;
            videoThumbnail = searchResult.thumbnail.url;
        }

        if (!interaction.member.voice.channelId) {
            await interaction.reply({
                content: "You need to be in a voice channel to play music!",
                ephemeral: true,
            });
            return;
        }

        const voiceChannel = interaction.member.voice.channel;
        const song = {
            title: videoTitle,
            url: videoUrl,
            thumbnail: videoThumbnail,
        };
        const guildQueue = queues.get(interaction.guildId) || [];
        guildQueue.push(song);
        queues.set(interaction.guildId, guildQueue);

        if (guildQueue.length === 1) {
            await interaction.reply({
                embeds: [createSongEmbed(song, voiceChannel)],
            });
            playSong(interaction, voiceChannel, song);
        } else {
            await interaction.reply(`Added **${song.title}** to the queue!`);
        }
    },
};

/**
 * Plays a song in the voice channel
 * @param {*} interaction 
 * @param {*} voiceChannel 
 * @param {*} song 
 */
async function playSong(interaction, voiceChannel, song) {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const stream = ytdl(song.url, {
        filter: "audioonly",
        highWaterMark: 1 << 22,
    });
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    global.players.set(interaction.guildId, player);

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
        const queue = queues.get(interaction.guildId);
        queue.shift();
        if (queue.length > 0) {
            const nextSong = queue[0];
            interaction.followUp({
                embeds: [createSongEmbed(nextSong, voiceChannel)],
            });
            playSong(interaction, voiceChannel, nextSong);
        } else {
            queues.delete(interaction.guildId);
            global.players.delete(interaction.guildId);
            connection.destroy();
        }
    });

    player.on("error", (error) => {
        console.error(error);
        global.players.delete(interaction.guildId);
    });
}

/**
 * Creates an embed for the currently playing song
 * @param {*} song 
 * @param {*} voiceChannel 
 * @returns 
 */
function createSongEmbed(song, voiceChannel) {
    return new EmbedBuilder()
        .setTitle(song.title)
        .setURL(song.url)
        .setDescription(`Now playing in <#${voiceChannel.id}>`)
        .setThumbnail(song.thumbnail)
        .setColor("#0099ff");
}