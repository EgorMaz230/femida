const { Client, InteractionCollector, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js')

module.exports = {
    name: 'ban',
    description: 'Bans a member!!!',
    options: [
        {
            name: 'target-user',
            description: 'The user to ban',
            required: true,
            type: ApplicationCommandOptionType.Mentionable
        },
        {
            name: 'reason',
            description: 'The reason for banning',
            type: ApplicationCommandOptionType.String
        },
    ],

    permissionsRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],
    
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */

    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || 'No reason provided';

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(targetUserId)

        if(!targetUser){
            await interaction.editReply("That user doesn't exist in this server");
            return;
        }

        if(targetUser.id === interaction.guild.ownerId){
            await interaction.editReply("You can't ban this user because they are the server owner");
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if(targetUserRolePosition >= requestUserRolePosition){
            await interaction.editReply("You can't ban this user because they have the same/higher role than you.")
            return;
        }

        if(targetUserRolePosition >= botRolePosition){
            await interaction.editReply("I can't ban that user because they have the same/higher role than me")
            return;
        }

        try {
            await targetUser.ban({ reason })
            await interaction.editReply(`User ${targetUser} was banned\nReason: ${reason}`)
        } catch (error) {
            console.log(`There was an error when banning ${error}`);
        }
    }
}