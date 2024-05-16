import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { google } from 'googleapis';
import { schedule } from 'node-cron';
//!import { youtube } from 'googleapis/build/src/apis/youtube';

config();

const discordClient = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ]
});

const youtubeClient = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

let lastVideoId ='';

discordClient.login(process.env.DISCORD_TOKEN);
discordClient.on('ready', () => {
    console.log(`\nBot online, logado como: ${discordClient.user.tag}\n`);
    checkNewVideo();
    schedule("* * 0 * * *", checkNewVideo);
});

async function checkNewVideo() {
    try {
        const result = await youtubeClient.search.list({
            channelId: 'UCMwDD3ZZnWwBjfcaCm-QXdQ',
            order: 'date',
            part: 'snippet',
            type: 'video',
            maxResults: 1
        }).
        then(response => response);

        const latestVideo = result.data.items[0];
        console.log(latestVideo);

        if (latestVideo?.id?.videoId != lastVideoId) {
            lastVideoId = latestVideo.id.videoId;
            const videoUrl = `https://www.youtube.com/watch?v=${lastVideoId}`;
            const message = "Confira o último vídeo do canal!!!";
            const channel = discordClient.channels.cache.get('711587606709927998');
            channel.send(message + videoUrl);
        }
    } catch (error) {
        console.error(error);
    }
}