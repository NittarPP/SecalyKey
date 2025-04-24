const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PORT = 3000;
const LUA_TEMPLATE = 'key.lua'; // Use this as your template
const LUA_OUTPUT = 'key.lua'; // This will be the generated file
const CHANNEL_ID = '1361346341053137146';
const MESSAGE_ID = '1364524640839532544';

function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const parts = [4, 4, 4, 4];
    return parts.map(len =>
        [...Array(len)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('')
    ).join('-');
}

async function updateLuaFile() {
    const key = generateKey();
    const template = fs.readFileSync(LUA_TEMPLATE, 'utf-8');
    const updated = template.replace(/_G\.Key\s*=\s*".*?"/, `_G.Key = "${key}"`);
    fs.writeFileSync(LUA_OUTPUT, updated);
    console.log(`Lua key updated: ${key}`);

    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const message = await channel.messages.fetch(MESSAGE_ID);
        await message.edit(`🔑 The key has been changed to: \`${key}\``);
    } catch (err) {
        console.error('Failed to update Discord message:', err);
    }
}

client.once('ready', () => {
    console.clear();
    console.log(`✅ Logged in as ${client.user.tag}`);

    cron.schedule('0 0 * * *', updateLuaFile);

    updateLuaFile();
});

const app = express();
app.use(express.static(__dirname));
app.get('/keepalive', (req, res) => {
    res.sendFile(__dirname + '/key.lua');
});
app.listen(PORT, () => {
    console.log(`🌐 Lua file hosted at http://localhost:${PORT}/key.lua`);
});

client.login(process.env.DISCORD_TOKEN);
