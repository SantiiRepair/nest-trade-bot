import { HttpService } from '@nestjs/axios';
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
export declare class Control {
    private readonly http;
    constructor(http: HttpService);
    Mandalor(): Promise<any>;
}
