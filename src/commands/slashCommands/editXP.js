const { SlashCommandBuilder } = require("discord.js");
const Level = require("../../models/Level");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-xp')
        .setDescription("Add or subtract xp to someone's.")
        .addUserOption(option => 
            option
                .setName('target-user')
                .setDescription('The user whose xp you want to add or subtract')
            .setRequired(true),
        )
        .addNumberOption(option => 
            option
                .setName('xp')
                .setDescription('How many XP do you want to add or subtract to user')
              .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('mode')
                .setDescription('Choose "add" to add XP or "subtract" to subtract XP')
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Subtract', value: 'subtract' }
                )
            .setRequired(true)
        ),

    async execute(interaction) {
        if(!interaction.inGuild()){
            interaction.reply("You can't run this command inside a server");
            return;
        }

        const allowedRoles = ['1199787784454553710', '1199788587718279179'];

        const member = interaction.guild.members.cache.get(interaction.user.id);

        const hasAllowedRole = member.roles.cache.some(role => allowedRoles.includes(role.id));

        if (!hasAllowedRole) {
            interaction.reply("You don't have permission to use this command.");
            return;
        }

        await interaction.deferReply();

        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId)

        const userInfo = await Level.findOne({ 
            userId: targetUserId,
            guildId: interaction.guild.id,
        });
      
        if(!userInfo){
            interaction.editReply(
                mentionedUserId ? `${targetUserObj.user.tag} doesn't in DataBase. Try again when they chat a little more` : `You don't in DataBase. Chat a little more and try again`
            );
            return;
        }

        if (interaction.options.get('mode').value === 'add') {
            const xpToAdd = interaction.options.get('xp').value;
            userInfo.xp += xpToAdd;
            await userInfo.save();
            await interaction.editReply(`${xpToAdd} XP has been added to ${targetUserObj.user.tag}. His new xp is ${userInfo.xp}. `)
        }
        else if (interaction.options.get('mode').value === 'subtract') {
            const xpToSubtract = interaction.options.get('xp').value;
            userInfo.xp -= xpToSubtract;
            await userInfo.save();
            await interaction.editReply(`${xpToSubtract} XP has been subtracted to ${targetUserObj.user.tag}. His new xp is ${userInfo.xp}. `)
        }

    }
};