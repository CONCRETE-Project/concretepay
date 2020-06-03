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
import { OnGoingProcessService } from "src/app/services/on-going-process/on-going-process.service";
import { WalletService } from "src/app/services/wallet/wallet.service";
import { ModalService } from "src/app/services/modal/modal.service";

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
    availableBalance: number;
    constructor(
        private route: ActivatedRoute,
        public walletStorageService: WalletStorageService,
        public bitcoinjsService: BitcoinjsService,
        public blockbookService: BlockbookService,
        public modalService: ModalService,
        public coinsService: CoinsService,
        private popupService: PopupService,
        private onGoingProcessService: OnGoingProcessService,
        private walletService: WalletService
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
            this.availableBalance =
                this.credentials.Balance.Confirmed -
                this.credentials.Balance.Locked;
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
            let passResponse = await this.modalService.passWordModal();
            if (!passResponse.success) return;
            let pass;
            if (!passResponse.password) {
                pass = "empty";
            } else {
                pass = passResponse.password;
            }
            let hash = sha("sha256").update(pass);
            if (this.wallet.Credentials.passhash === hash.digest("hex")) {
                await this.onGoingProcessService.set("common.loading");
                // Get Stake Addr
                let stakeAddr = await this.coinsService.getStakeAddress(
                    this.credentials.Coin
                );
                // Get Change Addr
                let changeAddr = await this.walletService.createAddress(
                    this.credentials,
                    this.credentials.Derivations.P2PKH,
                    "Change"
                );
                // Get Onwer Addr
                let ownerAddr = await this.walletService.createAddress(
                    this.credentials,
                    this.credentials.Derivations.P2PKH,
                    "Direct"
                );
                // Get Utxos
                let utxos = await this.blockbookService.getUtxos(
                    this.credentials
                );
                utxos = utxos.filter((utxo) => !utxo.stake_contract);
                // Get Fee
                let satoshiFee = await (
                    await this.blockbookService.getFeeRate(this.credentials)
                ).fast;
                try {
                    let serializedTx = await this.bitcoinjsService.createNewP2CSTx(
                        this.wallet.Credentials.phrase,
                        pass,
                        this.selectedAmount * 1e8,
                        stakeAddr,
                        ownerAddr,
                        changeAddr,
                        utxos,
                        satoshiFee,
                        this.credentials
                    );
                    await this.blockbookService.sendTx(
                        this.credentials,
                        serializedTx
                    );
                    this.onGoingProcessService.clear();
                    await this.popupService.ionicAlert(
                        "common.success",
                        "pages.wallet.stake.success"
                    );
                } catch (e) {
                    this.onGoingProcessService.clear();
                    await this.popupService.ionicAlert(
                        "common.error",
                        "pages.wallet.stake.error"
                    );
                }
            } else {
                await this.popupError();
                return;
            }
        }
    }

    public async popupError() {
        await this.popupService.ionicAlert(
            "common.error",
            "common.error-wallet"
        );
    }
}
