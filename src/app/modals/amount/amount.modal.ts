import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
    selector: "app-amount",
    templateUrl: "./amount.modal.html",
    styleUrls: ["./amount.modal.scss"],
})
export class AmountModal implements OnInit {
    @Input()
    coin;
    @Input()
    alternative;

    isFiat: boolean;
    selectedCurrency: string;
    satoshiAmount: number;
    fiatAmount: number;
    selectedAmount: number;
    selectedAmountStr = "";
    useSendMax: boolean;
    constructor(public modalCtrl: ModalController) {}

    async dismissModal() {
        await this.modalCtrl.dismiss({
            success: true,
            amount: parseInt(this.satoshiAmount.toFixed(0), 10),
            useSendMax: this.useSendMax,
        });
    }

    ngOnInit() {
        this.useSendMax = false;
        this.isFiat = false;
        this.selectedCurrency = this.coin;
        this.satoshiAmount = 0;
        this.fiatAmount = 0;
    }

    async toggleCurrency() {
        if (this.isFiat) {
            this.selectedCurrency = this.coin;
            this.isFiat = false;
        } else {
            this.selectedCurrency = this.alternative;
            this.isFiat = true;
        }
    }

    async closeModal() {
        await this.modalCtrl.dismiss({ success: false });
    }

    public async pushDigit(digit: string) {
        if (digit === "send-max") {
            this.useSendMax = true;
            await this.dismissModal();
        }
        if (digit === "delete") {
            if (
                this.selectedAmountStr.length === 1 ||
                this.selectedAmountStr.length === 0
            ) {
                this.selectedAmountStr = "0";
            } else {
                this.selectedAmountStr = this.selectedAmountStr.slice(0, -1);
            }
        } else {
            if (!isNaN(Number(this.selectedAmountStr + digit))) {
                this.selectedAmountStr += digit;
            } else if (this.selectedAmountStr === "" && digit === ".") {
                this.selectedAmountStr = "0.";
            }
        }
        // if (this.isFiat) {
        //     this.fiatAmount = parseFloat(this.selectedAmountStr);
        //     this.satoshiAmount = await this.rateService.fromFiat(
        //         this.fiatAmount,
        //         this.alternative,
        //         this.coin
        //     );
        // } else {
        this.satoshiAmount = parseFloat(this.selectedAmountStr) * 1e8;
        //this.fiatAmount = await this.rateService.toFiat(
        //    this.satoshiAmount,
        //    this.alternative,
        //    this.coin
        //);
        // }
    }
}
