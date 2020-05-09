import { Component, OnDestroy, OnInit } from "@angular/core";
import { AddressValidatorService } from "../../../services/address-validator/address-validator.service";
import { CoinCredentials, Wallet } from "../../../models/wallet/wallet";
import { ActivatedRoute } from "@angular/router";
import { WalletStorageService } from "../../../services/storage/wallet/wallet.service";
import { Subscription } from "rxjs";
import { UserSettingsStorageService } from "../../../services/storage/user-settings/user-settings.service";
import { ConfirmModalInput } from "../../../models/modals/confirm";
import { AddressValidationModel } from "../../../models/validations/address-validation";
import { ModalService } from "../../../services/modal/modal.service";

@Component({
    selector: "app-send",
    templateUrl: "./send.page.html",
    styleUrls: ["./send.page.scss"],
})
export class WalletSendPage implements OnInit, OnDestroy {
    public search = "";
    public invalidAddress: boolean;
    wallet: Wallet;
    credentials: CoinCredentials;
    AlternativeCoin;
    paramsSub: Subscription;

    constructor(
        public addressValidator: AddressValidatorService,
        private route: ActivatedRoute,
        public walletStorageService: WalletStorageService,
        public userSettingsStorage: UserSettingsStorageService,
        public modalService: ModalService
    ) {}

    ngOnInit() {
        this.getAlternative();
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
            this.credentials = this.wallet.Credentials.wallet;
        });
    }

    public async processInput() {
        await this.isAddressValid(this.search);
    }

    private async isAddressValid(address: string) {
        let uriValidator = this.addressValidator.validateURI(address);
        let addressValidator = this.addressValidator.validateAddress(
            address,
            this.credentials.Coin
        );
        if (uriValidator.success) {
            await this.processPaymentUri(uriValidator);
        } else if (addressValidator.valid) {
            await this.processPayment(address);
        } else {
            this.invalidAddress = true;
        }
    }

    private async processPayment(address: string) {
        let amount = await this.modalService.amountModal({
            coin: this.credentials.Coin,
            alternative: this.AlternativeCoin,
        });
        if (amount.success) {
            let paymentProps: ConfirmModalInput = {
                wallet: this.wallet,
                payment: { address, amount: amount.amount },
                useSendMax: amount.useSendMax,
                coin: this.credentials.Coin,
                credentials: this.credentials,
                alternative: this.AlternativeCoin,
            };
            let confirmModalResponse = await this.modalService.confirmModal(
                paymentProps
            );
            let finalMsg = confirmModalResponse.success
                ? "Your transaction is successfully send"
                : confirmModalResponse.canceled
                ? "Your transaction was canceled"
                : "Your transaction failed, please try again or contact support";
            await this.modalService.finishModal({
                success: confirmModalResponse.success,
                canceled: confirmModalResponse.canceled,
                message: finalMsg,
            });
        }
    }

    private async processPaymentUri(uriValidator: AddressValidationModel) {
        let amount;
        let useSendMax = false;
        if (!uriValidator.amount) {
            let amountResponse = await this.modalService.amountModal({
                coin: this.credentials.Coin,
                alternative: this.AlternativeCoin,
            });
            if (amountResponse.success) {
                amount = amountResponse.amount;
                useSendMax = amountResponse.useSendMax;
            } else {
                return;
            }
        } else {
            amount = uriValidator.amount;
        }
        let paymentProps: ConfirmModalInput = {
            wallet: this.wallet,
            payment: {
                address: uriValidator.address,
                label: uriValidator.label,
                message: uriValidator.message,
                amount,
            },
            useSendMax,
            coin: this.credentials.Coin,
            credentials: this.credentials,
            alternative: this.AlternativeCoin,
        };
        let confirmModalResponse = await this.modalService.confirmModal(
            paymentProps
        );
        let finalMsg = confirmModalResponse.success
            ? "Your transaction is successfully send"
            : confirmModalResponse.canceled
            ? "Your transaction was canceled"
            : "Your transaction failed, please try again or contact support";
        await this.modalService.finishModal({
            success: confirmModalResponse.success,
            canceled: confirmModalResponse.canceled,
            message: finalMsg,
        });
    }

    public async openScanner() {
        let scanResp = await this.modalService.scanModal();
        this.isAddressValid(scanResp.data);
    }

    public getAlternative() {
        this.userSettingsStorage.get("alt_coin").then((AltObj: any) => {
            this.AlternativeCoin = AltObj.code;
        });
    }
}
