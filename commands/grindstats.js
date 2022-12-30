// Bring in Node modules
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const minecraftPlayer = require('minecraft-player');

// Command magic
module.exports = {
  data: new SlashCommandBuilder()
    .setName('grindstats')
    .setDescription('Toont jouw persoonlijke grind statistieken uit de Minecraft server!')
    .addStringOption((option) => option.setName('naam').setDescription('Jouw Minecraft gebruikersnaam').setRequired(true)),
  async execute(interaction) {
    const playerName = interaction.options.getString('naam');
    const { uuid } = await minecraftPlayer(playerName);
    if (!uuid) {
      const notFoundEmbed = new EmbedBuilder()
        .setColor('#ff5757')
        .setTitle('❌ Er is geen speler met deze naam gevonden.')
        .setDescription('Heb je recent je Minecraft gebruikersnaam veranderd? Dan moet je mogelijk eerst opnieuw met de server verbinden.')
        .setFooter({ text: 'StateVille' })
        .setTimestamp();

      await interaction.reply({ embeds: [notFoundEmbed] });
    }

    axios
      .post(process.env.API_URL + '/players/get_grindstats', {
        apiKey: process.env.API_KEY,
        uuid,
      })
      .then(async (res) => {
        const dataEmbed = new EmbedBuilder()
          .setColor('#66a1ff')
          .setTitle(`Grind Statistieken van ${playerName}`)
          .setThumbnail(`https://crafatar.com/renders/head/${uuid}?overlay`)
          .setDescription(
            `<:Minecraft_Coal:1057757399190077450> Mine: **${res.data.mine}**\n<:Minecraft_Wheat:1057758113652023326> Farm: **${res.data.farm}**\n<:Minecraft_Cod:1057758112360185856> Vissen: **${res.data.vis}**\n<:Wiring:1057758258124832779> Stroomkastjes: **${res.data.stroom}**\n<:Trash:1057758598266101841> Vuilniszakken: **${res.data.vuilnis}**\n<:Package:1058389037305581599> Pakketjes: **${res.data.pakketjes}**`
          )
          .setFooter({ text: 'StateVille' })
          .setTimestamp();

        await interaction.reply({ embeds: [dataEmbed] });
      })
      .catch(async (err) => {
        if (err.response.status === 500) {
          const notFoundEmbed = new EmbedBuilder()
            .setColor('#ff5757')
            .setTitle('❌ Er is geen speler met deze naam gevonden.')
            .setDescription(
              'Heb je recent je Minecraft gebruikersnaam veranderd? Dan moet je mogelijk eerst opnieuw met de server verbinden.'
            )
            .setFooter({ text: 'StateVille' })
            .setTimestamp();

          await interaction.reply({ embeds: [notFoundEmbed] });
        }
      });
  },
};
