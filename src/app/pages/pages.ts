import { HomePage } from "./home/home.page";
import { CreateWalletsPage } from "./intro/create-wallets/create-wallets.page";
import { IntroPage } from "./intro/intro.page";
import { WalletDetailsPage } from "./wallet/details/details.page";
import { WalletReceivePage } from "./wallet/receive/receive.page";
import { WalletSendPage } from "./wallet/send/send.page";
import { WalletSettingsPage } from "./wallet/settings/settings.page";
import { WalletHistoryPage } from "./wallet/history/history.page";
import { SettingsPage } from "./settings/settings.page";
import { AlternativePage } from "./settings/alternative/alternative.page";
import { CoinSettingsPage } from "./wallet/settings/coin-settings/coin-settings.page";
import { WalletNamePage } from "./wallet/settings/name/name.page";
import { WalletInfoPage } from "./wallet/settings/info/info.page";
import { WalletColorPage } from "./wallet/settings/color/color.page";
import { WalletDeletePage } from "./wallet/settings/delete/delete.page";
import { AddWalletPage } from "./wallet/add/add.page";
import { PIN_PAGES } from "./pin/pin";
import { WalletStakePage } from "./wallet/stake/stake.page";

export const PAGES = [
    ...PIN_PAGES,
    HomePage,
    CreateWalletsPage,
    IntroPage,
    WalletDetailsPage,
    WalletReceivePage,
    WalletSendPage,
    WalletSettingsPage,
    WalletHistoryPage,
    SettingsPage,
    AlternativePage,
    CoinSettingsPage,
    WalletNamePage,
    WalletInfoPage,
    WalletColorPage,
    WalletDeletePage,
    AddWalletPage,
    WalletStakePage,
];
