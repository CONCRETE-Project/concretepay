import { Component, Input, OnChanges, OnInit } from "@angular/core";
import {
    ModalController,
    NavController,
    ToastController,
    ActionSheetController,
} from "@ionic/angular";
import { PopupService } from "../../services/popup/popup.service";
import { OnGoingProcessService } from "../../services/on-going-process/on-going-process.service";
/** Models **/
import { Wallet } from "../../models/wallet/wallet";
import { UserSettingsStorageService } from "src/app/services/storage/user-settings/user-settings.service";
import { WalletService } from "../../services/wallet/wallet.service";
import { WalletStorageService } from "../../services/storage/wallet/wallet.service";
import { RateService } from "../../services/rate/rate.service";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";

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
        public popup: PopupService,
        public toastCtrl: ToastController,
        public rateService: RateService,
        public navCtrl: NavController,
        public userSettings: UserSettingsStorageService
    ) {}

    async ngOnInit() {
        this.showBalanceFiat = true;
        this.calculateBalance();
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
            message: m,
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
                    this.askPassword().then((pass) => {
                        this.wallet
                            .newCoinCredentials(coin.tag, pass)
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
                    });
                },
            };
        });

        const actionSheet = await this.actionSheetController.create({
            header: "components.wallet.select-coin",
            buttons: buttons,
        });
        await actionSheet.present();
    }

    public async askPassword(): Promise<string> {
        let pass = await this.popup.ionicPrompt(
            "common.password",
            "components.wallet.ask-password"
        );
        return pass;
    }

    public async popupError() {
        await this.popup.ionicAlert("common.error", "common.error-wallet");
    }
}
