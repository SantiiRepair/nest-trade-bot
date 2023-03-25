import { Injectable } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class Control {
  @Interval(2000)
  async Mandalor(): Promise<any> {  
    try {      
      const inp = 'ETH';
      const out = 'USDT';      
      const apiKey = 'FD4A1B2472B9FEAAAFF35EF57F643EAF';
      const secret = 'A84D3C998CBD538370C0DC4B1A8FB877';
      const input = {
        request: {
          market: `${inp}_${out}`,
        },
      };
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
      console.log(" •  Checking...")     
      const mkt = await axios.get(`${baseUrl}/api/v1/public/history?market=${inp}_${out}`, config);
      if (mkt.data.result[0].price < 0) {
         console.log(" ✗  Dont avaiable")
      } else if(mkt.data.result[0].price > 0) {
         console.log(` 💰  ${inp} current price: ` + mkt.data.result[0].price);
         const bl = await axios.post(`${baseUrl}/api/v1/account/balance?currency=${out}`, config); 
         console.log(` 🛒  Balance on ${out}...`);         
         console.log(` 🛒  Buying ${inp}...`);
         const by = await axios.post(`${baseUrl}/api/v1/order/new?market=${inp}_${inp}&side=buy&amount=10&price=${mkt.data.result[0].price}`, config); 
         console.log(` Sucess, new ${inp} balance`);
       }
    } catch (err) {
      console.error(err.cause);
    }
  }
}
