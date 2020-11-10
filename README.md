# luis_sheet
For adding intents and questions to AZURE LUIS from Google Sheet

- [安裝 git](https://git-scm.com/book/zh-tw/v2/開始-Git-安裝教學)

- 選擇一個合適的地方下載專案
```shell
git clone https://github.com/youxanjump/luis_sheet.git
```

- [安裝node.js以及npm](https://sasacode.wordpress.com/2018/05/18/nodejs-npm-入門-在windows上安裝/)

- 安裝所需的套件(進入專案資料夾後輸入以下指令)
```shell
npm install
```

- 修改 add_intent_to_luis.js (code中我有提示說哪裡要修改了)

- [取得Google金鑰](https://sites.google.com/jes.mlc.edu.tw/ljj/linebot實做/申請google-sheet-api)(要透過程式存取google表單他要認金鑰的)

- 新增一個檔案叫'cred'，並將金鑰貼進去

- 執行程式
 ```shell
 npm run start
```
