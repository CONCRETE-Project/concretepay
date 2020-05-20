import { Injectable } from "@angular/core";
import { CoinCredentials } from "../../../models/wallet/wallet";
import * as bitcoin from "bitcoinjs-lib";
import { Utxo } from "../../../models/blockbook/blockbook";
import { PlatformService } from "../../platform/platform.service";
import { HttpClient } from "@angular/common/http";
import { HTTP } from "@ionic-native/http/ngx";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";
import { CoinData } from "src/app/models/coin/coin";
import * as bs58 from "bs58check";
import { BlockbookService } from "../../blockbook/blockbook.service";

@Injectable({
    providedIn: "root",
})
export class BitcoinjsService {
    public corsAnywhere = "https://cors-anywhere-eabz.herokuapp.com/";
    network;
    constructor(
        public platform: PlatformService,
        private blockbookService: BlockbookService,
        public http: HttpClient,
        public httpnative: HTTP
    ) {}

    p2csScript(coldStakeAddr: string, stakerAddr: string): Buffer {
        let decodedAddr = bs58.decode(coldStakeAddr);
        let decodedStake = bs58.decode(stakerAddr);
        let script = bitcoin.script.compile([
            0x76,
            0xa9,
            0x7b,
            0x63,
            0xd1,
            decodedStake.slice(1),
            0x67,
            decodedAddr.slice(1),
            0x68,
            0x88,
            0xac,
        ]);
        return script;
    }

    async createTx(
        utxos: Utxo[],
        toAddress: string,
        coinCredentials: CoinCredentials,
        satoshiAmount: number,
        satoshiFee: number,
        sendMax: boolean,
        changeAddress: string,
        totalAmount: number,
        pass: string,
        mnemonic: string
    ): Promise<string> {
        let coinConfig = CoinFactory.getCoin(coinCredentials.Coin);
        let network = coinConfig.getNetwork();
        const psbt = new bitcoin.Psbt({ network });
        psbt.setVersion(coinConfig.tx_version);

        // Add Inputs
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < utxos.length; i++) {
            let utxo = utxos[i];
            let prevTx = await this.blockbookService.getTx(
                coinCredentials,
                utxo.txid
            );
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(prevTx.hex, "hex"),
            });
        }

        // If sending max we don't need a change address
        if (sendMax) {
            psbt.addOutput({
                address: toAddress,
                value: totalAmount - satoshiFee,
            });
        } else {
            // Add Outputs.
            psbt.addOutput({ address: toAddress, value: satoshiAmount });
            if (totalAmount - satoshiFee - satoshiAmount < 0) {
                // TODO error
            }
            psbt.addOutput({
                address: changeAddress,
                value: totalAmount - satoshiFee - satoshiAmount,
            });
        }

        // Sign Inputs
        for (let i = 0; i < utxos.length; i++) {
            let utxo: Utxo = utxos[i];
            let addrPathDeconstructed = utxos[i].path.split("/");
            let addressType =
                addrPathDeconstructed[4] === "1" ? "Change" : "Direct";
            let addressIndex = parseInt(addrPathDeconstructed[5], 10);
            let privateKey = await coinConfig.getAddressPrivKey(
                addressIndex,
                mnemonic,
                pass,
                utxo.scheme,
                addressType === "Change"
            );
            let key = bitcoin.ECPair.fromWIF(privateKey, network);
            psbt.signInput(i, key);
        }
        for (let i = 0; i < utxos.length; i++) {
            let utxo = utxos[i];
            if (utxo.stake_contract) {
                psbt.finalizeInput(i, this.finalizeP2CSInputs);
            } else {
                psbt.finalizeInput(i);
            }
        }
        return psbt.extractTransaction().toHex();
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

    async createNewP2CSTx(
        mnemonic: string,
        pass: string,
        satoshiAmount: number,
        stakeAddr: string,
        ownerAddress: string,
        changeAddress: string,
        utxos: Utxo[],
        satoshiFee: number,
        coinCredentials: CoinCredentials
    ): Promise<string> {
        let coinConfig = CoinFactory.getCoin(coinCredentials.Coin);
        let network = coinConfig.getNetwork();
        this.network = network;
        const psbt = new bitcoin.Psbt({ network });

        psbt.setVersion(coinConfig.tx_version);
        let availableAmount = 0;

        for (let i = 0; i < utxos.length; i++) {
            let utxo = utxos[i];
            availableAmount += parseInt(utxo.value);
            let prevTx = await this.blockbookService.getTx(
                coinCredentials,
                utxo.txid
            );
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(prevTx.hex, "hex"),
            });
        }

        if (satoshiAmount + satoshiFee > availableAmount) {
            return;
        }

        let changeAmount = availableAmount - satoshiAmount - satoshiFee;
        psbt.addOutput({
            script: this.p2csScript(ownerAddress, stakeAddr),
            value: satoshiAmount,
        });
        psbt.addOutput({ address: changeAddress, value: changeAmount });

        for (let i = 0; i < utxos.length; i++) {
            let utxo = utxos[i];
            let addrPathDeconstructed = utxos[i].path.split("/");
            let addressType =
                addrPathDeconstructed[4] === "1" ? "Change" : "Direct";
            let addressIndex = parseInt(addrPathDeconstructed[5], 10);
            let privateKey = await coinConfig.getAddressPrivKey(
                addressIndex,
                mnemonic,
                pass,
                utxo.scheme,
                addressType === "Change"
            );
            let key = bitcoin.ECPair.fromWIF(privateKey, network);
            psbt.signInput(i, key);
        }

        psbt.finalizeAllInputs();
        return psbt.extractTransaction().toHex();
    }

    finalizeP2CSInputs(
        inputIndex,
        input,
        script,
        isSegwit,
        isP2SH,
        isP2WSH
    ): {
        finalScriptSig: Buffer | undefined;
        finalScriptWitness: Buffer | undefined;
    } {
        let payment: bitcoin.Payment = {
            network: CoinFactory.getCoin("CCT").getNetwork(),
            output: script,
            input: bitcoin.script.compile([
                input.partialSig![0].signature,
                0x00,
                input.partialSig![0].pubkey,
            ]),
        };
        return { finalScriptSig: payment.input, finalScriptWitness: null };
    }
}
