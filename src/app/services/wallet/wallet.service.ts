import { Injectable } from "@angular/core";
import { BlockbookService } from "../blockbook/blockbook.service";
import {
    CoinCredentials,
    CoinCredentialsDerivations,
    Wallet,
    FullInfoWallet,
} from "../../models/wallet/wallet";
import * as uuid from "uuid";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";
import { WalletStorageService } from "../storage/wallet/wallet.service";
import * as sha from "sha.js";

@Injectable({
    providedIn: "root",
})
export class WalletService {
    constructor(
        public blockbook: BlockbookService,
        public walletStorageService: WalletStorageService
    ) {}

    public async getInfo(wallet: Wallet, coin: string) {
        let credentials = wallet.Credentials.wallet.find(
            (coinCredentials) => coinCredentials.Coin === coin
        );
        let coinInfo = await this.blockbook.getInfo(credentials);
        if (coinInfo) {
            credentials.Balance = coinInfo.balance;
            if (credentials.isSegwit) {
                credentials.Derivations.P2WPKH.LastDerivationPathChange =
                    coinInfo.derivations.P2WPKH.lastChangeAddress;
                credentials.Derivations.P2WPKH.LastDerivationPathDirect =
                    coinInfo.derivations.P2WPKH.lastDirectAddress;
                credentials.Derivations.P2SHInP2WPKH.LastDerivationPathChange =
                    coinInfo.derivations.P2SHInP2WPKH.lastChangeAddress;
                credentials.Derivations.P2SHInP2WPKH.LastDerivationPathDirect =
                    coinInfo.derivations.P2SHInP2WPKH.lastDirectAddress;
            } else {
                credentials.Derivations.P2PKH.LastDerivationPathChange =
                    coinInfo.derivations.P2PKH.lastChangeAddress;
                credentials.Derivations.P2PKH.LastDerivationPathDirect =
                    coinInfo.derivations.P2PKH.lastDirectAddress;
            }
            credentials.Transactions = coinInfo.transactions;
            let index = wallet.Credentials.wallet
                .map((coin) => coin.Coin)
                .indexOf(credentials.Coin);
            let txHistory = coinInfo.transactions;
            wallet.Credentials[index] = credentials;
            let info: FullInfoWallet = { Wallet: wallet, TxHistory: txHistory };
            await this.walletStorageService.updateFullWallet(wallet);
            return info;
        }
    }

    public async newWallet(
        name: string,
        backup: boolean,
        mnemonic: string,
        password: string,
        language: string
    ): Promise<boolean> {
        // Here we create a sha256 hash of the password to prevent using a wrong password to derivate wrong keys
        let passwordHash = sha("sha256").update(password);
        let walletInfo = {
            Properties: {
                id: uuid.v4(),
                name,
                color: "#019477",
                backup,
            },
            Credentials: {
                phrase: mnemonic,
                passhash: passwordHash.digest("hex"),
                language,
                wallet: [],
            },
        };
        let wallet = new Wallet(walletInfo);
        let succes = await wallet.newCoinCredentials("CCE", password);
        if (!succes) return false;
        if (succes) {
            await this.walletStorageService.updateFullWallet(wallet);
            return true;
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
}
