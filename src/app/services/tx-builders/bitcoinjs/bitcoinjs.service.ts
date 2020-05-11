import { Injectable } from "@angular/core";
import { CoinCredentials } from "../../../models/wallet/wallet";
import * as bitcoin from "bitcoinjs-lib";
import { Utxo } from "../../../models/blockbook/blockbook";
import { ModalController } from "@ionic/angular";
import { PlatformService } from "../../platform/platform.service";
import { HttpClient } from "@angular/common/http";
import { HTTP } from "@ionic-native/http/ngx";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";
import { CoinData } from "src/app/models/coin/coin";

@Injectable({
    providedIn: "root",
})
export class BitcoinjsService {
    public corsAnywhere = "https://cors-anywhere-eabz.herokuapp.com/";

    constructor(
        public platform: PlatformService,
        public http: HttpClient,
        public httpnative: HTTP
    ) {}

    async createTx(
        Utxos: any,
        toAddress: string,
        coinCredentials: CoinCredentials,
        satoshiAmount: number,
        satoshiFee: number,
        sendMax: boolean,
        ChangeAddress: string,
        TotalAmount: number
    ): Promise<string> {
        let coinConfig = CoinFactory.getCoin(coinCredentials.Coin);
        let network = coinConfig.getNetwork();
        const txb = new bitcoin.TransactionBuilder(network);
        txb.setVersion(coinConfig.tx_version);
        // Add Inputs
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < Utxos.length; i++) {
            let utxo = Utxos[i];
            let addrPathDeconstructed = utxo.path.split("/");
            let addressType =
                addrPathDeconstructed[4] === "1" ? "Change" : "Direct";
            let addressIndex = parseInt(addrPathDeconstructed[5], 10);
            if (utxo.scheme === "P2WPKH") {
                let privateKey = coinConfig.getAddressPrivKey(
                    addressIndex,
                    utxo.scheme,
                    addressType === "Change"
                );
                let key = bitcoin.ECPair.fromWIF(privateKey, network);
                const p2wpkh = bitcoin.payments.p2wpkh({
                    pubkey: key.publicKey,
                    network,
                });
                txb.addInput(utxo.txid, utxo.vout, null, p2wpkh.output);
            } else {
                txb.addInput(utxo.txid, utxo.vout);
            }
        }

        // Get OutputScript from Sending address
        let scriptPubkey = bitcoin.address.toOutputScript(toAddress, network);
        // If sending max we don't need a change address
        if (sendMax) {
            txb.addOutput(scriptPubkey, TotalAmount - satoshiFee);
        } else {
            // Add Outputs.
            txb.addOutput(scriptPubkey, satoshiAmount);
            if (TotalAmount - satoshiFee - satoshiAmount < 0) {
                // TODO error
            }
            txb.addOutput(
                ChangeAddress,
                TotalAmount - satoshiFee - satoshiAmount
            );
        }

        // Sign Inputs
        for (let i = 0; i < Utxos.length; i++) {
            let utxo: Utxo = Utxos[i];
            let addrPathDeconstructed = Utxos[i].path.split("/");
            let addressType =
                addrPathDeconstructed[4] === "1" ? "Change" : "Direct";
            let addressIndex = parseInt(addrPathDeconstructed[5], 10);
            if (utxo.scheme === "P2WPKH") {
                let privateKey = coinConfig.getAddressPrivKey(
                    addressIndex,
                    utxo.scheme,
                    addressType === "Change"
                );
                let key = bitcoin.ECPair.fromWIF(privateKey, network);
                txb.sign(i, key, null, null, parseInt(utxo.value, 10));
            }
            if (utxo.scheme === "P2SHInP2WPKH") {
                let privateKey = coinConfig.getAddressPrivKey(
                    addressIndex,
                    utxo.scheme,
                    addressType === "Change"
                );
                let key = bitcoin.ECPair.fromWIF(privateKey, network);
                const p2wpkh = bitcoin.payments.p2wpkh({
                    pubkey: key.publicKey,
                    network,
                });
                const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network });
                txb.sign(
                    i,
                    key,
                    p2sh.redeem.output,
                    null,
                    parseInt(utxo.value, 10)
                );
            }
            if (utxo.scheme === "P2PKH") {
                let privateKey = coinConfig.getAddressPrivKey(
                    addressIndex,
                    utxo.scheme,
                    addressType === "Change"
                );
                let key = bitcoin.ECPair.fromWIF(privateKey, network);
                txb.sign(i, key);
            }
        }

        let transaction = txb.build();
        return transaction.toHex();
    }

    async getUtxoFromAddress(address, coinConfig: CoinData): Promise<Utxo[]> {
        if (this.platform.isiOS || this.platform.isAndroid) {
            let response = await this.httpnative.get(
                coinConfig.blockbook + "/api/v2/utxo/" + address,
                {},
                {}
            );
            return JSON.parse(response.data);
        } else {
            return this.http
                .get<Utxo[]>(coinConfig.blockbook + "/api/v2/utxo/" + address)
                .toPromise();
        }
    }
}
