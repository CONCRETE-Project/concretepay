import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ModalController, NavController } from "@ionic/angular";
import { CoinCredentials, Wallet } from "../../models/wallet/wallet";
import { PopupService } from "../../services/popup/popup.service";
import { WalletService } from "../../services/wallet/wallet.service";
import { BitcoinjsService } from "../../services/tx-builders/bitcoinjs/bitcoinjs.service";
import { BlockbookService } from "../../services/blockbook/blockbook.service";
import { OnGoingProcessService } from "../../services/on-going-process/on-going-process.service";
import { FeeRates, Utxo } from "../../models/blockbook/blockbook";
import * as sha from "sha.js";
import { TranslateService } from "@ngx-translate/core";

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
    spendLocked: boolean = false;
    constructor(
        public modalCtrl: ModalController,
        public navCtrl: NavController,
        public popupProvider: PopupService,
        public walletProvider: WalletService,
        public onGoingProcess: OnGoingProcessService,
        public bitcoinjsBuilder: BitcoinjsService,
        public blockbookProvider: BlockbookService,
        private translateService: TranslateService
    ) {}

    async closeModal(success: boolean, canceled: boolean) {
        await this.modalCtrl.dismiss({ success, canceled });
        await this.navCtrl.navigateRoot("/home");
    }

    public async ngOnInit() {
        await this.init();
    }

    public async init() {
        await this.onGoingProcess.set("common.loading");
        await this.getUtxos();
        this.FeeSatoshis = null;
        this.SerializedTx = null;
        await this.onGoingProcess.clear();
        let availableBalance = this.Utxos.map((utxo) =>
            parseInt(utxo.value, 10)
        ).reduce((a, b) => a + b, 0);
        if (availableBalance < this.payment.amount) {
            await this.popupProvider.ionicAlert(
                "common.error",
                "modals.confirm.error-balance"
            );
            await this.closeModal(false, false);
            return;
        }
        await this.onGoingProcess.set("common.loading");
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
        let utxos = await this.blockbookProvider.getUtxos(this.credentials);
        if (!this.spendLocked) {
            this.Utxos = utxos.filter((utxo) => !utxo.stake_contract);
        } else {
            this.Utxos = utxos;
        }
        return;
    }

    public async selectLocked(e) {
        this.init();
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

    public async buildTx(
        walletCred: CoinCredentials,
        pass: string
    ): Promise<string> {
        try {
            let serializedTx = await this.bitcoinjsBuilder.createTx(
                this.Utxos,
                this.payment.address,
                walletCred,
                this.payment.amount,
                this.FeeSatoshis,
                this.useSendMax,
                this.ChangeAddress,
                this.TotalAvailable,
                pass,
                this.wallet.Credentials.phrase
            );
            console.log(serializedTx);
            if (serializedTx) {
                return serializedTx;
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    public async feeSelected(e) {
        this.FeeSatoshis = this.FeeRates[e];
        let pass = await this.askPassword();
        let hash = sha("sha256").update(pass);
        if (hash.digest("hex") === this.wallet.Credentials.passhash) {
            try {
                await this.onGoingProcess.set(
                    "modals.confirm.building-transaction"
                );
                let serializedTx = await this.buildTx(this.credentials, pass);
                if (serializedTx) {
                    this.SerializedTx = serializedTx;
                    this.onGoingProcess.clear();
                } else {
                    this.onGoingProcess.clear();
                    await this.popupProvider.ionicAlert(
                        "common.error",
                        "modals.confirm.error-build"
                    );
                    await this.closeModal(false, false);
                }
            } catch (e) {
                this.onGoingProcess.clear();
                await this.popupProvider.ionicAlert(
                    "common.error",
                    "modals.confirm.error-build"
                );
                await this.closeModal(false, false);
            }
        } else {
            await this.popupError();
        }
    }

    public async broadCastTx() {
        let sendAmount = this.useSendMax
            ? (this.TotalAvailable - this.FeeSatoshis) * (1 / 1e8)
            : this.payment.amount * (1 / 1e8);
        let confirm = await this.popupProvider.ionicConfirm(
            "common.confirm",
            (await this.translateService
                .get("modals.confirm.confirm-send")
                .toPromise()) +
                " " +
                sendAmount.toFixed(8) +
                " " +
                this.credentials.Coin.toUpperCase()
        );
        if (confirm) {
            await this.onGoingProcess.set("modals.confirm.broadcasting");
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
                    "common.error",
                    JSON.stringify(e)
                );
                await this.closeModal(false, false);
            }
        }
    }

    public async askPassword(): Promise<string> {
        let pass = await this.popupProvider.ionicPrompt(
            "common.password",
            "components.wallet.ask-password"
        );
        return pass;
    }

    public async popupError() {
        await this.popupProvider.ionicAlert(
            "common.error",
            "common.error-decrypt"
        );
    }
}
