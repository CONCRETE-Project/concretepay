import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoinCredentials, Tx, Wallet } from "../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";
import { BlockbookService } from "src/app/services/blockbook/blockbook.service";
import { OnGoingProcessService } from "src/app/services/on-going-process/on-going-process.service";
import { Utxo } from "src/app/models/blockbook/blockbook";

@Component({
    selector: "app-address",
    templateUrl: "./address.page.html",
    styleUrls: ["./address.page.scss"],
})
export class WalletAddressPage implements OnInit, OnDestroy {
    wallet: Wallet;
    credentials: CoinCredentials;
    paramsSub: Subscription;
    AddressInfo: Utxo[] = [];
    constructor(
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService,
        public onGoingProcesService: OnGoingProcessService,
        public blockbookService: BlockbookService
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
            let coin = params.get("coin");
            this.credentials = this.wallet.Credentials.wallet.find(
                (coinCred) => coinCred.Coin === coin
            );
            this.onGoingProcesService.set("common.loading");
            this.AddressInfo = await this.getUtxos();
            console.log(this.AddressInfo);
            this.onGoingProcesService.clear();
        });
    }

    async getUtxos() {
        return await this.blockbookService.getUtxos(this.credentials);
    }
}
