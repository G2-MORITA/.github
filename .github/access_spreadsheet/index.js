'use strict';


const core = require('@actions/core'); 
const github = require('@actions/github'); 
const {google} = require('googleapis');

const fs = require('fs');

const KEYFILE_NAME = `keyfile.json`;
const KEYFILE_PATH = `./${KEYFILE_NAME}`;

const main = async () => {

    const GOOGLE_PRIVATE_KEY = core.getInput('GOOGLE_PRIVATE_KEY');
    const SHEET_ID = core.getInput('SHEET_ID');
    const TARGET_REPOSITORY_NAME = core.getInput('TARGET_REPOSITORY_NAME');

    try {
        console.log(`--keyfile作成`);
        console.log(GOOGLE_PRIVATE_KEY);
        fs.writeFileSync(KEYFILE_NAME, GOOGLE_PRIVATE_KEY);
        console.log(`作成done--`);
    } catch (error) {
        console.log(error);
    }

    console.log(`--Google SpreadSheet認証`);
    let sheets = {};
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEYFILE_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        sheets = google.sheets({version: 'v4', auth});
        console.log(`認証done--`);
    } catch (error) {
        console.log(error);
    }
    
    console.log(`--sheetアクセス`);
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `シート1!A2:B`,
        });
        console.log(res.data.values);

        var result = res.data.values.find(row => {
            return row[0] == TARGET_REPOSITORY_NAME;
        });

        if (result){
            console.log(result);
            core.setOutput("slack_channel", result[1]); 
        }
        else {
            core.setFailed(TARGET_REPOSITORY_NAME + "がシートに記載されていません"); 
        }

    } catch (error) {
        console.log(error);
        core.setFailed(error.message); 
    }

    console.log('---Keyファイル削除');
    try {
        fs.unlinkSync(KEYFILE_PATH);
        console.log('削除しました。--');
        return;
    } catch (error) {
        throw error;
    }
}

main();