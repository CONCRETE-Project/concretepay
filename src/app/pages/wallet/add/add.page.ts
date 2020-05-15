import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PopupService } from "../../../services/popup/popup.service";
import { WalletService } from "../../../services/wallet/wallet.service";
import { NavController } from "@ionic/angular";
import { PlatformService } from "../../../services/platform/platform.service";
import { Wallet } from "../../../models/wallet/wallet";
import { ModalService } from "../../../services/modal/modal.service";
import * as sha from "sha.js";

@Component({
    selector: "app-add",
    templateUrl: "./add.page.html",
    styleUrls: ["./add.page.scss"],
})
export class AddWalletPage implements OnInit {
    public createForm: FormGroup;
    public isRandomSeed: boolean;
    public isMnemonicSeed: boolean;
    public isScan: boolean;
    public Wallet: Wallet;
    public wallets: Wallet[];
    public isElectron: boolean;
    public isAndroid: boolean;
    public isiOS: boolean;

    constructor(
        private fb: FormBuilder,
        private popupProvider: PopupService,
        public platformProv: PlatformService,
        public modalService: ModalService,
        public walletService: WalletService,
        private navController: NavController
    ) {
        this.isElectron = this.platformProv.isElectron;
        this.isAndroid = this.platformProv.isAndroid;
        this.isiOS = this.platformProv.isiOS;
        this.createForm = this.fb.group({
            walletName: [null, Validators.required],
            selectedSeed: [null, Validators.required],
            recoveryPhrase: [null],
        });
        this.isRandomSeed = false;
        this.isMnemonicSeed = false;
    }

    ngOnInit() {}

    public async SetSeed(Seed) {
        if (Seed === "Random") {
            this.isMnemonicSeed = false;
            this.isRandomSeed = true;
            this.isScan = false;
        } else if (Seed === "MnemonicPhrase") {
            this.isMnemonicSeed = true;
            this.isRandomSeed = false;
            this.isScan = false;
        } else if (Seed === "Scan") {
            this.isMnemonicSeed = false;
            this.isRandomSeed = false;
            this.isScan = true;
        } else {
            await this.popupProvider.ionicAlert("common.error", "Invalid Seed");
        }
    }

    public async createWallets() {
        if (this.isMnemonicSeed) {
            let mnemonicData = await this.modalService.importModal();
            if (mnemonicData.success) {
                let pass = await this.askPassword();
                if (!pass) return;
                let success = await this.walletService.newWallet(
                    this.createForm.value.walletName,
                    true,
                    mnemonicData.mnemonic,
                    pass,
                    mnemonicData.language
                );
                if (!success) {
                    this.popupError();
                    return;
                }
                await this.navController.navigateRoot("/home");
                return;
            }
            return;
        }
        if (this.isRandomSeed) {
            let mnemonicData = await this.modalService.mnemonicSelectModal();
            if (mnemonicData.success) {
                let pass = await this.askPassword();
                if (!pass) return;
                let success = await this.walletService.newWallet(
                    this.createForm.value.walletName,
                    false,
                    mnemonicData.mnemonic,
                    pass,
                    mnemonicData.language
                );
                if (!success) {
                    this.popupError();
                    return;
                }
                await this.navController.navigateRoot("/home");
                return;
            }
            return;
        }
        if (this.isScan) {
            let scanData = await this.modalService.scanModal();
            if (scanData.success) {
                let buff = new Buffer(scanData.data, "base64");
                let mnemonicInfo = JSON.parse(buff.toString());
                let pass = await this.askPassword();
                if (!pass) return;
                let hash = sha("sha256").update(pass).digest("hex");
                if (hash !== mnemonicInfo.passhash) {
                    this.popupError();
                    return;
                }
                let success = await this.walletService.newWallet(
                    this.createForm.value.walletName,
                    true,
                    mnemonicInfo.mnemonic,
                    pass,
                    mnemonicInfo.lang
                );
                if (!success) {
                    this.popupError();
                    return;
                }
                await this.navController.navigateRoot("/home");
                return;
            }
            return;
        }
    }

    public async askPassword(): Promise<string> {
        let pass = await this.popupProvider.ionicPrompt(
            "common.password",
            "pages.wallet.add.create-password"
        );
        if (pass) {
            let pass2 = await this.popupProvider.ionicPrompt(
                "common.password",
                "pages.wallet.add.create-password-confirm"
            );
            if (pass === pass2) {
                return pass;
            } else {
                await this.popupProvider.ionicAlert(
                    "common.error",
                    "common.error-password"
                );
                return null;
            }
        }
        return null;
    }

    public async popupError() {
        await this.popupProvider.ionicAlert(
            "common.error",
            "common.error-wallet"
        );
    }
}
