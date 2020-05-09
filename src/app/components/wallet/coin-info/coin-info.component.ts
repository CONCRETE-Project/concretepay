import { Component, Input, OnInit } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../models/wallet/wallet";
import { NavController, ToastController } from "@ionic/angular";
import { PopupService } from "../../../services/popup/popup.service";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";
import { WalletService } from "../../../services/wallet/wallet.service";
import { UserSettingsStorageService } from "../../../services/storage/user-settings/user-settings.service";
import { CoinData } from "../../../models/coin/coin";
import { CoinService } from "../../../services/coin/coin";

@Component({
    selector: "app-coin-info",
    templateUrl: "./coin-info.component.html",
    styleUrls: ["./coin-info.component.scss"],
})
export class CoinInfoComponent implements OnInit {
    constructor(
        public coinService: CoinService,
        private walletStorage: WalletStorageService,
        private navCtrl: NavController,
        public popup: PopupService,
        private walletService: WalletService,
        private userSettingsStorage: UserSettingsStorageService
    ) {}
    @Input()
    Coin: string;
    @Input()
    wallet: Wallet;
    @Input()
    AlternativeCoin;
    credentials: CoinCredentials;
    coinData: CoinData;

    async init() {
        this.credentials = this.wallet.Credentials.wallet;
        this.coinData = this.coinService.coin;
        await this.getAlternative();
        await this.getInfo();
    }

    ngOnInit() {
        this.init();
    }

    async getInfo() {
        let walletInfo = await this.walletService.getInfo(this.wallet);
        if (walletInfo) {
            this.wallet = walletInfo.Wallet;
            await this.walletStorage.updateFullWallet(this.wallet);
        }
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
