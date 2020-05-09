import { CoinCredentials, Wallet } from "../wallet/wallet";

export interface ConfirmModalInput {
    wallet: Wallet;
    useSendMax: boolean;
    coin: string;
    credentials: CoinCredentials;
    payment: {
        address: string;
        amount: number;
        label?: string;
        message?: string;
    };
    alternative: string;
}

export interface ConfirmModalResponse {
    success: boolean;
    canceled: boolean;
}
