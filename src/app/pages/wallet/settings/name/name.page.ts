import { Component, OnDestroy, OnInit } from "@angular/core";
import { Wallet } from "../../../../models/wallet/wallet";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../../services/storage/wallet/wallet.service";
import { NavController } from "@ionic/angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PopupService } from "../../../../services/popup/popup.service";

@Component({
    selector: "app-name",
    templateUrl: "./name.page.html",
    styleUrls: ["./name.page.scss"],
})
export class WalletNamePage implements OnInit, OnDestroy {
    wallet: Wallet;
    paramsSub: Subscription;
    walletName: string;
    walletNameForm: FormGroup;
    description: string;

    constructor(
        private route: ActivatedRoute,
        public walletServiceStorage: WalletStorageService,
        public navController: NavController,
        public popupService: PopupService,
        private formBuilder: FormBuilder
    ) {
        this.walletNameForm = this.formBuilder.group({
            walletName: [
                "",
                Validators.compose([
                    Validators.minLength(1),
                    Validators.required,
                ]),
            ],
        });
    }

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

    public async save() {
        try {
            await this.walletServiceStorage.update(
                this.wallet,
                "name",
                this.walletNameForm.value.walletName
            );
            await this.navController.navigateRoot("/home", {
                animationDirection: "back",
                animated: true,
            });
        } catch (e) {
            await this.popupService.ionicAlert(
                "Error: ",
                "Unable to rename wallet: " + e
            );
        }
    }
}
