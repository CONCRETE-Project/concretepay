import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: "app-receiver-info",
    templateUrl: "./receiver-info.component.html",
    styleUrls: ["./receiver-info.component.scss"],
})
export class ReceiverInfoComponent implements OnInit {
    @Input() address: string;
    @Input() label: string;
    @Input() message: string;

    constructor() {}

    ngOnInit() {}
}
