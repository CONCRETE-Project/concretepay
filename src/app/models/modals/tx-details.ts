import { CoinCredentials } from "../wallet/wallet";

export interface TxDetailsModalInput {
    txid: string;
    coin: string;
    sent: boolean;
    contract: boolean;
    received: boolean;
    confirmed: boolean;
    amount: number;
    credentials: CoinCredentials;
    fee: number;
    type: string;
}
