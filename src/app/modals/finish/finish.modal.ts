import { Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
    selector: "app-finish",
    templateUrl: "./finish.modal.html",
    styleUrls: ["./finish.modal.scss"],
})
export class FinishModal {
    @Input() success: boolean;
    @Input() canceled: boolean;
    @Input() message: string;
    constructor(private modalCtrl: ModalController) {}

    async close() {
        await this.modalCtrl.dismiss();
    }
}
