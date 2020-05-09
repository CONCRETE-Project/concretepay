import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PopupService } from "../../../services/popup/popup.service";
import { WalletService } from "../../../services/wallet/wallet.service";
import { NavController } from "@ionic/angular";
import { PlatformService } from "../../../services/platform/platform.service";
import { Wallet } from "../../../models/wallet/wallet";
import { UserSettingsStorageService } from "../../../services/storage/user-settings/user-settings.service";
import * as bip39 from "bip39";
import { OnGoingProcessService } from "../../../services/on-going-process/on-going-process.service";
import * as pbkdf2 from "pbkdf2";
import * as aesjs from "aes-js";
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
        private walletPrv: WalletService,
        public platformProv: PlatformService,
        public modalService: ModalService,
        private navCtrl: NavController,
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

    public async createWallets() {
        if (this.isMnemonicSeed || this.isUnsafeMnemonicSeed) {
            let importData = await this.modalService.importModal({
                unsafe: this.isUnsafeMnemonicSeed,
            });
            if (importData.success) {
                let encrypt = await this.popupProvider.ionicConfirm(
                    "Encrypt wallet",
                    "Do you want to encrypt your wallet?",
                    "Yes",
                    "No"
                );
                if (encrypt) {
                    let pass1: string = await this.popupProvider.ionicPrompt(
                        "Enter password",
                        "Enter the password to encrypt your wallet",
                        { type: "password" }
                    );
                    let pass2: string = await this.popupProvider.ionicPrompt(
                        "Confirm",
                        "Enter the password again to confirm",
                        { type: "password" }
                    );
                    if (pass1 === pass2) {
                        await this.walletPrv.CreateDefaultWallet(
                            importData.mnemonic,
                            importData.language,
                            true,
                            true,
                            true,
                            false,
                            pass1,
                            this.createForm.value.walletName
                        );
                    } else {
                        await this.popupProvider.ionicAlert(
                            "Password don't match",
                            "Your passwords don't match, please try again"
                        );
                    }
                } else {
                    await this.walletPrv.CreateDefaultWallet(
                        importData.mnemonic,
                        importData.language,
                        true,
                        false,
                        true,
                        false,
                        "",
                        this.createForm.value.walletName
                    );
                    await this.userSettingsStorage.set("FirstTime", false);
                    await this.navCtrl.navigateRoot("/home", {
                        animated: true,
                        animationDirection: "forward",
                    });
                }
                await this.userSettingsStorage.set("FirstTime", false);
                await this.navCtrl.navigateRoot("/home");
            } else {
                return;
            }
        } else if (this.isScan) {
            let scanData = await this.modalService.scanModal();
            if (scanData.success) {
                let encryptedMnemonic = scanData.data;
                let pass: string = await this.popupProvider.ionicPrompt(
                    "Decrypt Mnemonic",
                    "Enter the password you used to encrypt your mnemonic",
                    { type: "password" }
                );
                if (pass) {
                    let mnemonic = await this.decryptMnemonic(
                        encryptedMnemonic,
                        pass
                    );
                    await this.createWallet(mnemonic, true);
                }
            }
        } else {
            let RandomMnemonic = bip39.generateMnemonic(
                128,
                null,
                bip39.wordlists.english
            );
            await this.createWallet(RandomMnemonic, false);
        }
    }

    public async createWallet(mnemonic, imported: boolean) {
        let data = await this.userSettingsStorage.getAll();
        data.first_time = false;
        // TODO language choose
        if (bip39.validateMnemonic(mnemonic, bip39.wordlists.english)) {
            let Popup: boolean = await this.popupProvider.ionicConfirm(
                "Encrypt Wallet",
                "Do you want to encrypt your wallet",
                "Yes",
                "No"
            );
            if (Popup) {
                let pass1: string = await this.popupProvider.ionicPrompt(
                    "Enter password",
                    "Enter the password to encrypt your wallet",
                    { type: "password" }
                );
                let pass2: string = await this.popupProvider.ionicPrompt(
                    "Confirm",
                    "Enter the password again to confirm",
                    { type: "password" }
                );
                if (pass1 === pass2) {
                    // TODO language choose
                    await this.walletPrv.CreateDefaultWallet(
                        mnemonic,
                        "english",
                        imported,
                        true,
                        true,
                        false,
                        pass1,
                        this.createForm.value.walletName
                    );
                } else {
                    let TryAgain: boolean = await this.popupProvider.ionicConfirm(
                        "Password Doesn't match",
                        "Your passwords doesn't match, do you want to try again?",
                        "Yes",
                        "No"
                    );
                    if (TryAgain) {
                        await this.createWallet(mnemonic, imported);
                    } else {
                        await this.userSettingsStorage.set("FirstTime", false);
                        await this.navCtrl.navigateRoot("/home");
                    }
                }
            } else {
                // TODO language choose
                await this.walletPrv.CreateDefaultWallet(
                    mnemonic,
                    "english",
                    imported,
                    false,
                    true,
                    false,
                    "",
                    this.createForm.value.walletName
                );
            }
            await this.userSettingsStorage.setAll(data);
            await this.userSettingsStorage.set("FirstTime", false);
            await this.navCtrl.navigateRoot("/home");
        } else {
            await this.popupProvider.ionicAlert("Error", "Invalid Mnemonic");
        }
    }

    public async decryptMnemonic(mnemonicEncrypted: string, password: string) {
        await this.onGoingProcessService.set("Decrypting mnemonic...");
        try {
            let mnemonicPhraseEncryptedBytes = aesjs.utils.hex.toBytes(
                mnemonicEncrypted
            );
            let key = pbkdf2.pbkdf2Sync(password, "salt", 1, 32, "sha512");
            let aesCtr = new aesjs.ModeOfOperation.ctr(
                key,
                new aesjs.Counter(1)
            );
            let mnemonicPhraseDecryptedBytes = aesCtr.decrypt(
                mnemonicPhraseEncryptedBytes
            );
            let decryptedMnemonic = aesjs.utils.utf8.fromBytes(
                mnemonicPhraseDecryptedBytes
            );
            this.onGoingProcessService.clear();
            return decryptedMnemonic;
        } catch (e) {
            this.onGoingProcessService.clear();
            return "";
        }
    }
}
