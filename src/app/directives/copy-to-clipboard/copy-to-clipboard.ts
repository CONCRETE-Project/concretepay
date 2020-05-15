import { Directive } from "@angular/core";
import { ClipboardService } from "../../services/clipboard/clipboard.service";
import { ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

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
        private clipboardService: ClipboardService,
        private translateService: TranslateService
    ) {}

    public async copy() {
        if (!this.value) {
            return;
        }
        await this.clipboardService.copy(this.value);
        const toast = await this.toastController.create({
            message: await this.translateService.get("common.copy").toPromise(),
            duration: 2000,
            position: "bottom",
        });
        await toast.present();
    }
}
