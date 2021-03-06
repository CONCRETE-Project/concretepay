import { Component, Input, OnInit } from "@angular/core";
import { ExternalLinkService } from "../../services/external-link/external-link.service";
import { PlatformService } from "../../services/platform/platform.service";
import { ClipboardPluginWeb } from "@capacitor/core";
import { CoinCredentials, Tx } from "../../models/wallet/wallet";
import { TxDetailsModalInput } from "../../models/modals/tx-details";
import { ModalService } from "../../services/modal/modal.service";
import { CoinFactory } from "src/app/models/coin-factory/coin-factory";

@Component({
    selector: "app-tx-history",
    templateUrl: "./tx-history.component.html",
    styleUrls: ["./tx-history.component.scss"],
})
export class TxHistoryComponent implements OnInit {
    @Input() txs: Tx;
    @Input() coin;
    @Input() credentials: CoinCredentials;

    public isReceived: boolean;
    public isSent: boolean;
    public isConfirmed: boolean;
    public isContract: boolean;
    public isContractReward: boolean;
    public Inputs = [];
    public Outputs = [];
    public Amount: number;
    public StakeAmount: number;
    public fee: number;
    constructor(
        public externalLinkService: ExternalLinkService,
        public clipboard: ClipboardPluginWeb,
        public platform: PlatformService,
        public modalService: ModalService
    ) {}

    ngOnInit() {
        this.Amount = 0;
        this.StakeAmount = 0;
        this.isConfirmed = this.txs.confirmations > 0;
        this.isContractReward = this.txs.reward;
        this.Inputs = this.txs.inputs;
        this.Outputs = this.txs.outputs;
        this.fee = this.txs.fee;
        this.parseOutputs();
        this.parseInputs();
        this.Amount = this.isSent
            ? Math.abs(this.Amount) - this.fee
            : Math.abs(this.Amount);
    }

    parseInputs() {
        if (this.Inputs.length > 0) {
            this.isSent = true;
            for (let i = 0; i < this.Inputs.length; i++) {
                let input = this.Inputs[i];
                if (!this.isReceived) {
                    this.Amount -= input.value;
                }
            }
        }
    }

    parseOutputs() {
        if (this.Outputs.length > 0) {
            let notChangeAddr = this.Outputs.filter(
                (outputs) => !outputs.ischange
            );
            let stakeAddr = this.Outputs.filter((outputs) => outputs.isstake);
            this.isReceived = notChangeAddr.length > 0;
            this.isContract = stakeAddr.length > 0;
            for (let i = 0; i < this.Outputs.length; i++) {
                let output = this.Outputs[i];
                if (output.isstake) {
                    this.StakeAmount += output.stakedvalue;
                } else {
                    this.Amount += output.value;
                }
            }
        }
    }

    public async goToTxDetails(txs, coin) {
        if (this.isConfirmed) {
            let modalInput: TxDetailsModalInput = {
                txid: txs.txid,
                coin,
                sent: this.isSent,
                contract: this.isContract,
                received: this.isReceived,
                reward: this.isContractReward,
                reward_amount: this.txs.rewardAmount,
                confirmed: this.isConfirmed,
                amount: this.Amount,
                credentials: this.credentials,
                fee: this.fee,
                type: txs.type,
                stakeAmount: this.StakeAmount,
            };
            await this.modalService.txDetailsModal(modalInput);
        } else {
            this.viewOnBlockchain();
        }
    }

    public async viewOnBlockchain() {
        let coinConf = CoinFactory.getCoin(this.credentials.Coin);
        let url = coinConf.blockbook + "/tx/" + this.txs.txid;
        await this.externalLinkService.open(url);
    }
}
