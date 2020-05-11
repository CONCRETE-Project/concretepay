import { Injectable } from "@angular/core";
import { AddressValidationModel } from "../../models/validations/address-validation";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";

@Injectable({
    providedIn: "root",
})
export class AddressValidatorService {
    constructor() {}

    validateAddress(address, Coin) {
        try {
            let coinConfig = CoinFactory.getCoin(Coin);
            let valid = coinConfig.validateAddress(address);
            return { valid, coin: Coin };
        } catch (e) {
            return { valid: false, coin: null };
        }
    }

    validateURI(uri): AddressValidationModel {
        try {
            let splitCoinAddress = uri.split(":");
            let coin = splitCoinAddress[0];
            let coinConfig = CoinFactory.getCoin(coin);
            let splitAddressParams = splitCoinAddress[1].split("?");
            let address = splitAddressParams[0];
            let params = splitAddressParams[1]
                ? splitAddressParams[1].split("&")
                : null;
            let amountParam, labelParam, messageParam, privKeyParams;
            if (params) {
                amountParam = params.find((param) => {
                    let splitParam = param.split("=");
                    if (splitParam[0] === "amount") {
                        return param;
                    }
                    return null;
                });

                privKeyParams = params.find((param) => {
                    let splitParam = param.split("=");
                    if (splitParam[0] === "privkey") {
                        return param;
                    }
                    return null;
                });

                labelParam = params.find((param) => {
                    let splitParam = param.split("=");
                    if (splitParam[0] === "label") {
                        return param;
                    }
                    return null;
                });

                messageParam = params.find((param) => {
                    let splitParam = param.split("=");
                    if (splitParam[0] === "message") {
                        return param;
                    }
                    return null;
                });
            }
            let parsedParams = {
                amount: amountParam
                    ? parseFloat(amountParam.split("=")[1]) * 1e8
                    : null,
                message: messageParam ? messageParam.split("=")[1] : null,
                label: labelParam
                    ? labelParam.split("=")[1].split("%20").join(" ")
                    : null,
                privkey: privKeyParams
                    ? privKeyParams.split("=")[1] === "true"
                    : false,
            };
            let valid;
            if (parsedParams.privkey) {
                // Asume privkey is valid
                valid = true;
            } else {
                valid = coinConfig.validateAddress(address);
            }
            return {
                success: valid,
                address,
                coin,
                amount: parsedParams.amount,
                message: parsedParams.message,
                label: parsedParams.label,
            };
        } catch (e) {
            return {
                success: false,
                address: null,
                coin: null,
                amount: null,
                message: null,
                label: null,
            };
        }
    }
}
