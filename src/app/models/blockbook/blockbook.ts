import { Tx } from "../wallet/wallet";

export interface Balance {
    Confirmed: number;
    Unconfirmed: number;
}

export interface BlockbookEndpoint {
    blockbook: any;
}

export interface XpubFullInfo {
    balance: Balance;
    transactions: Tx[];
    derivations: {
        P2PKH?: {
            lastDirectAddress: number;
            lastChangeAddress: number;
        };
        P2WPKH?: {
            lastDirectAddress: number;
            lastChangeAddress: number;
        };
        P2SHInP2WPKH?: {
            lastDirectAddress: number;
            lastChangeAddress: number;
        };
    };
}

export interface Vin {
    txid: string;
    sequence: any;
    n: number;
    addresses: string[];
    value: string;
    hex: string;
    vout?: number;
}

export interface Vout {
    value: string;
    n: number;
    spent: boolean;
    hex: string;
    addresses: string[];
}

export interface Transaction {
    txid: string;
    version: number;
    vin: Vin[];
    vout: Vout[];
    blockhash: string;
    blockheight: number;
    confirmations: number;
    blockTime: number;
    blocktime: number;
    value: string;
    valueIn: string;
    fees: string;
    hex: string;
    locktime?: number;
}

export interface Token {
    type: string;
    name: string;
    path: string;
    transfers: number;
    decimals: number;
    balance: string;
    totalReceived: string;
    totalSent: string;
}

export interface BlockbookInfo {
    page: number;
    totalPages: number;
    itemsOnPage: number;
    address: string;
    balance: string;
    totalReceived: string;
    totalSent: string;
    unconfirmedBalance: string;
    unconfirmedTxs: number;
    txs: number;
    transactions: Transaction[];
    totalTokens: number;
    tokens: Token[];
}

export interface Utxo {
    txid: string;
    vout: number;
    value: string;
    height: number;
    confirmations: number;
    address: string;
    path: string;
    scheme: string;
    nonce?: number;
}

export interface FeeRates {
    fast: number;
    medium: number;
    slow: number;
}
