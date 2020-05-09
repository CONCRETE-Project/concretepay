import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoinCredentials, Wallet } from "../../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../../services/storage/wallet/wallet.service";
import { NavController, ModalController } from "@ionic/angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PopupService } from "../../../../services/popup/popup.service";

@Component({
    selector: "app-blockbook",
    templateUrl: "./blockbook.page.html",
    styleUrls: ["./blockbook.page.scss"],
})
export class BlockbookPage implements OnInit, OnDestroy {
    wallet: Wallet;
    paramsSub: Subscription;
    credentials: CoinCredentials;
    walletBlockbook: string;
    walletBlockbookForm: FormGroup;
    description: string;
    index;
    coin: any;
    coinName: any;
    blockbook: string;

    constructor(
        public modalCtrl: ModalController,
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService,
        public navController: NavController,
        public popupService: PopupService,
        private formBuilder: FormBuilder
    ) {
        this.walletBlockbookForm = this.formBuilder.group({
            walletBlockbook: [
                "",
                Validators.compose([
                    Validators.minLength(1),
                    Validators.required,
                ]),
            ],
        });
    }

    async ngOnInit() {
        await this.init();
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }

    async init() {
        this.paramsSub = this.route.paramMap.subscribe(async (params) => {
            let walletId = params.get("walletid");
            this.coin = params.get("coin");
            this.blockbook = params.get("blockbook");
            this.wallet = await this.walletServiceStorage.get(
                "wallet-" + walletId
            );
            this.credentials = this.wallet.Credentials.wallet;
            this.blockbook = this.credentials.Blockbook;
        });
    }

    public async save() {
        try {
            let valid = await this.walletServiceStorage.validateBlockbookLink(
                this.wallet,
                this.coin,
                this.walletBlockbookForm.value.walletBlockbook
            );
            if (!valid) {
                await this.popupService.ionicAlert("Invalid Blockbook URL");
            }

            await this.walletServiceStorage.updateCredentials(
                this.wallet,
                this.coin,
                this.walletBlockbookForm.value.walletBlockbook
                // https://btc2.trezor.io
            );
            await this.navController.navigateRoot("/home", {
                animationDirection: "back",
                animated: true,
            });
        } catch (e) {
            await this.popupService.ionicAlert(
                "Error: ",
                "Unable to change Blockbook url for " + this.coin
            );
        }
    }

    async closeModal() {
        await this.modalCtrl.dismiss();
    }

    public async showResetAlert() {
        let clearData = await this.popupService.ionicConfirm(
            "Clear User Data",
            "Are you sure you want to reset the endpoint link? This action cannot be unchanged.",
            "Yes",
            "No"
        );
        if (clearData) {
            await this.walletServiceStorage.resetBlockbookLink(
                this.wallet,
                this.coin
            );
            await this.closeModal();
        } else {
            this.closeModal();
        }
    }
}
