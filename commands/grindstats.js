// Bring in Node modules
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql');

// Connect to MySQL database
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
connection.connect();

// Command magic
module.exports = {
  data: new SlashCommandBuilder()
    .setName('grindstats')
    .setDescription('Toont jouw persoonlijke grind statistieken uit de Minecraft server!')
    .addStringOption((option) => option.setName('naam').setDescription('Jouw Minecraft gebruikersnaam').setRequired(true)),
  async execute(interaction) {
    const playerName = interaction.options.getString('naam');

    connection.query(`SELECT * FROM players`, async (error, results) => {
      if (error) throw error;

      const i = results.findIndex((player) => player.name === playerName);
      if (i > -1) {
        const notFoundEmbed = new EmbedBuilder()
          .setColor('#66a1ff')
          .setTitle(`Grind Statistieken van ${results[i].name}`)
          .setThumbnail(`https://crafatar.com/renders/head/${results[i].uuid}?overlay`)
          .setDescription(
            `<:Minecraft_Coal:1057757399190077450> Mine: **${results[i].minePoints}**\n<:Minecraft_Wheat:1057758113652023326> Farm: **${results[i].farmPoints}**\n<:Minecraft_Cod:1057758112360185856> Vissen: **${results[i].visPoints}**\n<:Wiring:1057758258124832779> Stroomkastjes: **${results[i].stroomPoints}**\n<:Trash:1057758598266101841> Vuilniszakken: **${results[i].vuilnisPoints}**`
          )
          .setFooter({ text: 'StateVille' })
          .setTimestamp();

        await interaction.reply({ embeds: [notFoundEmbed] });
      } else {
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
