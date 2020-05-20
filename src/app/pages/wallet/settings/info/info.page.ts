import { Component, OnDestroy, OnInit } from "@angular/core";
import { Wallet } from "../../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../../services/storage/wallet/wallet.service";
import { NavController } from "@ionic/angular";

@Component({
    selector: "app-info",
    templateUrl: "./info.page.html",
    styleUrls: ["./info.page.scss"],
})
export class WalletInfoPage implements OnInit, OnDestroy {
    wallet: Wallet;
    paramsSub: Subscription;

    constructor(
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService,
        public navController: NavController
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
        });
    }
}
