import { Injectable } from "@angular/core";
import {
    AmountModalInput,
    AmountModalResponse,
} from "../../models/modals/amount";
import { AmountModal } from "../../modals/amount/amount.modal";
import { ModalController } from "@ionic/angular";
import { ScanModal } from "../../modals/scan/scan.modal";
import { ScanModalResponse } from "../../models/modals/scan";
import { FinishModalInput } from "../../models/modals/finish";
import { FinishModal } from "../../modals/finish/finish.modal";
import {
    ConfirmModalInput,
    ConfirmModalResponse,
} from "../../models/modals/confirm";
import { ConfirmModal } from "../../modals/confirm/confirm.modal";
import { BackupModal } from "../../modals/backup/backup.modal";
import { BackupModalInput } from "../../models/modals/backup";
import { ExportMnemonicModal } from "../../modals/export-mnemonic/export-mnemonic.modal";
import { ExportMnemonicModalInput } from "../../models/modals/export-mnemonic";
import {
    ImportModalInput,
    ImportModalResponse,
} from "../../models/modals/import";
import { ImportModal } from "../../modals/import/import.modal";
import { TxDetailsModal } from "../../modals/tx-details/tx-details.modal";
import { TxDetailsModalInput } from "../../models/modals/tx-details";

@Injectable({
    providedIn: "root",
})
export class ModalService {
    constructor(public modalController: ModalController) {}

    public async amountModal(
        input: AmountModalInput
    ): Promise<AmountModalResponse> {
        let modal = await this.modalController.create({
            component: AmountModal,
            componentProps: input,
        });
        await modal.present();
        let resp = await modal.onDidDismiss();
        return resp.data;
    }

    public async scanModal(): Promise<ScanModalResponse> {
        let scanModal = await this.modalController.create({
            component: ScanModal,
        });
        await scanModal.present();
        let scanModalInfo = await scanModal.onDidDismiss();
        return scanModalInfo.data;
    }

    public async finishModal(input: FinishModalInput) {
        let finalModal = await this.modalController.create({
            component: FinishModal,
            componentProps: input,
        });
        await finalModal.present();
    }

    public async confirmModal(
        input: ConfirmModalInput
    ): Promise<ConfirmModalResponse> {
        let modal = await this.modalController.create({
            component: ConfirmModal,
            componentProps: input,
        });
        await modal.present();
        let resp = await modal.onDidDismiss();
        return resp.data;
    }

    public async backupModal(input: BackupModalInput) {
        let backupModal = await this.modalController.create({
            component: BackupModal,
            componentProps: input,
        });
        await backupModal.present();
        let backupRes = await backupModal.onDidDismiss();
        return backupRes.data.success;
    }

    public async exportMnemonic(input: ExportMnemonicModalInput) {
        let exportModal = await this.modalController.create({
            component: ExportMnemonicModal,
            componentProps: input,
        });
        await exportModal.present();
    }

    public async importModal(
        input: ImportModalInput
    ): Promise<ImportModalResponse> {
        let modal = await this.modalController.create({
            component: ImportModal,
            componentProps: input,
        });
        await modal.present();
        let resp = await modal.onDidDismiss();
        return resp.data;
    }

    public async txDetailsModal(input: TxDetailsModalInput) {
        let txmodal = await this.modalController.create({
            component: TxDetailsModal,
            componentProps: input,
        });
        await txmodal.present();
    }
}
