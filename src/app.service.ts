import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class Control {
  @Interval(2000)
  async Mandalor(): Promise<any> {
    try {
      const now = Date.now();
      const inp = 'BUSD';
      const out = 'USDT';
      const brew = 0.2;
      const max = 1.3;
      const apiKey = 'FD4A1B2472B9FEAAAFF35EF57F643EAF';
      const secret = 'A84D3C998CBD538370C0DC4B1A8FB877';
      const balanceA = {
        callback_url: 'https://callback.url',
        success_url: 'https://google.com/',
        error_url: 'https://google.com/',
        currency: `${out}`,
        request: '/api/v1/account/balance',
        nonce: now,
      };

      const balanceB = {
        callback_url: 'https://callback.url',
        success_url: 'https://google.com/',
        error_url: 'https://google.com/',
        currency: `${inp}`,
        request: '/api/v1/account/balance',
        nonce: now + 400,
      };

      const baseUrl = 'https://api.coinsbit.io';

      // Convert balanceA to hex
      const payloadBalanceA = JSON.stringify(balanceA, null, 0);
      const jsonPayloadBalanceA =
        Buffer.from(payloadBalanceA).toString('base64');
      const encryptedBalanceA = crypto
        .createHmac('sha512', secret)
        .update(jsonPayloadBalanceA)
        .digest('hex');

      // Convert balanceB to hex
      const payloadBalanceB = JSON.stringify(balanceB, null, 0);
      const jsonPayloadBalanceB =
        Buffer.from(payloadBalanceB).toString('base64');
      const encryptedBalanceB = crypto
        .createHmac('sha512', secret)
        .update(jsonPayloadBalanceB)
        .digest('hex');

      console.log(' ⏳  Checking...');
      const mkt = await axios.get(
        `${baseUrl}/api/v1/public/history?market=${inp}_${out}`,
      );
      if (mkt.data.result == false || mkt.data.result[0].price >= max) {
        mkt.data.result[0].price >= max
          ? console.log(' ✗  Price very hight')
          : console.log(' ✗  Dont available');
      } else if (mkt.data.result !== false && mkt.data.result[0].price < max) {
        console.log(` 💰  ${inp} current price: ` + mkt.data.result[0].price);
        const blIn = await axios.post(
          `${baseUrl}/api/v1/account/balance`,
          balanceA,
          {
            headers: {
              'Content-type': 'application/json',
              'X-TXC-APIKEY': apiKey,
              'X-TXC-PAYLOAD': jsonPayloadBalanceA,
              'X-TXC-SIGNATURE': encryptedBalanceA,
            },
          },
        );
        console.log(` ⚖️  Balance on ${out}: ${blIn.data.result.available}`);
        const dodle = blIn.data.result.available / mkt.data.result[0].price;
        const amount = dodle.parseInt();
        const slip = parseFloat(mkt.data.result[0].price) + brew;
        const price = slip.toString();
        const buy = {
          callback_url: 'https://callback.url',
          success_url: 'https://google.com/',
          error_url: 'https://google.com/',
          request: '/api/v1/order/new',
          market: `${inp}_${out}`,
          side: 'buy',
          amount: amount,
          price: price,
          nonce: now + 200,
        };

        // Convert buy to hex
        const payloadBuy = JSON.stringify(buy, null, 0);
        const jsonPayloadBuy = Buffer.from(payloadBuy).toString('base64');
        const encryptedBuy = crypto
          .createHmac('sha512', secret)
          .update(jsonPayloadBuy)
          .digest('hex');
        console.log(` 🛒  Buying ${inp}...`);
        const by = await axios.post(`${baseUrl}/api/v1/order/new`, buy, {
          headers: {
            'Content-type': 'application/json',
            'X-TXC-APIKEY': apiKey,
            'X-TXC-PAYLOAD': jsonPayloadBuy,
            'X-TXC-SIGNATURE': encryptedBuy,
          },
        });
        typeof by.data.result.orderId == 'number'
          ? console.log(' ✔️  Message: ' + by.data.result.orderId)
          : console.log(' ❗  Message: ' + by.data.message);
        if (by.data.code == true) {
          const blOut = await axios.post(
            `${baseUrl}/api/v1/account/balance`,
            balanceB,
            {
              headers: {
                'Content-type': 'application/json',
                'X-TXC-APIKEY': apiKey,
                'X-TXC-PAYLOAD': jsonPayloadBalanceB,
                'X-TXC-SIGNATURE': encryptedBalanceB,
              },
            },
          );
          console.log(
            ` ⚖️  Success, new ${inp} balance: ${blOut.data.result.available}`,
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}
