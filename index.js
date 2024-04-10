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
            range: `シート1!A:B`,
        });
        console.log(res.data);

    } catch (error) {
        console.log(error);
    }

    try { 
        // inputのJSONオブジェクトを取得する 
        //　core.getInputの戻り値はstringのため、JSON.parseが必要 
        const jsonObject = JSON.parse(res.data); 
        let message = ''; 
    
        // 文字列の生成（aaとccc/fffの文字列をつなげて「これは表示テスト」を作る） 
        message = jsonObject.repository + jsonObject.slack_channel; 
        // outputの設定 
        core.setOutput("result-message", message); 
    } catch (error) { 
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