import { Balance } from "../blockbook/blockbook";

export interface WalletProps {
    Properties: {
        id: any;
        name: any;
        color: any;
        backup: boolean;
    };
    Credentials: {
        phrase: any;
        language: string;
        wallet: CoinCredentials[];
    };
}

export class Wallet {
    constructor(obj) {
        obj && Object.assign(this, obj);
    }
    Properties: {
        id: any;
        name: any;
        color: any;
        backup: boolean;
    };
    Credentials: {
        phrase: any;
        language: string;
        wallet: CoinCredentials[];
    };
}

export class FullInfoWallet {
    constructor(obj) {
        obj && Object.assign(this, obj);
    }
    public Wallet: Wallet;
    public TxHistory: any;
}

export interface CoinCredentials {
    Coin: string;
    CoinName: string;
    isSegwit: boolean;
    Derivations: {
        P2PKH?: CoinCredentialsDerivations;
        P2SHInP2WPKH?: CoinCredentialsDerivations;
        P2WPKH?: CoinCredentialsDerivations;
    };
    Blockbook: string;
    Balance: Balance;
    Transactions: Tx[];
}

export interface CoinCredentialsDerivations {
    Tokens?: string[];
    AccountPublicKey: string;
    LastDerivationPathDirect?: number;
    LastDerivationPathChange?: number;
    Address?: { address: string; path: string };
}

export interface Address {
    address: string;
    type: string;
    scheme: string;
}

export interface Tx {
    inputs: any[];
    outputs: any[];
    confirmations: number;
    txid: string;
    timestamp: number;
    fee: number;
}
