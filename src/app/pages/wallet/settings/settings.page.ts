import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";
import { NavController } from "@ionic/angular";
import { WalletService } from "../../../services/wallet/wallet.service";
import { PopupService } from "../../../services/popup/popup.service";
import { ModalService } from "../../../services/modal/modal.service";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.page.html",
    styleUrls: ["./settings.page.scss"],
})
export class WalletSettingsPage implements OnInit, OnDestroy {
    wallet: Wallet;
    credentials: CoinCredentials;
    paramsSub: Subscription;

    constructor(
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService,
        public walletService: WalletService,
        public popupService: PopupService,
        public navController: NavController,
        public modalService: ModalService
    ) {}

    ngOnInit() {
        this.init();
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }

    async init() {
        this.paramsSub = this.route.paramMap.subscribe(async (params) => {
            let walletid = params.get("walletid");
            this.wallet = await this.walletServiceStorage.get(
                "wallet-" + walletid
            );
        });
    }

    public async openWalletName() {
        await this.navController.navigateForward(
            "wallet/" + this.wallet.Properties.id + "/settings/name",
            { animated: true, animationDirection: "forward" }
        );
    }

    public async openWalletColor() {
        await this.navController.navigateForward(
            "wallet/" + this.wallet.Properties.id + "/settings/color",
            { animated: true, animationDirection: "forward" }
        );
    }

    public async openExportMnemonic() {
        await this.modalService.exportMnemonic({
            encrypted: this.wallet.Properties.encrypted,
            mnemonic: this.wallet.Credentials.phrase,
        });
    }

    public async openBackupSettings() {
        if (this.wallet.Properties.encrypted) {
            let pass: string = await this.popupService.ionicPrompt(
                "Decrypt Wallet",
                "To update your wallet we need to decrypt it. Please type your password",
                { type: "password" }
            );
            if (pass) {
                let tempWallet = await this.walletService.decryptWallet(
                    this.wallet,
                    pass
                );
                if (!tempWallet) {
                    await this.popupService.ionicAlert(
                        "Error",
                        "Your password is not correct, please try again."
                    );
                    return;
                }
                let success = await this.modalService.backupModal({
                    mnemonic: tempWallet.Credentials.phrase,
                });
                if (success) {
                    await this.walletServiceStorage.update(
                        this.wallet,
                        "isBackup",
                        true
                    );
                    await this.init();
                }
            }
        } else {
            let success = await this.modalService.backupModal({
                mnemonic: this.wallet.Credentials.phrase,
            });
            if (success) {
                await this.walletServiceStorage.update(
                    this.wallet,
                    "isBackup",
                    true
                );
                await this.init();
            }
        }
    }

    public async openWalletInformation() {
        await this.navController.navigateForward(
            "wallet/" + this.wallet.Properties.id + "/settings/info",
            { animated: true, animationDirection: "forward" }
        );
    }

    public async openDeleteWallet() {
        await this.navController.navigateForward(
            "wallet/" + this.wallet.Properties.id + "/settings/delete",
            { animated: true, animationDirection: "forward" }
        );
    }
}
