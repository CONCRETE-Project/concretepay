import { Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
    selector: "app-password",
    templateUrl: "./password.modal.html",
    styleUrls: ["./password.modal.scss"],
})
export class PasswordModal {
    @Input() confirm: boolean;
    passwordForm: FormGroup;
    constructor(private modalCtrl: ModalController) {
        this.passwordForm = new FormGroup({
            password: new FormControl(),
        });
    }

    passwordType: string = "password";
    passwordIcon: string = "eye-off";

    hideShowPassword() {
        this.passwordType = this.passwordType === "text" ? "password" : "text";
        this.passwordIcon = this.passwordIcon === "eye-off" ? "eye" : "eye-off";
    }

    async close(success: boolean, password: string) {
        await this.modalCtrl.dismiss({ success: success, password: password });
    }
}
