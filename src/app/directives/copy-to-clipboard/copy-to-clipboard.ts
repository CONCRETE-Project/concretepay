import { Directive } from "@angular/core";
import { ClipboardService } from "../../services/clipboard/clipboard.service";
import { ToastController } from "@ionic/angular";

@Directive({
    selector: "[copyToClipboard]",
    inputs: ["value: copyToClipboard"],
    host: {
        "(click)": "copy().then()",
    },
})
export class CopyToClipboardDirective {
    public value: string;
    constructor(
        private toastController: ToastController,
        private clipboardService: ClipboardService
    ) {}

    public async copy() {
        if (!this.value) {
            return;
        }
        await this.clipboardService.copy(this.value);
        const toast = await this.toastController.create({
            message: "Copied to clipboard",
            duration: 2000,
            position: "bottom",
        });
        await toast.present();
    }
}
