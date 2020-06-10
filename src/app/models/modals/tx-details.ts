import { CoinCredentials } from "../wallet/wallet";

export interface TxDetailsModalInput {
    txid: string;
    coin: string;
    sent: boolean;
    contract: boolean;
    received: boolean;
    confirmed: boolean;
    reward: boolean;
    reward_amount: number;
    amount: number;
    credentials: CoinCredentials;
    fee: number;
    type: string;
    stakeAmount: number;
}
