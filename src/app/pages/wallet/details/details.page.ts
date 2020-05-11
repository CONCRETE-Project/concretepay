import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";
import { WalletService } from "../../../services/wallet/wallet.service";
import { UserSettingsStorageService } from "../../../services/storage/user-settings/user-settings.service";
import { NavController } from "@ionic/angular";
import { ExternalLinkService } from "src/app/services/external-link/external-link.service";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";

@Component({
    selector: "app-details",
    templateUrl: "./details.page.html",
    styleUrls: ["./details.page.scss"],
})
export class WalletDetailsPage implements OnInit, OnDestroy {
    wallet: Wallet;
    credentials: CoinCredentials;
    AlternativeCoin;
    TxHistory;
    paramsSub: Subscription;
    isLoading: boolean;

    public options = [
        { icon: "fas fa-arrow-up", click: () => this.goToSend() },
        { icon: "fas fa-arrow-down", click: () => this.goToReceive() },
        { icon: "fas fa-history", click: () => this.goToTxHistory() },
        { icon: "fas fa-cog", click: () => this.goToPreferences() },
    ];

    constructor(
        private route: ActivatedRoute,
        public walletService: WalletService,
        public walletStorageService: WalletStorageService,
        public userSettingsStorage: UserSettingsStorageService,
        public navCtrl: NavController,
        public externalLinkService: ExternalLinkService
    ) {}

    async ngOnInit() {
        await this.getAlternative();
        await this.init();
    }

    async getInfo() {
        //let walletInfo = await this.walletService.getInfo(this.wallet);
        //if (walletInfo) {
        //    this.wallet = walletInfo.Wallet;
        //    this.TxHistory = walletInfo.TxHistory;
        //    await this.walletStorageService.updateFullWallet(this.wallet);
        //}
    }

    public async goToSend() {
        await this.navCtrl.navigateForward(
            "/wallet/" +
                this.wallet.Properties.id +
                "/" +
                this.credentials.Coin +
                "/send",
            { animated: true, animationDirection: "forward" }
        );
    }

    public async goToReceive() {
        await this.navCtrl.navigateForward(
            "/wallet/" +
                this.wallet.Properties.id +
                "/" +
                this.credentials.Coin +
                "/receive",
            { animated: true, animationDirection: "forward" }
        );
    }

    async goToTxHistory() {
        await this.navCtrl.navigateForward(
            "/wallet/" +
                this.wallet.Properties.id +
                "/" +
                this.credentials.Coin +
                "/history",
            { animated: true, animationDirection: "forward" }
        );
    }

    async goToPreferences() {
        await this.navCtrl.navigateForward(
            "/wallet/" +
                this.wallet.Properties.id +
                "/" +
                this.credentials.Coin +
                "/settings",
            { animated: true, animationDirection: "forward" }
        );
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }

    async init() {
        this.paramsSub = this.route.paramMap.subscribe(async (params) => {
            let walletid = params.get("walletid");
            this.wallet = await this.walletStorageService.get(
                "wallet-" + walletid
            );
            let coin = params.get("coin");
            this.credentials = this.wallet.Credentials.wallet.find(
                (coinCred) => coinCred.Coin === coin
            );
            this.isLoading = true;
            await this.getInfo();
            this.isLoading = false;
        });
    }

    getCoinNameFromTag(): string {
        return CoinFactory.getCoin(this.credentials.Coin).name;
    }

    public getAlternative() {
        this.userSettingsStorage.get("alt_coin").then((AltObj: any) => {
            this.AlternativeCoin = AltObj.code;
        });
    }
}
