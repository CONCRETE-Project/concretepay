import { Component } from "@angular/core";
import { NavController } from "@ionic/angular";
import { UserSettingsStorageService } from "../../services/storage/user-settings/user-settings.service";
import { Wallet } from "../../models/wallet/wallet";
import { WalletStorageService } from "../../services/storage/wallet/wallet.service";
import { PopupService } from "../../services/popup/popup.service";
import { OnGoingProcessService } from "src/app/services/on-going-process/on-going-process.service";
import { CoinsStorageService } from "src/app/services/storage/coins/coins.service";

@Component({
    selector: "app-home",
    templateUrl: "home.page.html",
    styleUrls: ["home.page.scss"],
})
export class HomePage {
    public AlternativeCoin;
    public balance: number;
    public wallets: Wallet[];
    public newCoinsChecked = false;

    constructor(
        private onGoingProcessService: OnGoingProcessService,
        private coinsStorageService: CoinsStorageService,
        private navCtrl: NavController,
        public userSettingsStorageService: UserSettingsStorageService,
        public walletStorageService: WalletStorageService,
        public popupService: PopupService
    ) {}

    ngOnInit() {
        this.onGoingProcessService
            .set("common.loading")
            .then(async () => {
                this.coinsStorageService.loadCoinsInfo().then(async () => {
                    this.newCoinsChecked = true;
                    await this.loadWallets();
                });
            })
            .catch()
            .finally(() => {
                this.onGoingProcessService.clear();
            });
    }

    ionViewWillEnter() {
        if (this.newCoinsChecked) {
            this.loadWallets();
        }
    }

    private async loadWallets() {
        await this.getAlternative();
        await this.getWallets();
    }

    public async doRefresh(refresher) {
        refresher.pullMin = 90;
        await this.getWallets();
        setTimeout(() => {
            refresher.target.complete();
        }, 1000);
    }

    public async goToAddView() {
        await this.navCtrl.navigateForward("/add", {
            animated: true,
            animationDirection: "forward",
        });
    }

    public async goToSettings() {
        await this.navCtrl.navigateForward("/settings", {
            animated: true,
            animationDirection: "forward",
        });
    }

    public async getWallets() {
        this.wallets = await this.walletStorageService.getAll(false);
    }

    public async getAlternative() {
        let AltObj: any = await this.userSettingsStorageService.get("alt_coin");
        this.AlternativeCoin = AltObj.code;
    }
}
