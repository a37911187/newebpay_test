const axios = require('axios');
const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'MTE5NDE2MTI1OTUzMzMwNzkwNA.Gw-n8Y.bpzY1AvOwgD3ylvJMPzreMxKJOckWfCAdg3eNU';
const MerchantID = 'MS151243581';
const HashKey = 'H8k8a9ybpOQWS5Fp0O3ihQ98uRblMVea';
const HashIV = 'CJYYQGAXPRy4OeWP';
const NewebPayURL = 'https://ccore.newebpay.com/MPG/mpg_gateway';
const prefix = '!';

let orderInfo;

bot.on('ready', () => {
  console.log('機器人已準備!');
});

bot.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'ping':
      message.reply('pong');
      break;

    case 'order':
      if (args.length !== 2) {
        message.reply('請輸入正確的參數，格式為 !order <商品名稱> <金額>');
        return;
      }

      const productName = args[0];
      const amount = args[1];

      if (!/^\d+$/.test(amount)) {
        message.reply('金額必須為正整數');
        return;
      }

      const orderID = generateRandomString(10).toUpperCase();
      const tradePassword = generateRandomString(6).toUpperCase();

      orderInfo = {
        orderID,
        productName,
        amount,
        tradePassword,
        paymentStatus: '尚未繳費',
      };

      const form = `
🌟 感謝您的贊助意願！

如果您願意贊助我們的伺服器，您可以參考以下方式進行：

💡 贊助建議： 請根據您的個人情況和經濟能力考慮贊助金額。我們衷心感謝每一位玩家的支持，無論金額大小，都將對伺服器的運營有所幫助。

💰 贊助金額： ${amount} NTD
📧 付款網址： [點我開啟付款連結](${NewebPayURL})
🕛 截止日期：${getExpireDate()}
💳 付款狀態：${orderInfo.paymentStatus} (依據目前的狀態做編輯)

我們非常感激您對伺服器的支持，您的贊助將有助於維持伺服器運作和提升遊戲體驗！如果您有任何疑問或需要進一步的協助，請隨時聯繫我們。

一再感謝，期待與您一同在 Minecraft 世界中創造美好回憶！🌈🏡
`;

      const sentMessage = await message.reply(form);

      const formData = {
        Amt: orderInfo.amount,
        MerchantID: MerchantID,
        MerchantOrderNo: orderInfo.orderID,
        TimeStamp: Math.floor(Date.now() / 1000),
        Version: '2.0', // 將 Version 改為 '2.0'
        CheckValue: genCheckValue(orderInfo),
      };

      sendNewebPayRequest(formData);
      break;

    case 'help':
      message.reply(
        '這是一個 Discord bot，可以連接藍新金流並自動開單。您可以使用以下的指令：\n!ping: 測試 bot 是否在線\n!order <商品名稱> <金額>: 建立一個訂單，並獲取付款連結\n!help: 顯示使用說明'
      );
      break;

    default:
      message.reply('無效的指令，請輸入 !help 查看使用說明');
      break;
  }
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.login(token);

function sendNewebPayRequest(formData) {
  axios
    .post(NewebPayURL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((response) => {
      console.log('API 響應:', response.data);
      // 在這裡處理 API 回應的邏輯，根據需要進行相應的處理
    })
    .catch((error) => {
      console.error('API 錯誤:', error.message);
      // 在這裡處理錯誤的邏輯，根據需要進行相應的處理
    });
}

function genCheckValue(orderInfo) {
  const orderKeys = ['Amt', 'MerchantID', 'MerchantOrderNo', 'TimeStamp', 'Version'];
  const orderString = `HashKey=${HashKey}&${orderKeys
    .map((key) => `${key}=${orderInfo[key]}`)
    .join('&')}&HashIV=${HashIV}`;
  const orderHash = require('crypto').createHash('sha256').update(orderString.toLowerCase()).digest('hex').toUpperCase();
  return orderHash;
}

function getExpireDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const pad = (num) => num.toString().padStart(2, '0');
  return `${year}${pad(month)}${pad(day)}`;
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}