import { ToolBarComponent } from "./tool-bar/tool-bar.component";
import { WalletComponent } from "./wallet/wallet.component";
import { CoinInfoComponent } from "./wallet/coin-info/coin-info.component";
import { TxHistoryComponent } from "./tx-history/tx-history.component";
import { FeeLabelComponent } from "./confirm/fee-label/fee-label.component";
import { ReceiverInfoComponent } from "./confirm/receiver-info/receiver-info.component";

export const COMPONENTS = [
    FeeLabelComponent,
    ReceiverInfoComponent,
    ToolBarComponent,
    WalletComponent,
    CoinInfoComponent,
    TxHistoryComponent,
];
