import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import axios from 'axios';

export interface Balance {
  success: boolean;
  message: string;
  result: {
    available: number | null;
    freeze: number | null;
  };
  code: number;
}

export interface Buy {
  success: boolean;
  message: string;
  result: {
    orderId: string;
    market: string;
    price: string;
    side: string;
    type: string;
    timestamp: number;
    dealMoney: string;
    dealStock: string;
    amount: string;
    takerFee: string;
    makerFee: string;
    left: string;
    dealFee: string;
  };
  code: number;
}

@Injectable()
export class Control {
  constructor(private http: HttpService) {}
  @Interval(20000)
  async Mandalor(): Promise<any> {
    try {
      const now = Date.now();
      const inp = 'ETH';
      const out = 'USDT';
      const apiKey = 'FD4A1B2472B9FEAAAFF35EF57F643EAF';
      const secret = 'A84D3C998CBD538370C0DC4B1A8FB877';
      const balanceA = {
        callback_url: 'https://callback.url',
        success_url: 'https://google.com/',
        error_url: 'https://google.com/',
        currency: `${inp}`,
        request: '/api/v1/account/balance',
        nonce: now,
      };

      const balanceB = {
        callback_url: 'https://callback.url',
        success_url: 'https://google.com/',
        error_url: 'https://google.com/',
        currency: `${inp}`,
        request: '/api/v1/account/balance',
        nonce: now,
      };

      const buy = {
        callback_url: 'https://callback.url',
        success_url: 'https://google.com/',
        error_url: 'https://google.com/',
        market: `${out}_${inp}`,
        direction: 'buy',
        amount: '0.1',
        request: '/api/v1/order/new_market',
        nonce: now,
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

      // Convert buy to hex
      const payloadBuy = JSON.stringify(buy, null, 0);
      const jsonPayloadBuy = Buffer.from(payloadBuy).toString('base64');
      const encryptedBuy = crypto
        .createHmac('sha512', secret)
        .update(jsonPayloadBuy)
        .digest('hex');

      console.log(' ⏳  Checking...');
      const mkt = await axios.get(
        `${baseUrl}/api/v1/public/history?market=${inp}_${out}`,
      );
      if (mkt.data.result[0].price < 0) {
        console.log(' ✗  Dont avaiable');
      } else if (mkt.data.result[0].price > 0) {
        console.log(` 💰  ${inp} current price: ` + mkt.data.result[0].price);
        /*const blIn = await firstValueFrom(
          this.http.post<Balance>(
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
          ),
        );
        console.log(` ⚖️  Balance on ${inp}: ${blIn.data.result.available}`);
        console.log(` 🛒  Buying ${inp}...`);*/
        const by = await firstValueFrom(
          this.http.post<Buy>(`${baseUrl}/api/v1/order/new_market`, buy, {
            headers: {
              'Content-type': 'application/json',
              'X-TXC-APIKEY': apiKey,
              'X-TXC-PAYLOAD': jsonPayloadBuy,
              'X-TXC-SIGNATURE': encryptedBuy,
            },
          }),
        );
        console.log(by.data);
        /*const blOut = await firstValueFrom(
          this.http.post<Balance>(
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
          ),
        );
        console.log(
          ` ⚖️  Sucess, new ${out} balance: ${blOut.data.result.available}`,
        );*/
      }
    } catch (err) {
      console.error(err);
    }
  }
}
