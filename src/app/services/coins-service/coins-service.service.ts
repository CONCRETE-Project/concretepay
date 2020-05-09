import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { PlatformService } from "../platform/platform.service";
import { UserSettingsStorageService } from "../storage/user-settings/user-settings.service";
import {
    CoinsServiceResponse,
    CoinsServiceRequest,
    BaseResponse,
} from "src/app/models/coins-service/coins-service";
import { CoinData } from "src/app/models/coin/coin";

@Injectable({
    providedIn: "root",
})
export class CoinsService {
    public url = "http://localhost:8080";

    constructor(
        private http: HttpClient,
        private platformService: PlatformService,
        private userSettingsStorageService: UserSettingsStorageService
    ) {}

    async getCoins(): Promise<CoinsServiceResponse> {
        let reqBody: CoinsServiceRequest = {
            version: this.platformService.version,
        };
        let res = await this.http
            .post<BaseResponse>(this.url + "coins", reqBody)
            .toPromise();
        return res.data;
    }

    async getCoinInfo(tag: string): Promise<CoinData> {
        try {
            let res = await this.http
                .get<BaseResponse>(this.url + "coin/" + tag)
                .toPromise();
            return res.data;
        } catch (e) {
            return null;
        }
    }
}
