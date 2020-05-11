import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { HomePage } from "./pages/home/home.page";
import { IntroPage } from "./pages/intro/intro.page";
import { CreateWalletsPage } from "./pages/intro/create-wallets/create-wallets.page";
import { WalletReceivePage } from "./pages/wallet/receive/receive.page";
import { WalletSendPage } from "./pages/wallet/send/send.page";
import { WalletDetailsPage } from "./pages/wallet/details/details.page";
import { WalletSettingsPage } from "./pages/wallet/settings/settings.page";
import { WalletHistoryPage } from "./pages/wallet/history/history.page";
import { CoinSettingsPage } from "./pages/wallet/settings/coin-settings/coin-settings.page";
import { WalletNamePage } from "./pages/wallet/settings/name/name.page";
import { WalletColorPage } from "./pages/wallet/settings/color/color.page";
import { WalletInfoPage } from "./pages/wallet/settings/info/info.page";
import { WalletDeletePage } from "./pages/wallet/settings/delete/delete.page";
import { AddWalletPage } from "./pages/wallet/add/add.page";
import { SettingsPage } from "./pages/settings/settings.page";
import { AlternativePage } from "./pages/settings/alternative/alternative.page";

const routes: Routes = [
    { path: "home", component: HomePage },
    { path: "add", component: AddWalletPage },
    // Intro paths
    { path: "intro", component: IntroPage },
    { path: "intro/create", component: CreateWalletsPage },
    // Wallet related paths
    { path: "wallet/:walletid/:coin/send", component: WalletSendPage },
    { path: "wallet/:walletid/:coin/receive", component: WalletReceivePage },
    { path: "wallet/:walletid/:coin/details", component: WalletDetailsPage },
    { path: "wallet/:walletid/settings", component: WalletSettingsPage },
    { path: "wallet/:walletid/settings/name", component: WalletNamePage },
    { path: "wallet/:walletid/settings/color", component: WalletColorPage },
    { path: "wallet/:walletid/settings/info", component: WalletInfoPage },
    { path: "wallet/:walletid/settings/delete", component: WalletDeletePage },
    // Coin Information related paths
    { path: "wallet/:walletid/:coin/settings", component: CoinSettingsPage },
    { path: "wallet/:walletid/:coin/history", component: WalletHistoryPage },
    { path: "settings", component: SettingsPage },
    { path: "settings/alt", component: AlternativePage },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
