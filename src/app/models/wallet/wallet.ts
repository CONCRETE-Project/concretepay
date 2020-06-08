import { Balance } from "../blockbook/blockbook";
import * as sha from "sha.js";
import { CoinFactory } from "../coin-factory/coin-factory";
import * as bip39 from "bip39";
import { bip32 } from "bitcoinjs-lib";
import { CoinData } from "../coin/coin";

export interface WalletProps {
    Properties: {
        id: any;
        name: any;
        color: any;
        backup: boolean;
    };
    Credentials: {
        phrase: any;
        passhash: string;
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
        passhash: string;
        language: string;
        wallet: CoinCredentials[];
    };

    public async newCoinCredentials(
        coin: string,
        password: string
    ): Promise<boolean> {
        let hash = sha("sha256").update(password);
        if (hash.digest("hex") === this.Credentials.passhash) {
            let coinConfig = CoinFactory.getCoin(coin);
            let seed = await bip39.mnemonicToSeed(
                this.Credentials.phrase,
                password
            );
            let coinCredentials = await this.createCoinCredentials(
                coinConfig,
                seed
            );
            this.Credentials.wallet.push(coinCredentials);
            return true;
        }
        return false;
    }

    public async deleteCoinCredentials(tag: string) {
        this.Credentials.wallet = this.Credentials.wallet.filter(
            (coin) => coin.Coin != tag
        );
        return;
    }

    public async createCoinCredentials(
        coinConfig: CoinData,
        seed: any
    ): Promise<CoinCredentials> {
        let coinCredentials: CoinCredentials = {
            Coin: coinConfig.tag,
            CoinName: coinConfig.name,
            isSegwit: coinConfig.segwit,
            Derivations: {},
            Blockbook: coinConfig.blockbook,
            Balance: { Confirmed: 0, Unconfirmed: 0, Locked: 0 },
            Transactions: [],
        };
        if (coinConfig.segwit) {
            coinCredentials.Derivations[
                "P2WPKH"
            ] = await this.createCredentials(coinConfig, seed, "P2WPKH");
            coinCredentials.Derivations[
                "P2SHInP2WPKH"
            ] = await this.createCredentials(coinConfig, seed, "P2SHInP2WPKH");
        } else {
            coinCredentials.Derivations["P2PKH"] = await this.createCredentials(
                coinConfig,
                seed,
                "P2PKH"
            );
        }
        return coinCredentials;
    }

    public async createCredentials(
        coinConfig: CoinData,
        seed: any,
        scheme: string
    ): Promise<CoinCredentialsDerivations> {
        let node = bip32.fromSeed(seed, {
            messagePrefix: coinConfig.getNetwork(scheme).messagePrefix,
            bech32: coinConfig.getNetwork(scheme).bech32,
            bip32: coinConfig.getNetwork(scheme).bip32,
            pubKeyHash: coinConfig.getNetwork(scheme).pubKeyHash,
            scriptHash: coinConfig.getNetwork(scheme).scriptHash,
            wif: coinConfig.getNetwork(scheme).wif,
        });
        let purpose =
            scheme === "P2PKH" ? "44" : scheme === "P2SHInP2WPKH" ? "49" : "84";
        let accDerivation =
            "m/" + purpose + "'/" + coinConfig.hd_index + "'/0'";
        let acc = node.derivePath(accDerivation);
        return {
            AccountPublicKey: acc.neutered().toBase58(),
            LastDerivationPathChange: 0,
            LastDerivationPathDirect: 0,
        };
    }
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
    AccountPublicKey: string;
    LastDerivationPathDirect?: number;
    LastDerivationPathChange?: number;
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
    reward: boolean;
    rewardAmount: number;
}
