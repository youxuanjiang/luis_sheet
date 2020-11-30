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

- [取得Google金鑰](https://console.developers.google.com)(要透過程式存取google表單他要認金鑰的)
  - 從google api建立一個app
  - 點選左欄->憑證
  - 建立憑證
  - 點選「請幫我選擇」
  - 選擇 google sheets API
  - 來源選擇「網路伺服器」
  - 點選「應用程式資料」、「否」
  - 點選「我需要哪些憑證」
  - 下載金鑰
  - 將最後出現的那個信箱加入google表單的共用

- 新增一個檔案叫'cred.json'，並將金鑰貼進去

- 執行程式
 ```shell
 npm run start
```
