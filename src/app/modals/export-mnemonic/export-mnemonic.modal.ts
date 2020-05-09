import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { PopupService } from "../../services/popup/popup.service";
import * as pbkdf2 from "pbkdf2";
import * as aesjs from "aes-js";
import { OnGoingProcessService } from "../../services/on-going-process/on-going-process.service";

@Component({
    selector: "app-export-modal",
    templateUrl: "./export-mnemonic.modal.html",
    styleUrls: ["./export-mnemonic.modal.scss"],
})
export class ExportMnemonicModal implements OnInit {
    @Input()
    mnemonic;
    @Input()
    encrypted: boolean;
    MnemonicPhrase;
    constructor(
        public modalCtrl: ModalController,
        public popupService: PopupService,
        public onGoingProcessService: OnGoingProcessService
    ) {}

    ngOnInit() {
        this.init();
    }

    async init() {
        if (!this.encrypted) {
            let encrypt = await this.popupService.ionicConfirm(
                "Encrypt",
                "Using mnemonic phrases on plain text is really unsecure, we will encrypt it, make sure you save the password",
                "Yes",
                "No"
            );
            if (encrypt) {
                let pass1: string = await this.popupService.ionicPrompt(
                    "Enter password",
                    "Enter the password to encrypt your wallet",
                    { type: "password" }
                );
                let pass2: string = await this.popupService.ionicPrompt(
                    "Confirm",
                    "Enter the password again to confirm",
                    { type: "password" }
                );
                if (pass1 === pass2) {
                    this.MnemonicPhrase = await this.encryptStr(pass1);
                } else {
                    let retry = await this.popupService.ionicConfirm(
                        "Password Doesn't match",
                        "Your passwords doesn't match, do you want to try again?",
                        "Yes",
                        "No"
                    );
                    if (retry) {
                        this.init();
                        return;
                    } else {
                        this.closeModal();
                    }
                }
            } else {
                this.closeModal();
            }
        } else {
            this.MnemonicPhrase = this.mnemonic;
        }
    }

    async closeModal() {
        await this.modalCtrl.dismiss();
    }

    async encryptStr(password): Promise<string> {
        await this.onGoingProcessService.set("Encrypting your mnemonic...");
        let key = pbkdf2.pbkdf2Sync(password, "salt", 1, 32, "sha512");
        let mnemonicPhraseBytes = aesjs.utils.utf8.toBytes(this.mnemonic);
        let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(1)); // Our encryption object.
        let mnemonicPhraseEncryptedBytes = aesCtr.encrypt(mnemonicPhraseBytes);
        this.onGoingProcessService.clear();
        return aesjs.utils.hex.fromBytes(mnemonicPhraseEncryptedBytes);
    }
}
