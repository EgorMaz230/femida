const { SlashCommandBuilder, roleMention } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("removepoint")
    .setDescription("Remove points from member.")
    .addUserOption(option => 
        option
            .setName('target-user')
            .setDescription('Removing from member the point/s.')
            .setRequired(false)
    ),

    async execute(interaction) {
        if(!interaction.inGuild()){
            interaction.reply("You can't run this command inside a server");
            return;
        }

        await interaction.deferReply();

        let points
        
        const targetUserId = interaction.member.id;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId)
        const userIdWhoUsed = interaction.get('target-user')?.value;

       if(userIdWhoUsed.roleMention === "Admin【🏮】"){
           userIdWhoUsed -= targetUserId.points
       } else if(!roleMention.userIdWhoUsed === "Admin【🏮】"){
           userIdWhoUsed ? `${targetUserObj.user.tag} doesn't have role of Admin【🏮】` : `Removed a ${points} from ${targetUserObj.user.tag}.`
       }
}
}