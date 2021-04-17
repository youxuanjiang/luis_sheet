# Purpose of the Project
### 用來輔助LUIS Based的聊天機器人開發的各種小工具
- 首先必須要先理解此聊天機器人的運作
	- 要理解使用者輸入的「自然語意」需要理解其「意圖」(Intent)
	- 有了意圖之後就需要「範例問句」去讓LUIS知道這些句子都是表達同一個「意圖」
	- 而為了要讓LUIS能夠更加精確的判斷意圖，我們也需要為每個意圖定義「實體」(Entity)，可以理解成要理解這句話需要什麼樣的「資訊」
		- 舉個例子：假設我有定義一個意圖為「地理位址」，這樣我們給此意圖的範例問句可能是「電資大樓在哪」、「工程三館怎麼走」、「我想要去二餐」之類的，這些問句都是指向同一個「地理位置」的「意圖」，而我們就會需要為此意圖定義一個實體叫「地點名稱」
		- 再來，像地點名稱可能會有非常多不同的說法，比如工程三館也能叫做工三之類的，因此也需要為此定義一個Alias List
		- 根據不同的意圖可能會有不同數量的實體，這個就是要在設計的時候好好衡量的
- 此專案是支援從Google Sheet直接將其內容上傳至LUIS以及部分內容轉換成CSV檔方便直接匯入SQL Database
# How to Use the Project
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

- 修改 config_LUIS.js (code中我有提示說哪裡要修改了)
	- 將LUIS所需的各項認證資訊填好
	- 根據不同的情況將不同的Google Sheet位置貼到不同的變數中

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
  - 將最後出現的那個信箱加入你想要透過程式Parse的google Sheet的共用名單

- 新增一個檔案叫'cred.json'，並將金鑰貼進去

### 從Google Sheet將定義好之「意圖」以及「範例問句」上傳至LUIS
- 修改 config_LUIS.js 中的 googleSheetForIntent 變數，貼上你的Sheet Location
- 執行程式
 ```shell
 npm run luis-intent
```
![image](https://github.com/youxanjump/luis_sheet/blob/master/截圖%202021-04-17%20下午3.18.11.png)
- 上圖範例之格式務必跟著
- 隨意開頭到隨意結尾間共有四個Entity的欄位，可以自行更換此次upload要label成哪一個
- Colume C的內容基本就是把「隨意開頭」到「隨意結尾」間的文字append起來，並且爬蟲會將那個欄位當成範例問句丟給LUIS
- 顏色對應的Entity欄位為是為了要計算該從第幾個字到第幾個字Label起來，只要將文字填上去，右邊的數字就會自動對應了
![image](https://github.com/youxanjump/luis_sheet/blob/master/截圖%202021-04-17%20下午3.30.09.png)
- 右邊的數字等於-1時，就代表你的文字中並沒有包含該Entity
- 執行完此動作後，就可以直接TRAIN了

### 從Google Sheet將Alias List上傳至LUIS
- 修改 config_LUIS.js 中的 googleSheetForEntity 變數，貼上你的Sheet Location
- 執行程式
 ```shell
 npm run luis-entity-alias
```
- 下面的分頁名稱請命名的跟你的「Entity」名稱一樣

![image](https://github.com/youxanjump/luis_sheet/blob/master/截圖%202021-02-23%20下午10.40.27.png)

### 從Google Sheet將「實體」列表轉成CSV
- 修改 config_LUIS.js 中的 googleSheetForInformation 變數，貼上你的Sheet Location
- 執行程式
 ```shell
 npm run csv-entity-list
```
![image](https://github.com/youxanjump/luis_sheet/blob/master/截圖%202021-02-23%20下午10.39.49.png)

### 從Google Sheet將Alias List列表轉成CSV
- 修改 config_LUIS.js 中的 googleSheetForEntity 變數，貼上你的Sheet Location
- 執行程式
 ```shell
 npm run csv-entity-alias
```
- 跟上傳LUIS Alias List用同一張Sheet就可以了

### 從Google Sheet將「問題」與「答案」列表轉成「唯一的意圖」與「答案」Pair的CSV
- 修改 config_LUIS.js 中的 googleSheetForAnswer 變數，貼上你的Sheet Location
- 執行程式
 ```shell
 npm run csv-answer
```
- 只需要有「Question」以及「Answer」兩欄位即可，也可以參考以下格式

![image](https://github.com/youxanjump/luis_sheet/blob/master/截圖%202021-02-23%20下午10.38.55.png)

### 刪掉專案中轉出來的CSV檔
- 執行程式
 ```shell
 npm run delete
```
