import { Component, OnDestroy, OnInit } from "@angular/core";
import { Wallet } from "../../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../../services/storage/wallet/wallet.service";
import { NavController } from "@ionic/angular";
import { PopupService } from "../../../../services/popup/popup.service";

@Component({
    selector: "app-delete",
    templateUrl: "./delete.page.html",
    styleUrls: ["./delete.page.scss"],
})
export class WalletDeletePage implements OnInit, OnDestroy {
    wallet: Wallet;
    paramsSub: Subscription;

    constructor(
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService,
        public popupService: PopupService,
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

    public async showDeletePopup() {
        let confirm = await this.popupService.ionicConfirm(
            "Confirm",
            "Are you sure you want to delete this wallet?"
        );
        if (confirm) {
            this.deleteWallet();
        }
    }

    public async deleteWallet() {
        await this.walletServiceStorage.remove(this.wallet);
        await this.navController.navigateRoot("/home");
    }
}
