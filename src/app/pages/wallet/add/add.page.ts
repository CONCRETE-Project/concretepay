import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PopupService } from "../../../services/popup/popup.service";
import { WalletService } from "../../../services/wallet/wallet.service";
import { NavController } from "@ionic/angular";
import { PlatformService } from "../../../services/platform/platform.service";
import { Wallet } from "../../../models/wallet/wallet";
import { UserSettingsStorageService } from "../../../services/storage/user-settings/user-settings.service";
import { OnGoingProcessService } from "../../../services/on-going-process/on-going-process.service";
import { ModalService } from "../../../services/modal/modal.service";

@Component({
    selector: "app-add",
    templateUrl: "./add.page.html",
    styleUrls: ["./add.page.scss"],
})
export class AddWalletPage implements OnInit {
    public createForm: FormGroup;
    public isRandomSeed: boolean;
    public isMnemonicSeed: boolean;
    public isUnsafeMnemonicSeed: boolean;
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
        private navController: NavController,
        private onGoingProcessService: OnGoingProcessService,
        private userSettingsStorage: UserSettingsStorageService
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
            this.isUnsafeMnemonicSeed = false;
            this.isMnemonicSeed = false;
            this.isRandomSeed = true;
            this.isScan = false;
        } else if (Seed === "MnemonicPhrase") {
            this.isUnsafeMnemonicSeed = false;
            this.isMnemonicSeed = true;
            this.isRandomSeed = false;
            this.isScan = false;
        } else if (Seed === "Scan") {
            this.isUnsafeMnemonicSeed = false;
            this.isMnemonicSeed = false;
            this.isRandomSeed = false;
            this.isScan = true;
        } else if (Seed === "UnsafeMnemonicPhrase") {
            this.isUnsafeMnemonicSeed = true;
            this.isMnemonicSeed = false;
            this.isRandomSeed = false;
            this.isScan = false;
        } else {
            await this.popupProvider.ionicAlert("Error", "Invalid Seed");
        }
    }
}
