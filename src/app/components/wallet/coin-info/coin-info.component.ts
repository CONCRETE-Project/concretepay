import { Component, Input, OnInit } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../models/wallet/wallet";
import { NavController, ToastController } from "@ionic/angular";
import { PopupService } from "../../../services/popup/popup.service";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";
import { WalletService } from "../../../services/wallet/wallet.service";
import { UserSettingsStorageService } from "../../../services/storage/user-settings/user-settings.service";
import { CoinData } from "../../../models/coin/coin";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-coin-info",
    templateUrl: "./coin-info.component.html",
    styleUrls: ["./coin-info.component.scss"],
})
export class CoinInfoComponent implements OnInit {
    constructor(
        private toastController: ToastController,
        private walletStorage: WalletStorageService,
        private navCtrl: NavController,
        public popup: PopupService,
        private walletService: WalletService,
        private userSettingsStorage: UserSettingsStorageService,
        private translateService: TranslateService
    ) {}
    @Input() Coin: string;
    @Input() wallet: Wallet;
    @Input() AlternativeCoin;
    credentials: CoinCredentials;
    coinData: CoinData;

    async init() {
        this.credentials = this.wallet.Credentials.wallet.find(
            (coinCred) => coinCred.Coin === this.Coin
        );
        this.coinData = CoinFactory.getCoin(this.Coin);
        //await this.getAlternative();
        await this.getInfo();
    }

    ngOnInit() {
        this.init();
    }

    async getInfo() {
        await this.walletService.getInfo(this.wallet, this.Coin);
    }

    async deleteCoin() {
        let confirm = await this.popup.ionicConfirm(
            "common.confirm",
            "components.wallet.hide-wallet"
        );
        if (confirm) {
            await this.wallet.deleteCoinCredentials(this.credentials.Coin);
            await this.walletStorage.updateFullWallet(this.wallet);
            await this.navCtrl.navigateRoot("/home");
            const toast = await this.toastController.create({
                message: await this.translateService
                    .get("components.wallet.hide-wallet-success")
                    .toPromise(),
                duration: 2000,
            });
            await toast.present();
        }
        await this.navCtrl.navigateRoot("/home");
    }

    public async goToSend() {
        await this.navCtrl.navigateForward(
            "/wallet/" + this.wallet.Properties.id + "/" + this.Coin + "/send",
            { animated: true, animationDirection: "forward" }
        );
    }

    public async goToReceive() {
        await this.navCtrl.navigateForward(
            "/wallet/" +
                this.wallet.Properties.id +
                "/" +
                this.Coin +
                "/receive",
            { animated: true, animationDirection: "forward" }
        );
    }

    public async goToDetails() {
        await this.navCtrl.navigateForward(
            "/wallet/" +
                this.wallet.Properties.id +
                "/" +
                this.Coin +
                "/details",
            { animated: true, animationDirection: "forward" }
        );
    }

    public async getAlternative() {
        let AltObj = await this.userSettingsStorage.get("alt_coin");
        this.AlternativeCoin = AltObj.code;
    }
}
