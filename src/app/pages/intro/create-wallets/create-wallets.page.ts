import { Component } from "@angular/core";
import { NavController } from "@ionic/angular";
import { PopupService } from "../../../services/popup/popup.service";
import { WalletService } from "../../../services/wallet/wallet.service";
import { ExternalLinkService } from "../../../services/external-link/external-link.service";
import { UserSettingsStorageService } from "../../../services/storage/user-settings/user-settings.service";

@Component({
    selector: "app-create-wallets",
    templateUrl: "./create-wallets.page.html",
    styleUrls: ["./create-wallets.page.scss"],
})
export class CreateWalletsPage {
    public accepted;

    constructor(
        public navController: NavController,
        private externalLinkService: ExternalLinkService,
    ) {
        this.accepted = {
            first: false,
            second: false,
        };
    }

    public async createDefaultWallets() {
        await this.navController.navigateForward("/home");
    }

    async openTos() {
        let url = "";
        await this.externalLinkService.open(url);
    }

    async openPp() {
        let url = "";
        await this.externalLinkService.open(url);
    }
}
