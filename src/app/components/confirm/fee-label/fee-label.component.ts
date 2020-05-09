import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FeeRates } from "../../../models/blockbook/blockbook";

@Component({
    selector: "app-fee-label",
    templateUrl: "./fee-label.component.html",
    styleUrls: ["./fee-label.component.scss"],
})
export class FeeLabelComponent implements OnInit {
    @Input() coin: string;
    @Input() alternative: string;
    @Input() fee: FeeRates;
    @Output() feeSelected = new EventEmitter<string>();
    selected: boolean;

    constructor() {}

    ngOnInit() {
        this.selected = false;
    }

    selectedFee() {
        this.selected = true;
    }

    setFeeSpeed(speed: string) {
        this.feeSelected.next(speed);
        this.selectedFee();
    }
}
