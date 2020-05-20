import { Component } from "@angular/core";
import { NavController } from "@ionic/angular";
import { ExternalLinkService } from "../../../services/external-link/external-link.service";

@Component({
    selector: "app-create-wallets",
    templateUrl: "./create-wallets.page.html",
    styleUrls: ["./create-wallets.page.scss"],
})
export class CreateWalletsPage {
    public accepted;

    constructor(
        public navController: NavController,
        private externalLinkService: ExternalLinkService
    ) {
        this.accepted = {
            first: false,
        };
    }

    public async createDefaultWallets() {
        await this.navController.navigateForward("/home", {
            animated: true,
            animationDirection: "forward",
        });
    }
}
