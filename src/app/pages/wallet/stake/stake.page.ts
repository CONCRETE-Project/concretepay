import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../models/wallet/wallet";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";
import { Subscription } from "rxjs";
import { PopupService } from "src/app/services/popup/popup.service";
import * as sha from "sha.js";
import { BitcoinjsService } from "src/app/services/tx-builders/bitcoinjs/bitcoinjs.service";
import { BlockbookService } from "src/app/services/blockbook/blockbook.service";
import { CoinsService } from "src/app/services/coins-service/coins-service.service";

@Component({
    selector: "app-stake",
    templateUrl: "./stake.page.html",
    styleUrls: ["./stake.page.scss"],
})
export class WalletStakePage implements OnInit, OnDestroy {
    wallet: Wallet;
    credentials: CoinCredentials;
    paramsSub: Subscription;
    selectedAmount: number;
    constructor(
        private route: ActivatedRoute,
        public walletStorageService: WalletStorageService,
        public bitcoinjsService: BitcoinjsService,
        public blockbookService: BlockbookService,
        public coinsService: CoinsService,
        private popupService: PopupService
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

    async amountSelection(e) {
        this.selectedAmount = parseInt(e.detail.value);
    }

    async startStake() {
        let confirm = await this.popupService.ionicConfirm(
            "common.confirm",
            "pages.wallet.stake.confirm-stake"
        );
        if (confirm) {
            let pass = await this.askPassword();
            let hash = sha("256").update(pass);
            if (this.wallet.Credentials.passhash === hash.digest("hex")) {
                // Get Stake Addr\
                let stakeAddr;
                // Get Change Addr
                let changeAddr;
                // Get Onwer Addr
                let ownerAddr;
                // Get Utxos
                // Get Fee
                let satoshiFee;
                let serializedTx = await this.bitcoinjsService.createNewP2CSTx(
                    this.wallet.Credentials.phrase,
                    pass,
                    this.selectedAmount * 1e8,
                    stakeAddr,
                    ownerAddr,
                    changeAddr,
                    [],
                    satoshiFee,
                    this.credentials
                );
                // Broadcast transaction
                // Popup Success
            } else {
                await this.popupError();
                return;
            }
        }
    }

    public async askPassword(): Promise<string> {
        let pass = await this.popupService.ionicPrompt(
            "common.password",
            "pages.wallet.add.create-password"
        );
        if (pass) return pass;
        return null;
    }

    public async popupError() {
        await this.popupService.ionicAlert(
            "common.error",
            "common.error-wallet"
        );
    }
}
