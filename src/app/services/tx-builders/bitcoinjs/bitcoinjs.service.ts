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
import { Script } from "vm";

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

    p2csScript(network, coldStakeAddr: string, stakerAddr: string): Buffer {
        let decodedStake = bs58.decode(stakerAddr);
        let hash = decodedStake.slice(1).toString("hex");
        return bitcoin.script.fromASM(
            `
            OP_DUP  OP_HASH160  OP_ROT
            OP_IF
                OP_CHECKCOLDSTAKEVERIFY ${hash}
            OP_ELSE
                ${bitcoin.address
                    .toOutputScript(coldStakeAddr, network)
                    .toString("hex")}
            OP_ENDIF
            OP_EQUALVERIFY  OP_CHECKSIG
            `
                .trim()
                .replace(/\s+/g, " ")
        );
    }

    async createTx(
        utxos: Utxo[],
        spendLocked: boolean,
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
        const txb = new bitcoin.TransactionBuilder(network);
        txb.setVersion(coinConfig.tx_version);

        // Add Inputs
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < utxos.length; i++) {
            let utxo = utxos[i];
            txb.addInput(utxo.txid, utxo.vout);
        }

        let scriptPubkey = bitcoin.address.toOutputScript(toAddress, network);
        // If sending max we don't need a change address
        if (sendMax) {
            txb.addOutput(scriptPubkey, totalAmount - satoshiFee);
        } else {
            // Add Outputs.
            txb.addOutput(scriptPubkey, satoshiAmount);
            if (totalAmount - satoshiFee - satoshiAmount < 0) {
                // TODO error
            }
            txb.addOutput(
                changeAddress,
                totalAmount - satoshiFee - satoshiAmount
            );
        }

        // Sign Inputs
        for (let i = 0; i < utxos.length; i++) {
            let utxo: Utxo = utxos[i];
            if (!utxo.stake_contract) {
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
                txb.sign(i, key);
            }
        }

        let transaction = txb.buildIncomplete();

        for (let i = 0; i < utxos.length; i++) {
            let utxo = utxos[i];
            if (utxo.stake_contract) {
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
                let script = bitcoin.script.compile([
                    bitcoin.script.signature.encode(
                        key.sign(transaction.ins[i].hash),
                        bitcoin.Transaction.SIGHASH_ALL
                    ),
                    bitcoin.opcodes.OP_FALSE,
                    key.publicKey,
                ]);
                transaction.setInputScript(i, script);
            }
        }

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
        const txb = new bitcoin.TransactionBuilder(network);
        txb.setVersion(coinConfig.tx_version);

        // Add all the utxos as inputs, exclude utxos that are already on a cold stake contract.
        let availableAmount = 0;
        for (let i = 0; i < utxos.length; i++) {
            let utxo = utxos[i];
            if (!utxo.stake_contract) {
                availableAmount += parseInt(utxo.value);
                txb.addInput(utxo.txid, utxo.vout);
            }
        }

        // If the user is trying to create a contract with a higher amount than the available amount, we should return an error
        if (satoshiAmount + satoshiFee > availableAmount) {
            return;
        }

        let changeAddressScript = bitcoin.address.toOutputScript(
            changeAddress,
            network
        );
        let changeAmount = availableAmount - satoshiAmount - satoshiFee;
        txb.addOutput(
            this.p2csScript(network, ownerAddress, stakeAddr),
            satoshiAmount
        );
        txb.addOutput(changeAddressScript, changeAmount);

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
            txb.sign(i, key);
        }

        let tx = txb.build();
        return tx.toHex();
    }
}
