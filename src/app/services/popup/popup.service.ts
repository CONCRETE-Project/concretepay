import { Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular";

@Injectable({
    providedIn: "root",
})
export class PopupService {
    constructor(private alertCtrl: AlertController) {}

    public ionicAlert(
        title: string,
        subTitle?: string,
        okText?: string
    ): Promise<any> {
        return new Promise(async (resolve) => {
            let alert = await this.alertCtrl.create({
                header: title,
                subHeader: subTitle,
                backdropDismiss: false,
                buttons: [
                    {
                        text: okText ? okText : "Ok",
                        handler: () => {
                            resolve();
                        },
                    },
                ],
            });
            await alert.present();
        });
    }

    public ionicConfirm(
        title: string,
        message: string,
        okText?: string,
        cancelText?: string
    ): Promise<any> {
        return new Promise(async (resolve) => {
            let confirm = await this.alertCtrl.create({
                header: title,
                message,
                buttons: [
                    {
                        text: cancelText ? cancelText : "Cancel",
                        handler: () => {
                            resolve(false);
                        },
                    },
                    {
                        text: okText ? okText : "Ok",
                        handler: () => {
                            resolve(true);
                        },
                    },
                ],
                backdropDismiss: false,
            });
            await confirm.present();
        });
    }

    public ionicPrompt(
        title: string,
        message: string,
        opts?,
        okText?: string,
        cancelText?: string
    ): Promise<any> {
        return new Promise(async (resolve) => {
            let defaultText =
                opts && opts.defaultText ? opts.defaultText : null;
            let placeholder =
                opts && opts.placeholder ? opts.placeholder : null;
            let inputType = opts && opts.type ? opts.type : "text";
            let enableBackdropDismiss = !!(opts && opts.enableBackdropDismiss);
            let prompt = await this.alertCtrl.create({
                header: title,
                message,
                backdropDismiss: enableBackdropDismiss,
                inputs: [
                    {
                        value: defaultText,
                        placeholder,
                        type: inputType,
                    },
                ],
                buttons: [
                    {
                        text: cancelText ? cancelText : "Cancel",
                        handler: () => {
                            resolve(null);
                        },
                    },
                    {
                        text: okText ? okText : "Ok",
                        handler: (data) => {
                            resolve(data[0]);
                        },
                    },
                ],
            });
            await prompt.present();
        });
    }

    public ionicPromptInputs(
        title: string,
        message: string,
        inputs,
        opts?,
        okText?: string,
        cancelText?: string
    ): Promise<any> {
        return new Promise(async (resolve) => {
            let enableBackdropDismiss = !!(opts && opts.enableBackdropDismiss);
            let prompt = await this.alertCtrl.create({
                header: title,
                message,
                backdropDismiss: enableBackdropDismiss,
                inputs,
                buttons: [
                    {
                        text: cancelText ? cancelText : "Cancel",
                        handler: () => {
                            resolve(null);
                        },
                    },
                    {
                        text: okText ? okText : "Ok",
                        handler: (data) => {
                            resolve(data);
                        },
                    },
                ],
            });
            await prompt.present();
        });
    }
}
