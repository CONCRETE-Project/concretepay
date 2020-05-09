import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ModalController, NavController } from "@ionic/angular";
import { CoinCredentials, Wallet } from "../../models/wallet/wallet";
import { PopupService } from "../../services/popup/popup.service";
import { WalletService } from "../../services/wallet/wallet.service";
import { BitcoinjsService } from "../../services/tx-builders/bitcoinjs/bitcoinjs.service";
import { BlockbookService } from "../../services/blockbook/blockbook.service";
import { OnGoingProcessService } from "../../services/on-going-process/on-going-process.service";
import { FeeRates, Utxo } from "../../models/blockbook/blockbook";

@Component({
    selector: "app-confirm",
    templateUrl: "./confirm.modal.html",
    styleUrls: ["./confirm.modal.scss"],
})
// tslint:disable-next-line:component-class-suffix
export class ConfirmModal implements OnInit {
    @Input() wallet: Wallet;
    @Input() credentials: CoinCredentials;
    @Input() useSendMax: boolean;
    @Input() payment: {
        address: string;
        amount: number;
        label: string;
        message: string;
    };
    @Input() alternative: string;

    Utxos: Utxo[];
    TxSize: number;
    FeeRates: FeeRates;
    FeeSatoshis: number;
    ChangeAddress: string;
    SerializedTx: string;
    TotalAvailable: number;
    @ViewChild("serviceFee") serviceFee;

    constructor(
        public modalCtrl: ModalController,
        public navCtrl: NavController,
        public popupProvider: PopupService,
        public walletProvider: WalletService,
        public onGoingProcess: OnGoingProcessService,
        public bitcoinjsBuilder: BitcoinjsService,
        public blockbookProvider: BlockbookService
    ) {}

    async closeModal(success: boolean, canceled: boolean) {
        await this.modalCtrl.dismiss({ success, canceled });
        await this.navCtrl.navigateRoot("/home");
    }

    public async ngOnInit() {
        await this.init();
    }

    public async init() {
        let walletCred: CoinCredentials;
        if (this.wallet.Properties.encrypted) {
            let pass = await this.popupProvider.ionicPrompt(
                "Decrypt Wallet",
                "Please type your password",
                { type: "password" }
            );
            if (pass) {
                let tempWallet = await this.walletProvider.decryptWallet(
                    this.wallet,
                    pass
                );
                if (!tempWallet) {
                    await this.popupProvider.ionicAlert(
                        "Error",
                        "Your password is not correct."
                    );
                    await this.closeModal(false, false);
                    return;
                }
                walletCred = tempWallet.Credentials.wallet;
            } else {
                this.onGoingProcess.clear();
                await this.closeModal(false, false);
                return;
            }
        } else {
            walletCred = this.credentials;
        }
        this.credentials = walletCred;
        await this.onGoingProcess.set("Loading balances");
        this.Utxos = await this.getUtxos();
        await this.onGoingProcess.clear();
        let availableBalance = this.Utxos.map((utxo) =>
            parseInt(utxo.value, 10)
        ).reduce((a, b) => a + b, 0);
        if (availableBalance < this.payment.amount) {
            await this.popupProvider.ionicAlert(
                "Error",
                "You don't have enough balance to perform the transaction"
            );
            await this.closeModal(false, false);
            return;
        }
        await this.onGoingProcess.set("Loading fees");
        this.TxSize = await this.getTxSize();
        this.TotalAvailable = 0;
        for (let utxo of this.Utxos) {
            this.TotalAvailable += parseInt(utxo.value, 10);
        }
        this.ChangeAddress = await this.getChangeAddress();
        let feeRate = await this.blockbookProvider.getFeeRate(this.credentials);
        this.FeeRates = {
            fast: Math.floor((this.TxSize / 1024) * feeRate.fast),
            medium: Math.floor((this.TxSize / 1024) * feeRate.medium),
            slow: Math.floor((this.TxSize / 1024) * feeRate.slow),
        };
        await this.onGoingProcess.clear();
    }

    public async getUtxos() {
        return this.blockbookProvider.getUtxos(this.credentials);
    }

    public async getTxSize() {
        let TxSize;
        TxSize = 0;
        // Add default values
        TxSize += 10;
        // For each input there are 180 bytes max
        // For each output there are 34
        for (let _ of this.Utxos) {
            TxSize += 180;
        }
        if (this.useSendMax) {
            TxSize += 34;
        } else {
            TxSize += 34 * 2;
        }
        return TxSize;
    }

    public async getChangeAddress() {
        let address;
        if (this.credentials.isSegwit) {
            address = await this.walletProvider.createAddress(
                this.credentials,
                this.credentials.Derivations.P2SHInP2WPKH,
                "Change"
            );
        } else {
            address = await this.walletProvider.createAddress(
                this.credentials,
                this.credentials.Derivations.P2PKH,
                "Change"
            );
        }
        return address;
    }

    public async buildTx(walletCred: CoinCredentials): Promise<string> {
        try {
            let serializedTx = await this.bitcoinjsBuilder.createTx(
                this.Utxos,
                this.payment.address,
                walletCred,
                this.payment.amount,
                this.FeeSatoshis,
                this.useSendMax,
                this.ChangeAddress,
                this.TotalAvailable
            );
            if (serializedTx) {
                return serializedTx;
            } else {
                return null;
            }
        } catch (e) {}
    }

    public async feeSelected(e) {
        this.FeeSatoshis = this.FeeRates[e];
        try {
            await this.onGoingProcess.set("Building Transaction...");
            let serializedTx = await this.buildTx(this.credentials);
            if (serializedTx) {
                this.SerializedTx = serializedTx;
                this.onGoingProcess.clear();
            } else {
                this.onGoingProcess.clear();
                await this.popupProvider.ionicAlert(
                    "Error",
                    "Unable to build transaction"
                );
                await this.closeModal(false, false);
            }
        } catch (e) {
            this.onGoingProcess.clear();
            await this.popupProvider.ionicAlert(
                "Error",
                "Unable to build transactiom"
            );
            await this.closeModal(false, false);
        }
    }

    public async broadCastTx() {
        let sendAmount = this.useSendMax
            ? (this.TotalAvailable - this.FeeSatoshis) * (1 / 1e8)
            : this.payment.amount * (1 / 1e8);
        let confirm = await this.popupProvider.ionicConfirm(
            "Confirm",
            "Are you sure you want to send " +
                sendAmount.toFixed(8) +
                " " +
                this.credentials.Coin.toUpperCase()
        );
        if (confirm) {
            await this.onGoingProcess.set("Broadcasting Transaction");
            try {
                await this.blockbookProvider.sendTx(
                    this.credentials,
                    this.SerializedTx
                );
                this.onGoingProcess.clear();
                await this.closeModal(true, false);
            } catch (e) {
                this.onGoingProcess.clear();
                await this.popupProvider.ionicConfirm(
                    "Error Broadcasting Tx",
                    JSON.stringify(e)
                );
                await this.closeModal(false, false);
            }
        }
    }
}
