import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import * as bip39 from "bip39";
import * as _ from "lodash";
import { PopupService } from "../../services/popup/popup.service";
@Component({
    selector: "app-mnemonic-select",
    templateUrl: "./mnemonic-select.modal.html",
    styleUrls: ["./mnemonic-select.modal.scss"],
})
export class MnemonicSelectModal implements OnInit {
    mnemonicPhrase: string;
    mnemonicLanguage: string = null;
    mnemonicSize: number;

    constructor(
        public modalController: ModalController,
        public popupService: PopupService
    ) {}

    ngOnInit() {}

    async closeModal(success: boolean) {
        await this.modalController.dismiss({
            success,
            mnemonic: this.mnemonicPhrase,
            language: this.mnemonicLanguage,
        });
    }

    selectSize(size: number) {
        this.mnemonicSize = size;
    }

    async selectLanguage(lang: string) {
        this.mnemonicPhrase = bip39.generateMnemonic(
            this.mnemonicSize,
            null,
            bip39.wordlists[lang]
        );
        this.mnemonicLanguage = lang;
        await this.closeModal(true);
    }
}
