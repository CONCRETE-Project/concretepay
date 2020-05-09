import { Component } from "@angular/core";
import { NavController } from "@ionic/angular";
import { PopupService } from "../../../services/popup/popup.service";
import { WalletService } from "../../../services/wallet/wallet.service";
import { ExternalLinkService } from "../../../services/external-link/external-link.service";
import * as bip39 from "bip39";
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
        private walletService: WalletService,
        private popup: PopupService,
        private externalLinkService: ExternalLinkService,
        private userSettingsStorageService: UserSettingsStorageService
    ) {
        this.accepted = {
            first: false,
            second: false,
        };
    }

    public async createDefaultWallets() {
        let RandomMnemonic = bip39.generateMnemonic(
            128,
            null,
            bip39.wordlists.english
        );
        try {
            await this.walletService.CreateDefaultWallet(
                RandomMnemonic,
                bip39.wordlists.english,
                false,
                false,
                true,
                false,
                "",
                null
            );
            await this.userSettingsStorageService.set("FirstTime", false);
            await this.navController.navigateRoot("/home", {
                animated: true,
                animationDirection: "forward",
            });
        } catch (e) {
            await this.popup.ionicAlert("Error", "Unable to create wallet.");
        }
    }

    public async importWallet() {
        await this.navController.navigateForward("/add", {
            animated: true,
            animationDirection: "forward",
        });
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
