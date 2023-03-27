"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Control = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const crypto = require("crypto");
const axios_1 = require("axios");
let Control = class Control {
    async Mandalor() {
        try {
            const now = Date.now();
            const inp = 'ETH';
            const out = 'USDT';
            const max = 1500;
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
            const payloadBalanceA = JSON.stringify(balanceA, null, 0);
            const jsonPayloadBalanceA = Buffer.from(payloadBalanceA).toString('base64');
            const encryptedBalanceA = crypto
                .createHmac('sha512', secret)
                .update(jsonPayloadBalanceA)
                .digest('hex');
            const payloadBalanceB = JSON.stringify(balanceB, null, 0);
            const jsonPayloadBalanceB = Buffer.from(payloadBalanceB).toString('base64');
            const encryptedBalanceB = crypto
                .createHmac('sha512', secret)
                .update(jsonPayloadBalanceB)
                .digest('hex');
            console.log(' ⏳  Checking...');
            const mkt = await axios_1.default.get(`${baseUrl}/api/v1/public/history?market=${inp}_${out}`);
            if (mkt.data.result == false || mkt.data.result[0].price >= max) {
                mkt.data.result[0].price >= max ? console.log(' ✗  Price very hight') : console.log(' ✗  Dont available');
            }
            else if (mkt.data.result !== false && mkt.data.result[0].price < max) {
                console.log(` 💰  ${inp} current price: ` + mkt.data.result[0].price);
                const blIn = await axios_1.default.post(`${baseUrl}/api/v1/account/balance`, balanceA, {
                    headers: {
                        'Content-type': 'application/json',
                        'X-TXC-APIKEY': apiKey,
                        'X-TXC-PAYLOAD': jsonPayloadBalanceA,
                        'X-TXC-SIGNATURE': encryptedBalanceA,
                    },
                });
                console.log(` ⚖️  Balance on ${out}: ${blIn.data.result.available}`);
                const slip = blIn.data.result.available / mkt.data.result[0].price;
                const buy = {
                    callback_url: 'https://callback.url',
                    success_url: 'https://google.com/',
                    error_url: 'https://google.com/',
                    market: `${inp}_${out}`,
                    side: 'buy',
                    amount: `${slip}`,
                    price: `${mkt.data.result[0].price}`,
                    request: '/api/v1/order/new',
                    nonce: now + 200,
                };
                const payloadBuy = JSON.stringify(buy, null, 0);
                const jsonPayloadBuy = Buffer.from(payloadBuy).toString('base64');
                const encryptedBuy = crypto
                    .createHmac('sha512', secret)
                    .update(jsonPayloadBuy)
                    .digest('hex');
                console.log(` 🛒  Buying ${inp}...`);
                const by = await axios_1.default.post(`${baseUrl}/api/v1/order/new`, buy, {
                    headers: {
                        'Content-type': 'application/json',
                        'X-TXC-APIKEY': apiKey,
                        'X-TXC-PAYLOAD': jsonPayloadBuy,
                        'X-TXC-SIGNATURE': encryptedBuy,
                    },
                });
                console.log(' ❗  Message: ' + by.data.message);
                if (by.data.code == true) {
                    const blOut = await axios_1.default.post(`${baseUrl}/api/v1/account/balance`, balanceB, {
                        headers: {
                            'Content-type': 'application/json',
                            'X-TXC-APIKEY': apiKey,
                            'X-TXC-PAYLOAD': jsonPayloadBalanceB,
                            'X-TXC-SIGNATURE': encryptedBalanceB,
                        },
                    });
                    console.log(` ⚖️  Success, new ${inp} balance: ${blOut.data.result.available}`);
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    }
};
__decorate([
    (0, schedule_1.Interval)(2000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Control.prototype, "Mandalor", null);
Control = __decorate([
    (0, common_1.Injectable)()
], Control);
exports.Control = Control;
//# sourceMappingURL=app.service.js.map