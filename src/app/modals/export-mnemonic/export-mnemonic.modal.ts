import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { PopupService } from "../../services/popup/popup.service";
import { OnGoingProcessService } from "../../services/on-going-process/on-going-process.service";

@Component({
    selector: "app-export-modal",
    templateUrl: "./export-mnemonic.modal.html",
    styleUrls: ["./export-mnemonic.modal.scss"],
})
export class ExportMnemonicModal implements OnInit {
    @Input() mnemonic: string
    @Input() lang: string
    @Input() passhash: string
    encodedData: string;
    constructor(
        public modalCtrl: ModalController,
        public popupService: PopupService,
        public onGoingProcessService: OnGoingProcessService
    ) {}

    ngOnInit() {
        let objJsonStr = JSON.stringify({ mnemonic: this.mnemonic, lang: this.lang, passhash: this.passhash});
        this.encodedData = Buffer.from(objJsonStr).toString("base64");
    }

    async closeModal() {
        await this.modalCtrl.dismiss();
    }
}
