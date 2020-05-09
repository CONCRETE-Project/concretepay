import { Pipe, PipeTransform } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { RateService } from "../../services/rate/rate.service";

@Pipe({
    name: "satToFiat",
})
export class SatToFiatPipe implements PipeTransform {
    constructor(
        public rateService: RateService,
        public decimalPipe: DecimalPipe
    ) {}
    async transform(
        amount: number,
        coin: string,
        alternative: string
    ): Promise<any> {
        if (alternative) {
            if (amount === 0) {
                return (
                    this.decimalPipe.transform(0 || 0, "1.2-2") +
                    " " +
                    alternative
                );
            }
            let rateAmount = await this.rateService.toFiat(
                amount,
                alternative,
                coin.toLowerCase()
            );
            if (!rateAmount) {
                return "Loading...";
            }
            if (alternative === "BTC") {
                return rateAmount + alternative;
            }
            return (
                this.decimalPipe.transform(rateAmount || 0, "1.2-2") +
                " " +
                alternative
            );
        } else {
            return "Loading...";
        }
    }
}
