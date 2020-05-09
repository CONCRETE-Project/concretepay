import { Injectable } from "@angular/core";
import { StoragePluginWeb } from "@capacitor/core";
import { UserSettingsModel } from "../../../models/user-settings/user-settings";

@Injectable({
    providedIn: "root",
})
export class UserSettingsStorageService {
    public SettingsKey = "UserSettings";

    constructor(private storage: StoragePluginWeb) {}

    async getAll() {
        let settings = await this.storage.get({ key: this.SettingsKey });
        let userSettings: UserSettingsModel = JSON.parse(settings.value);
        return userSettings;
    }

    async setAll(UserSettings: UserSettingsModel) {
        await this.storage.set({
            key: this.SettingsKey,
            value: JSON.stringify(UserSettings),
        });
        return;
    }

    async get(prop): Promise<any> {
        let userSettings = await this.getAll();
        return userSettings[prop];
    }

    async set(prop, value): Promise<any> {
        let userSettings = await this.getAll();
        userSettings[prop] = value;
        await this.setAll(userSettings);
    }
}
