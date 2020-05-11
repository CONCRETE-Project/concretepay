import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../models/wallet/wallet";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { WalletService } from "../../../services/wallet/wallet.service";
import { OnGoingProcessService } from "../../../services/on-going-process/on-going-process.service";
import { PopupService } from "../../../services/popup/popup.service";
import { ModalService } from "../../../services/modal/modal.service";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";

@Component({
    selector: "app-receive",
    templateUrl: "./receive.page.html",
    styleUrls: ["./receive.page.scss"],
})
export class WalletReceivePage implements OnInit, OnDestroy {
    wallet: Wallet;
    credentials: CoinCredentials;
    paramsSub: Subscription;
    address: string;
    qrAddress;
    derivation;
    loading: boolean;

    constructor(
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService,
        private walletService: WalletService,
        private onGoingProcessService: OnGoingProcessService,
        private popupService: PopupService,
        public modalService: ModalService
    ) {}

    async ngOnInit() {
        await this.init();
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }

    async init() {
        this.paramsSub = this.route.paramMap.subscribe(async (params) => {
            let walletid = params.get("walletid");
            let coin = params.get("coin");
            this.wallet = await this.walletServiceStorage.get(
                "wallet-" + walletid
            );
            this.credentials = this.wallet.Credentials.wallet.find(
                (coinCred) => coinCred.Coin === coin
            );
            let DefaultDerivation = this.credentials.isSegwit
                ? "P2SHInP2WPKH"
                : "P2PKH";
            await this.getAddress(DefaultDerivation);
        });
    }

    public async getAddress(Derivation) {
        this.derivation = this.credentials.Derivations[Derivation];
        await this.setAddress();
    }

    private async setAddress(): Promise<void> {
        await this.onGoingProcessService.set("Loading address");
        try {
            let address = await this.walletService.getAddress(
                this.credentials,
                this.derivation,
                "Direct"
            );
            this.loading = false;
            await this.updateQrAddress(address);
            this.onGoingProcessService.clear();
        } catch (e) {
            this.loading = false;
            this.onGoingProcessService.clear();
            await this.popupService.ionicAlert(
                "Error",
                "Unable to load address"
            );
        }
    }

    private updateQrAddress(address) {
        let coinConfig = CoinFactory.getCoin(this.credentials.Coin);
        let qrAddress = coinConfig.protocol + ":" + address;
        this.address = address;
        this.qrAddress = qrAddress;
        timer(200);
    }

    public async backupWallet() {
        let success = await this.modalService.backupModal({
            mnemonic: this.wallet.Credentials.phrase,
        });
        if (success) {
            await this.walletServiceStorage.update(this.wallet, "backup", true);
            await this.init();
        }
    }

    public setAmount(amount) {
        if (amount) {
            this.qrAddress = this.qrAddress.split("?")[0] + "?amount=" + amount;
        } else {
            this.qrAddress = this.qrAddress.split("?")[0];
        }
    }
}
