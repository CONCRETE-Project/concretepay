import { Injectable } from "@angular/core";
import { WalletStorageService } from "../storage/wallet/wallet.service";
import { BlockbookService } from "../blockbook/blockbook.service";
import { OnGoingProcessService } from "../on-going-process/on-going-process.service";
import {
    CoinCredentials,
    CoinCredentialsDerivations,
    FullInfoWallet,
    Wallet,
    WalletProps,
} from "../../models/wallet/wallet";
import { mnemonicToSeed, validateMnemonic, wordlists } from "bip39";
import * as uuid from "uuid";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";

@Injectable({
    providedIn: "root",
})
export class WalletService {
    constructor(
        private walletStorage: WalletStorageService,
        private OnGoingProcess: OnGoingProcessService,
        public blockbook: BlockbookService
    ) {}

    public async CreateDefaultWallet(
        mnemonic: string,
        language: string,
        imported: boolean,
        encrypt: boolean,
        store: boolean,
        password: string,
        name: string,
        coin: string
    ) {
        try {
            await this.OnGoingProcess.set("Creating wallets");
            let walletProps: WalletProps = {
                Properties: {
                    id: uuid.v4(),
                    name: name ? name : "Main Wallet",
                    color: "#019477",
                    backup: imported,
                },
                Credentials: {
                    phrase: mnemonic,
                    language: language,
                    wallet: null,
                },
            };
            let wallet = new Wallet(walletProps);
            wallet.Credentials.wallet = await this.getWalletCredentials(
                wallet.Credentials.phrase,
                coin
            );
            if (encrypt) {
                await this.encryptWallet(wallet, password);
                this.OnGoingProcess.clear();
            } else {
                if (store) {
                    await this.walletStorage.store(wallet);
                    this.OnGoingProcess.clear();
                } else {
                    this.OnGoingProcess.clear();
                }
            }
        } catch (e) {
            this.OnGoingProcess.clear();
        }
    }

    public async getWalletCredentials(MnemonicPhrase, coin: string) {
        let coinInfo = CoinFactory.getCoin(coin);
        let CoinCredentials: CoinCredentials = {
            Coin: coinInfo.tag,
            CoinName: coinInfo.name,
            isSegwit: coinInfo.segwit,
            Derivations: {},
            Balance: {
                Confirmed: 0,
                Unconfirmed: 0,
            },
            Blockbook: coinInfo.blockbook,
            Transactions: [],
        };
        let seed = await mnemonicToSeed(MnemonicPhrase);
        if (coinInfo.segwit) {
            CoinCredentials.Derivations["P2WPKH"] = coinInfo.createCredentials(
                seed,
                "P2WPKH"
            );
            CoinCredentials.Derivations[
                "P2SHInP2WPKH"
            ] = coinInfo.createCredentials(seed, "P2SHInP2WPKH");
            return CoinCredentials;
        } else {
            CoinCredentials.Derivations["P2PKH"] = coinInfo.createCredentials(
                seed,
                "P2PKH"
            );
            return CoinCredentials;
        }
    }

    // Address creation/request methods
    public async createAddress(
        CoinCredentials: CoinCredentials,
        xPubCredentials: CoinCredentialsDerivations,
        type
    ): Promise<string> {
        let LastDerivation =
            type === "Direct"
                ? xPubCredentials.LastDerivationPathDirect
                    ? xPubCredentials.LastDerivationPathDirect
                    : 0
                : xPubCredentials.LastDerivationPathChange
                ? xPubCredentials.LastDerivationPathChange
                : 0;
        return this.getAddressFromIndex(
            xPubCredentials.AccountPublicKey,
            CoinCredentials.Coin,
            LastDerivation,
            type === "Change"
        );
    }

    public async getAddress(
        CoinCredentials: CoinCredentials,
        DerivationCredentials: CoinCredentialsDerivations,
        type
    ): Promise<string> {
        return this.createAddress(CoinCredentials, DerivationCredentials, type);
    }

    public async getAddressFromIndex(
        xPubString: string,
        Coin: string,
        Index: number,
        Change: boolean
    ): Promise<string> {
        let prefix = xPubString.substring(0, 4);
        let addressScheme =
            prefix === "zpub"
                ? "P2WPKH"
                : prefix === "Mtub" || prefix === "ypub"
                ? "P2SHInP2WPKH"
                : "P2PKH";
        let newIndex = Index ? Index + 1 : 1;
        let coin = CoinFactory.getCoin(Coin);
        return coin.getAddressPubKey(
            xPubString,
            newIndex,
            addressScheme,
            Change
        );
    }

    public async getInfo(wallet: Wallet) {
        let coinInfo = await this.blockbook.getInfo(wallet.Credentials.wallet);
        if (coinInfo) {
            wallet.Credentials.wallet.Balance = coinInfo.balance;
            if (wallet.Credentials.wallet.isSegwit) {
                wallet.Credentials.wallet.Derivations.P2WPKH.LastDerivationPathChange =
                    coinInfo.derivations.P2WPKH.lastChangeAddress;
                wallet.Credentials.wallet.Derivations.P2WPKH.LastDerivationPathDirect =
                    coinInfo.derivations.P2WPKH.lastDirectAddress;
                wallet.Credentials.wallet.Derivations.P2SHInP2WPKH.LastDerivationPathChange =
                    coinInfo.derivations.P2SHInP2WPKH.lastChangeAddress;
                wallet.Credentials.wallet.Derivations.P2SHInP2WPKH.LastDerivationPathDirect =
                    coinInfo.derivations.P2SHInP2WPKH.lastDirectAddress;
            } else {
                wallet.Credentials.wallet.Derivations.P2PKH.LastDerivationPathChange =
                    coinInfo.derivations.P2PKH.lastChangeAddress;
                wallet.Credentials.wallet.Derivations.P2PKH.LastDerivationPathDirect =
                    coinInfo.derivations.P2PKH.lastDirectAddress;
            }
            wallet.Credentials.wallet.Transactions = coinInfo.transactions;
            let txHistory = coinInfo.transactions;
            let info: FullInfoWallet = { Wallet: wallet, TxHistory: txHistory };
            await this.walletStorage.updateFullWallet(wallet);
            return info;
        }
    }
}
