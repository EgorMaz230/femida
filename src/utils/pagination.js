const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

module.exports = async function (interaction, pages, time = 60 * 1000) {
  try {
    if (!interaction || !pages || !pages > 0)
      throw new Error("Invalid args for pagination");
    if (pages.length === 1)
      return await interaction.editReply({ embeds: pages, components: [] });
    let index = 0;

    const buttonsObj = {
      firstBtn: new ButtonBuilder()
        .setCustomId("firstpage")
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      prevBtn: new ButtonBuilder()
        .setCustomId("pageprev")
        .setEmoji("◀")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      pageCounter: new ButtonBuilder()
        .setCustomId("pagecounter")
        .setLabel(`${index + 1}/${pages.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      nextBtn: new ButtonBuilder()
        .setCustomId("pagenext")
        .setEmoji("▶")
        .setStyle(ButtonStyle.Primary),
      lastBtn: new ButtonBuilder()
        .setCustomId("lastpage")
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Primary),
    };

    const { firstBtn, prevBtn, pageCounter, nextBtn, lastBtn } = buttonsObj;

    const buttons = new ActionRowBuilder().addComponents([
      firstBtn,
      prevBtn,
      pageCounter,
      nextBtn,
      lastBtn,
    ]);
    const msg = await interaction.editReply({
      embeds: [pages[index]],
      components: [buttons],
      fetchreply: true,
    });
    const collector = await msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });
    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id)
        return await i.reply({
          content: `Тільки ${interaction.user.username} може використовувати ці кнопки! Спробуй самостійно викликати команду \`/leaders\``,
          ephemeral: true,
        });
      await i.deferUpdate();
      switch (i.customId) {
        case "firstpage":
          index = 0;
          pageCounter.setLabel(`${index + 1}/${pages.length}`);
          break;
        case "pageprev":
          if (index > 0) index--;
          pageCounter.setLabel(`${index + 1}/${pages.length}`);
          break;
        case "pagenext":
          if (index < pages.length - 1) {
            index++;
            pageCounter.setLabel(`${index + 1}/${pages.length}`);
          }
          break;
        case "lastpage":
          index = pages.length - 1;
          pageCounter.setLabel(`${index + 1}/${pages.length}`);
          break;
        default:
          break;
      }

      if (index === 0) {
        firstBtn.setDisabled(true);
        prevBtn.setDisabled(true);
      } else {
        firstBtn.setDisabled(false);
        prevBtn.setDisabled(false);
      }

      if (index === pages.length - 1) {
        nextBtn.setDisabled(true);
        lastBtn.setDisabled(true);
      } else {
        nextBtn.setDisabled(false);
        lastBtn.setDisabled(false);
      }

      await msg
        .edit({ embeds: [pages[index]], components: [buttons] })
        .catch((err) => console.log(err));
      collector.resetTimer();
    });

    collector.on("end", async () => {
      await msg
        .edit({ embeds: [pages[index]], components: [] })
        .catch((err) => console.log(err));
    });
    return msg;
  } catch (err) {
    console.log(`[Error] ${err}`);
  }
};
