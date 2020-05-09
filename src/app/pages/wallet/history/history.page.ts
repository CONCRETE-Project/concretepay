import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoinCredentials, Tx, Wallet } from "../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";

@Component({
    selector: "app-history",
    templateUrl: "./history.page.html",
    styleUrls: ["./history.page.scss"],
})
export class WalletHistoryPage implements OnInit, OnDestroy {
    wallet: Wallet;
    credentials: CoinCredentials;
    paramsSub: Subscription;
    TxHistory: Tx[];
    constructor(
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService
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
            this.TxHistory = this.credentials.Transactions;
        });
    }
}
