import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import axios from 'axios';

export interface BalanceA {
  success: boolean;
  message: string;
  result: {
    available: number;
    freeze: number | null;
  };
  code: number;
}

export interface BalanceB {
  success: boolean;
  message: string;
  result: {
    available: number;
    freeze: number | null;
  };
  code: number;
}
export interface Buy {
  success: boolean;
  message: string;
  result: {
    available: number;
    freeze: number | null;
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
        currency: `${out}`,
        request: '/api/v1/account/balance',
        nonce: now,
      };
      const baseUrl = 'https://api.coinsbit.io';

      // Convert balance A to hex
      const payloadBalanceA = JSON.stringify(balanceA, null, 0);
      const jsonPayloadBalanceA =
        Buffer.from(payloadBalanceA).toString('base64');
      const encryptedBalanceA = crypto
        .createHmac('sha512', secret)
        .update(jsonPayloadBalanceA)
        .digest('hex');

      // Convert balance B to hex
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
      if (mkt.data.result[0].price < 0) {
        console.log(' ✗  Dont avaiable');
      } else if (mkt.data.result[0].price > 0) {
        console.log(` 💰  ${inp} current price: ` + mkt.data.result[0].price);
        const blIn = await firstValueFrom(
          this.http.post<BalanceA>(
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
        console.log(` ⚖️  Balance on ${out}: ${blIn.data.result.available}`);
        console.log(` 🛒  Buying ${inp}...`);
        const by = await axios.post(
          `${baseUrl}/api/v1/order/new?market=${inp}_${inp}&side=buy&amount=10&price=${mkt.data.result[0].price}`,
        );
        console.log(by.data.result);
        const blOut = await axios.post(
          `${baseUrl}/api/v1/account/balance?currency=${inp}`,
        );
        console.log(` ⚖️  Sucess, new ${inp} balance: ${blOut.data.result}`);
      }
    } catch (err) {
      console.error(err.cause);
    }
  }
}
