import { HttpService } from '@nestjs/axios';
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
export declare class Control {
    private http;
    constructor(http: HttpService);
    Mandalor(): Promise<any>;
}
