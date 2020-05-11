import { Component, Input, OnInit } from "@angular/core";
import { Transaction } from "../../models/blockbook/blockbook";
import { OnGoingProcessService } from "../../services/on-going-process/on-going-process.service";
import { UserSettingsStorageService } from "../../services/storage/user-settings/user-settings.service";
import { ExternalLinkService } from "../../services/external-link/external-link.service";
import { BlockbookService } from "../../services/blockbook/blockbook.service";
import { PopupService } from "../../services/popup/popup.service";
import { ModalController } from "@ionic/angular";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";

@Component({
    selector: "app-tx-details",
    templateUrl: "./tx-details.modal.html",
    styleUrls: ["./tx-details.modal.scss"],
})
export class TxDetailsModal implements OnInit {
    @Input() txid;
    @Input() coin;
    @Input() sent;
    @Input() received;
    @Input() confirmed;
    @Input() amount;
    @Input() credentials;
    @Input() fee;
    @Input() type;

    btx: Transaction;
    alternative;
    blockExplorerURL: string;
    address: string;
    constructor(
        public onGoingProcessService: OnGoingProcessService,
        public userSettingsStorageService: UserSettingsStorageService,
        public externalLinkService: ExternalLinkService,
        public blockbookService: BlockbookService,
        public popupService: PopupService,
        public modalController: ModalController
    ) {}

    ngOnInit() {
        this.init();
    }

    async init() {
        await this.onGoingProcessService.set("Loading transaction details");
        let coinConfig = CoinFactory.getCoin(this.coin);
        this.blockExplorerURL = coinConfig.blockbook;
        try {
            this.btx = await this.blockbookService.getTx(
                this.credentials,
                this.txid
            );
            this.address = this.btx.vout[0].addresses[0];
            await this.getAlternative();
            this.onGoingProcessService.clear();
        } catch (e) {
            this.onGoingProcessService.clear();
            await this.popupService.ionicAlert(
                "Error",
                "Unable to get transaction information. Error: " + e
            );
            await this.modalController.dismiss();
        }
    }

    async closeModal() {
        await this.modalController.dismiss();
    }

    public async viewOnBlockchain() {
        let btx = this.btx;
        let url = this.blockExplorerURL + "/tx/" + btx.txid;
        await this.externalLinkService.open(url);
    }

    public async getAlternative() {
        let Alt: any = await this.userSettingsStorageService.get("alt_coin");
        this.alternative = Alt.code;
    }
}
