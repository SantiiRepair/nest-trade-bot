import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class Control {
  @Cron('10 * * * * *', {
    timeZone: 'America/Caracas',
  })
  async Mandalor(): Promise<any> {
    try {
      const now = Date.now();
      const input = {
        request: {
          market: 'ETH_BTC',
        },
      };
      const inp = 'ETH';
      const out = 'USDT';
      const apiKey = 'FD4A1B2472B9FEAAAFF35EF57F643EAF';
      const secret = 'A84D3C998CBD538370C0DC4B1A8FB877';
      const baseUrl = 'https://api.coinsbit.io';
      const payload = JSON.stringify(input, null, 0);
      const jsonPayload = Buffer.from(payload).toString('base64');
      const encrypted = crypto
        .createHmac('sha512', secret)
        .update(jsonPayload)
        .digest('hex');
      const config = {
        headers: {
          'Content-type': 'application/json',
          'X-TXC-APIKEY': apiKey,
          'X-TXC-PAYLOAD': jsonPayload,
          'X-TXC-SIGNATURE': encrypted,
        },
      };

      const response = await axios.get(
        `${baseUrl}/api/v1/public/history?market=${inp}_${out}`,
        config,
      );
      if (response.data.result[0].price > 0) {
        console.log(
          `💰  ${inp} current price: ` + response.data.result[0].price,
        );
        console.log(`🛒  Buying ${inp}...`);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
