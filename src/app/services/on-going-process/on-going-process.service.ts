import { Injectable } from "@angular/core";
import { LoadingController } from "@ionic/angular";

@Injectable({
    providedIn: "root",
})
export class OnGoingProcessService {
    private loading;
    private ongoingProcess;
    constructor(private loadingCtrl: LoadingController) {
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
                message: processName,
            });
        }
        await this.loading.present();
    }
}
