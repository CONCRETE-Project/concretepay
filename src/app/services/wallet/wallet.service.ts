import { Injectable } from "@angular/core";
import { BlockbookService } from "../blockbook/blockbook.service";
import {
    CoinCredentials,
    CoinCredentialsDerivations,
} from "../../models/wallet/wallet";
import { mnemonicToSeed } from "bip39";
import * as uuid from "uuid";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";

@Injectable({
    providedIn: "root",
})
export class WalletService {
    constructor(
        public blockbook: BlockbookService
    ) {}

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
}
