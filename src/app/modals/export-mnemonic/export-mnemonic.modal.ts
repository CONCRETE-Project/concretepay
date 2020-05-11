import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { PopupService } from "../../services/popup/popup.service";
import { OnGoingProcessService } from "../../services/on-going-process/on-going-process.service";

@Component({
    selector: "app-export-modal",
    templateUrl: "./export-mnemonic.modal.html",
    styleUrls: ["./export-mnemonic.modal.scss"],
})
export class ExportMnemonicModal {
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

    async closeModal() {
        await this.modalCtrl.dismiss();
    }
}
