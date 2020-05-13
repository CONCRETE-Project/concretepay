import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import * as bip39 from "bip39";
import * as _ from "lodash";
import { PopupService } from "../../services/popup/popup.service";
@Component({
    selector: "app-import",
    templateUrl: "./import.modal.html",
    styleUrls: ["./import.modal.scss"],
})
export class ImportModal implements OnInit {
    mnemonicPhrase: string;
    mnemonicLanguage: string = null;
    mnemonicSize: number;

    selectedWords: string[] = [];
    selectionChars: string[] = [];
    currentSelectionWord = "";
    @Input()
    unsafe;
    constructor(
        public modalController: ModalController,
        public popupService: PopupService
    ) {}

    ngOnInit() {}

    clear() {
        this.selectedWords = [];
    }

    async closeModal(success: boolean) {
        await this.modalController.dismiss({
            success,
            mnemonic: this.mnemonicPhrase,
            language: this.mnemonicLanguage,
        });
    }

    removeWord(index) {
        this.selectedWords.splice(index, 1);
        this.selectionChars = _.uniq(
            bip39.wordlists[this.mnemonicLanguage].map((word) =>
                word.substr(0, 1)
            )
        );
    }

    addWord() {
        this.selectedWords.push(this.currentSelectionWord);
        this.currentSelectionWord = "";
        this.selectionChars = _.uniq(
            bip39.wordlists[this.mnemonicLanguage].map((word) =>
                word.substr(0, 1)
            )
        );
        if (this.selectedWords.length === this.mnemonicSize) {
            this.mnemonicPhrase = this.selectedWords.join(" ");
        }
    }

    clearWord() {
        this.currentSelectionWord = "";
        this.selectionChars = _.uniq(
            bip39.wordlists[this.mnemonicLanguage].map((word) =>
                word.substr(0, 1)
            )
        );
    }

    selectSize(size: number) {
        this.mnemonicSize = size;
    }

    selectLanguage(lang: string) {
        this.mnemonicLanguage = lang;
        this.selectionChars = _.uniq(
            bip39.wordlists[lang].map((word) => word.substr(0, 1))
        );
    }

    addCharToWord(chars: string) {
        this.currentSelectionWord = chars;
        this.selectionChars = _.uniq(
            bip39.wordlists[this.mnemonicLanguage]
                .map((word) =>
                    word.substr(0, this.currentSelectionWord.length + 1)
                )
                .filter(
                    (words) =>
                        words.substr(0, this.currentSelectionWord.length) ===
                        this.currentSelectionWord
                )
        );
        if (
            bip39.wordlists[this.mnemonicLanguage]
                .map((word) =>
                    word.substr(0, this.currentSelectionWord.length + 1)
                )
                .filter(
                    (words) =>
                        words.substr(0, this.currentSelectionWord.length) ===
                        this.currentSelectionWord
                ).length === 1
        ) {
            this.selectionChars = [
                bip39.wordlists[this.mnemonicLanguage].find(
                    (words) =>
                        words.substr(0, this.currentSelectionWord.length) ===
                        this.currentSelectionWord
                ),
            ];
        }
    }

    removeLastChar() {
        this.currentSelectionWord = this.currentSelectionWord.substr(
            0,
            this.currentSelectionWord.length - 1
        );
        this.selectionChars = _.uniq(
            bip39.wordlists[this.mnemonicLanguage]
                .map((word) =>
                    word.substr(0, this.currentSelectionWord.length + 1)
                )
                .filter(
                    (words) =>
                        words.substr(0, this.currentSelectionWord.length) ===
                        this.currentSelectionWord
                )
        );
    }

    async setMnemonic(mnemonic) {
        let valid = bip39.validateMnemonic(
            mnemonic,
            bip39.wordlists[this.mnemonicLanguage]
        );
        if (!valid) {
            await this.popupService.ionicAlert(
                "common.error",
                "modals.import.invalid-mnemonic"
            );
        } else {
            this.mnemonicPhrase = mnemonic;
            await this.closeModal(true);
        }
    }
}
