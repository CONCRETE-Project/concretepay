import { Pipe, PipeTransform } from "@angular/core";
import { RateService } from "../../services/rate/rate.service";
import { DecimalPipe } from "@angular/common";

@Pipe({
    name: "fiatToUnit",
})
export class FiatToUnitPipe implements PipeTransform {
    constructor(
        private rateService: RateService,
        private decimalPipe: DecimalPipe
    ) {}

    async transform(amount: number, coin: string, alternative: string) {
        let amount_ = await this.rateService.fromFiat(
            amount,
            alternative,
            coin.toLowerCase()
        );
        return (
            this.decimalPipe.transform(amount_ / 1e8 || 0, "1.2-8") +
            " " +
            coin.toUpperCase()
        );
    }
}
