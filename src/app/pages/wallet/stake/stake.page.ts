import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../models/wallet/wallet";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-stake",
    templateUrl: "./stake.page.html",
    styleUrls: ["./stake.page.scss"],
})
export class WalletStakePage implements OnInit, OnDestroy {
    wallet: Wallet;
    credentials: CoinCredentials;
    paramsSub: Subscription;

    constructor(
        private route: ActivatedRoute,
        public walletStorageService: WalletStorageService
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
            let coin = params.get("coin");
            this.wallet = await this.walletStorageService.get(
                "wallet-" + walletid
            );
            this.credentials = this.wallet.Credentials.wallet.find(
                (coinCred) => coinCred.Coin === coin
            );
        });
    }
}
