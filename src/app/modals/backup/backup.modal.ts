import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { PopupService } from "../../services/popup/popup.service";

@Component({
    selector: "app-backup",
    templateUrl: "./backup.modal.html",
    styleUrls: ["./backup.modal.scss"],
})
export class BackupModal implements OnInit {
    firstPage: boolean;
    secondPage: boolean;
    thirdPage: boolean;
    @Input()
    mnemonic: string;
    MnemonicArray: string[];
    selectedWords: string[] = [];
    constructor(
        private modalCtrl: ModalController,
        private popupService: PopupService
    ) {}

    ngOnInit() {
        this.firstPage = true;
        if (!this.mnemonic) {
            this.closeModal(false);
            return;
        }
        this.MnemonicArray = this.mnemonic.split(" ");
        this.shuffle(this.MnemonicArray);
    }

    async closeModal(success: boolean) {
        await this.modalCtrl.dismiss({ success });
    }

    nextPage(currPage) {
        switch (currPage) {
            case 1:
                this.firstPage = false;
                this.secondPage = true;
                this.thirdPage = false;
                return;
            case 2:
                this.firstPage = false;
                this.secondPage = false;
                this.thirdPage = true;
                return;
            case 3:
                this.firstPage = false;
                this.secondPage = true;
                this.thirdPage = false;
                return;
        }
    }

    clear() {
        this.selectedWords = [];
        this.MnemonicArray = this.mnemonic.split(" ");
        this.shuffle(this.MnemonicArray);
    }

    removeWord(index, word) {
        this.selectedWords.splice(index, 1);
        this.MnemonicArray.push(word);
        this.shuffle(this.MnemonicArray);
    }

    addWordToSelection(word) {
        this.selectedWords.push(word);
        let wordIndex = this.MnemonicArray.indexOf(word);
        this.MnemonicArray.splice(wordIndex, 1);
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    async finish() {
        let mnemonic = this.selectedWords.join(" ");
        if (mnemonic === this.mnemonic) {
            await this.closeModal(true);
        } else {
            await this.popupService.ionicAlert(
                "Error",
                "Your mnemonic doesn't match. Please try again and make sure you are importing on the correct order."
            );
            this.clear();
        }
    }
}
