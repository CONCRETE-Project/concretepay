import { Injectable } from "@angular/core";
import { LoadingController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: "root",
})
export class OnGoingProcessService {
    private loading;
    private ongoingProcess;
    constructor(
        private loadingCtrl: LoadingController,
        private translateService: TranslateService
    ) {
        this.ongoingProcess = [];
    }

    public clear() {
        this.ongoingProcess = [];
        this.loading.dismiss();
        this.loading = null;
    }

    public async set(processName: string) {
        this.ongoingProcess.push(processName);
        if (!this.loading) {
            this.loading = await this.loadingCtrl.create({
                message: await this.translateService
                    .get(processName)
                    .toPromise(),
            });
        }
        await this.loading.present();
    }
}
