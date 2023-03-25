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
            console.log(" •  Checking...");
            const mkt = await axios_1.default.get(`${baseUrl}/api/v1/public/history?market=${inp}_${out}`, config);
            if (mkt.data.result[0].price < 0) {
                console.log(" ✗  Dont avaiable");
            }
            else if (mkt.data.result[0].price > 0) {
                console.log(` 💰  ${inp} current price: ` + mkt.data.result[0].price);
                console.log(` 🛒  Buying ${inp}...`);
                const by = await axios_1.default.get(`${baseUrl}/api/v1/public/history?market=${inp}_${out}`, config);
            }
        }
        catch (err) {
            console.error(err.cause);
        }
    }
};
__decorate([
    (0, schedule_1.Cron)('* * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Control.prototype, "Mandalor", null);
Control = __decorate([
    (0, common_1.Injectable)()
], Control);
exports.Control = Control;
//# sourceMappingURL=app.service.js.map