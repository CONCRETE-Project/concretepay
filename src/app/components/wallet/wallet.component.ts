import { Component, Input, OnChanges, OnInit } from "@angular/core";
import {
    ModalController,
    NavController,
    ToastController,
} from "@ionic/angular";
import { PopupService } from "../../services/popup/popup.service";
import { OnGoingProcessService } from "../../services/on-going-process/on-going-process.service";
/** Models **/
import { Wallet } from "../../models/wallet/wallet";
import { UserSettingsStorageService } from "src/app/services/storage/user-settings/user-settings.service";
import { WalletService } from "../../services/wallet/wallet.service";
import { WalletStorageService } from "../../services/storage/wallet/wallet.service";
import { RateService } from "../../services/rate/rate.service";

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
        let btcBalance = 0;
        let btcConv = await this.rateService.toFiat(
            this.wallet.Credentials.wallet.Balance.Confirmed,
            "BTC",
            this.wallet.Credentials.wallet.Coin
        );
        btcBalance += btcConv;
        this.TotalBalance = btcBalance * 1e8;
        this.TotalBalanceFiat = await this.rateService.toFiat(
            this.TotalBalance,
            this.AlternativeCoin,
            "BTC"
        );
    }

    public async displayInfo(m: string) {
        const toast = await this.toastCtrl.create({
            message: m,
            duration: 5000,
            position: "bottom",
        });
        await toast.present();
    }
}
