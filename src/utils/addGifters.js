const giftersLevels = require("../constants/giftersLevels")
const Level = require("../models/Level");
const { google } = require('googleapis');
const credentials = require('../../google-sheets-toolbox.json');
const fetch = require('node-fetch');


module.exports = async (userId, userLevel) => {
    const userChek = await Level.findOne({ userId})
    if(!userChek.alreadyWas){
      await Level.findOneAndUpdate({ userId }, {alreadyWas: [] });
    }
    const user = await Level.findOne({ userId})

    giftersLevels.forEach(async (gfLevel)=> {
        if(!user.alreadyWas.includes(gfLevel) && giftersLevels.includes(userLevel)){
          const url = `https://discordlookup.mesalytic.moe/v1/user/${userId}`;
          const response = await fetch(url, {
              method: 'GET',
          });
  
          const userData = await response.json();
          const username = userData.username

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const spreadsheetId = '1QL7UySs1z3xhKjuNA-80jQrUo3pxXUDQWLH8sP7H938';

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

const newRow = {
  values: [
    { userEnteredValue: { stringValue: username } },
    { userEnteredValue: { stringValue: userId } },
  ],
};

async function addRow() {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${gfLevel} Level!A1:D1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newRow.values.map(cell => {
          if (cell.userEnteredValue.stringValue) {
            return cell.userEnteredValue.stringValue;
          } else if (cell.userEnteredValue.formulaValue !== undefined) {
            return cell.userEnteredValue.formulaValue;
          }
        })],
      },
    });
    console.log('Рядок додано успішно:', response.data);

  } catch (err) {
    console.error('Помилка при додаванні рядка:', err);
  }
}

addRow();
        }
    })

}