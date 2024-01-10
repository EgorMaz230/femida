const { ApplicationCommandOptionType, PermissionFlagsBits, Client, Interaction } = require("discord.js");
const ms = require("ms");

module.exports = {
    name: 'timeout',
    description: 'Timeout a user',
    options: [
        {
            name: 'target-user',
            description: 'The user you want to ban',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'duration',
            description: 'Timaeout duration',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for the timeout',
            type: ApplicationCommandOptionType.String,
        }
    ],

    permissionsRequired: [PermissionFlagsBits.MuteMembers],
    botPermissions: [PermissionFlagsBits.MuteMembers],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */

    callback: async (client, interaction) => {
        const mentionable = interaction.options.get('target-user').value;
        const duration = interaction.options.get('duration').value;
        const reason = interaction.options.get('reason')?.value || "No reason provided";

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(mentionable);
        if(!targetUser){
            await interaction.editReply("That user doesn't exist on this server");
            return;
        }

        if(targetUser.user.bot){
            await interaction.editReply("I can't timeout a bot");
            return;
        }

        const msDuration = ms(duration);
        if(isNaN(msDuration)){
            await interaction.editReply("Please provide a valid duration");
            return;
        }

        if(msDuration < 5000 || msDuration > 2.419e9){
            await interaction.editReply("Timeout duration can't be less than 5ms or more than 28 days");
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if(targetUserRolePosition >= requestUserRolePosition){
            await interaction.editReply("You can't timeout this user because they have the same/higher role than you.")
            return;
        }

        if(targetUserRolePosition >= botRolePosition){
            await interaction.editReply("I can't timeout that user because they have the same/higher role than me")
            return;
        }

        try {
            const { default: prettyMs } = await import('pretty-ms');

            if(targetUser.isCommunicationDisabled()){
                await targetUser.timeout(msDuration, reason);
                await interaction.editReply(`${targetUser} timeout was updated to ${prettyMs(msDuration, { verbose: true })}.\nReason: ${reason}`)
                return;
            }

            await targetUser.timeout(msDuration, reason);
            await interaction.editReply(`${targetUser} was timed out for ${prettyMs(msDuration, { verbose: true })}.\nReason: ${reason}`)

        } catch (error) {
            console.log(`There was an error when timning out ${error}`);
        }
    }
}