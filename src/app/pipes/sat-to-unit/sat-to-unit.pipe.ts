import { Pipe, PipeTransform } from "@angular/core";
import { DecimalPipe } from "@angular/common";

@Pipe({
    name: "satToUnit",
})
export class SatToUnitPipe implements PipeTransform {
    constructor(private decimalPipe: DecimalPipe) {}
    transform(amount: number, coin: string) {
        return (
            this.decimalPipe.transform(amount / 1e8, "1.0-8") +
            " " +
            coin.toUpperCase()
        );
    }
}
