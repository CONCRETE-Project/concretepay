import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../../services/storage/wallet/wallet.service";
import { NavController, ToastController } from "@ionic/angular";

@Component({
    selector: "app-coin-settings",
    templateUrl: "./coin-settings.page.html",
    styleUrls: ["./coin-settings.page.scss"],
})
export class CoinSettingsPage implements OnInit, OnDestroy {
    wallet: Wallet;
    paramsSub: Subscription;
    credentials: CoinCredentials;
    constructor(
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService,
        public navController: NavController,
        public toastController: ToastController
    ) {}

    ngOnInit() {
        this.init();
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }

    async init() {
        this.paramsSub = this.route.paramMap.subscribe(async (params) => {
            let walletid = params.get("walletid");
            this.wallet = await this.walletServiceStorage.get(
                "wallet-" + walletid
            );
            this.credentials = this.wallet.Credentials.wallet;
        });
    }

    async changeBlockbookEndpoint() {
        await this.navController.navigateForward(
            "wallet/" +
                this.wallet.Properties.id +
                "/" +
                this.credentials.Coin +
                "/settings/blockbook",
            { animated: true, animationDirection: "forward" }
        );
    }
}
