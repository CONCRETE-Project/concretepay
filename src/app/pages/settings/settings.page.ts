import { Component, OnInit } from "@angular/core";
import { UserSettingsStorageService } from "../../services/storage/user-settings/user-settings.service";
import { NavController } from "@ionic/angular";
import { PopupService } from "../../services/popup/popup.service";
import { OnGoingProcessService } from "../../services/on-going-process/on-going-process.service";
import { RatesStorageService } from "../../services/storage/rates/rates.service";
import { CoinsStorageService } from "src/app/services/storage/coins/coins.service";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.page.html",
    styleUrls: ["./settings.page.scss"],
})
export class SettingsPage implements OnInit {
    public selectedAlternative;
    public userSettingsState;

    constructor(
        public coinsStorageService: CoinsStorageService,
        public userSettingsStorageService: UserSettingsStorageService,
        public navController: NavController,
        public popupService: PopupService,
        public onGoingProcessService: OnGoingProcessService,
        public ratesStorageService: RatesStorageService
    ) {}

    async ngOnInit() {
        this.getAlternative();
    }

    private async getAlternative() {
        this.userSettingsState = await this.userSettingsStorageService.getAll();
        this.selectedAlternative = {
            name: this.userSettingsState.alt_coin.name,
            code: this.userSettingsState.alt_coin.code,
        };
    }

    public async goToAltCoinPage() {
        await this.navController.navigateForward("/settings/alt", {
            animationDirection: "forward",
            animated: true,
        });
    }

    public async reloadCoinsData() {
        let confirm = await this.popupService.ionicConfirm(
            "Warning!",
            "Do you want to resync the coin information?"
        );
        if (confirm) {
            await this.onGoingProcessService.set("Loading coins information");
            try {
                await this.coinsStorageService.clear();
                await this.coinsStorageService.loadCoinsFromRemote();
                this.onGoingProcessService.clear();
            } catch (e) {
                this.onGoingProcessService.clear();
            }
        }
    }

    public async clearRatesData() {
        let confirm = await this.popupService.ionicConfirm(
            "Warning!",
            "Do you want to clear the rates information?"
        );
        if (confirm) {
            await this.onGoingProcessService.set("Clearing information");
            await this.ratesStorageService.clear();
            this.onGoingProcessService.clear();
        }
    }
}
