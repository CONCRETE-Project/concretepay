import { Component, Input, OnChanges, OnInit } from "@angular/core";
import {
    NavController,
    ToastController,
    ActionSheetController,
} from "@ionic/angular";
import { PopupService } from "../../services/popup/popup.service";
/** Models **/
import { Wallet } from "../../models/wallet/wallet";
import { UserSettingsStorageService } from "src/app/services/storage/user-settings/user-settings.service";
import { WalletService } from "../../services/wallet/wallet.service";
import { WalletStorageService } from "../../services/storage/wallet/wallet.service";
import { RateService } from "../../services/rate/rate.service";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";
import { TranslateService } from "@ngx-translate/core";
import { ModalService } from "src/app/services/modal/modal.service";

@Component({
    selector: "app-wallet",
    templateUrl: "./wallet.component.html",
    styleUrls: ["./wallet.component.scss"],
})
export class WalletComponent implements OnInit, OnChanges {
    @Input()
    wallet: Wallet;
    @Input()
    AlternativeCoin;
    showBalanceFiat: boolean;
    TotalBalanceFiat;
    TotalBalance;
    isReloadingWallet: boolean;
    dark: boolean;
    constructor(
        public actionSheetController: ActionSheetController,
        public walletService: WalletService,
        public walletStorage: WalletStorageService,
        public modalService: ModalService,
        public popup: PopupService,
        public toastCtrl: ToastController,
        public translateService: TranslateService,
        public rateService: RateService,
        public navCtrl: NavController,
        public userSettings: UserSettingsStorageService
    ) {}

    async ngOnInit() {
        this.showBalanceFiat = true;
        //this.calculateBalance();
        this.getDarkMode();
    }

    async getDarkMode() {
        this.dark = await this.userSettings.get("DarkMode");
    }

    ngOnChanges() {
        this.reloadWallet();
    }

    async reloadWallet() {
        this.isReloadingWallet = true;
        this.getDarkMode();
        this.wallet = await this.walletStorage.get(
            "wallet-" + this.wallet.Properties.id
        );
        setTimeout(() => {
            this.isReloadingWallet = false;
        }, 1000);
    }

    public async goToSettings() {
        await this.navCtrl.navigateForward(
            "/wallet/" + this.wallet.Properties.id + "/settings"
        );
    }

    public async calculateBalance() {
        for (let credential of this.wallet.Credentials.wallet) {
            let fiatConf = await this.rateService.toFiat(
                credential.Balance.Confirmed,
                this.AlternativeCoin,
                credential.Coin
            );
            this.TotalBalanceFiat += fiatConf;
        }
    }

    public async displayInfo(m: string) {
        const toast = await this.toastCtrl.create({
            message: await this.translateService.get(m).toPromise(),
            duration: 5000,
            position: "bottom",
        });
        await toast.present();
    }

    public async createCredentials() {
        await this.showCoins();
    }

    public async showCoins() {
        let coinsAlready = this.wallet.Credentials.wallet.map(
            (coin) => coin.Coin
        );
        let filteredArray = CoinFactory.CoinList().filter(
            (coin) => !coinsAlready.includes(coin.tag)
        );
        let buttons = filteredArray.map((coin) => {
            return {
                text: coin.name,
                handler: () => {
                    this.modalService.passWordModal().then((pass) => {
                        if (pass.success) {
                            this.wallet
                                .newCoinCredentials(coin.tag, pass.password)
                                .then(async (success) => {
                                    if (!success) {
                                        this.popupError();
                                        return;
                                    }
                                    await this.walletStorage.updateFullWallet(
                                        this.wallet
                                    );
                                    return;
                                });
                        }
                    });
                },
            };
        });

        const actionSheet = await this.actionSheetController.create({
            header: await this.translateService
                .get("components.wallet.select-coin")
                .toPromise(),
            buttons,
        });
        await actionSheet.present();
    }

    public async popupError() {
        await this.popup.ionicAlert("common.error", "common.error-wallet");
    }
}
