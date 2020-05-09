import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { PlatformService } from "../../services/platform/platform.service";
import { ZXingScannerComponent } from "@zxing/ngx-scanner";
import { BarcodeScanner } from "@ionic-native/barcode-scanner/ngx";

@Component({
    selector: "page-scan",
    templateUrl: "scan.modal.html",
})
export class ScanModal implements OnInit {
    @ViewChild("scanner")
    scanner: ZXingScannerComponent;
    constructor(
        private modalCtrl: ModalController,
        public platformProvider: PlatformService,
        private barcodeScanner: BarcodeScanner
    ) {}

    async ngOnInit() {
        await this.init();
    }

    async init() {
        if (this.platformProvider.isiOS) {
            try {
                let data = await this.barcodeScanner.scan({
                    showFlipCameraButton: true,
                    showTorchButton: true,
                    prompt: "Place a QR Code inside the scan area",
                    formats: "QR_CODE",
                    disableSuccessBeep: true,
                });
                if (data.cancelled) {
                    await this.modalCtrl.dismiss({ success: false });
                    return;
                }
                await this.modalCtrl.dismiss({
                    success: true,
                    data: data.text,
                });
            } catch (e) {
                await this.modalCtrl.dismiss({ success: false });
                return;
            }
        }
    }

    async handleQrCodeResult(e) {
        await this.modalCtrl.dismiss({ success: true, data: e });
    }

    async closeModal(success: boolean) {
        await this.modalCtrl.dismiss({ success });
    }
}
