import { Component, Output } from "@angular/core";
import { Observable, Subject } from "rxjs";

export interface PinButton {
    value: string;
    letters: string;
}

@Component({
    selector: "app-pin-pad",
    templateUrl: "pin-pad.page.html",
    styleUrls: ["pin-pad.page.scss"],
})
export class PinPadPage {
    keystrokeSubject: Subject<string> = new Subject<string>();
    @Output()
    keystroke: Observable<string> = this.keystrokeSubject.asObservable();
    public buttonRows: PinButton[][] = [
        [
            {
                value: "1",
                letters: "",
            },
            {
                value: "2",
                letters: "ABC",
            },
            {
                value: "3",
                letters: "DEF",
            },
        ],
        [
            {
                value: "4",
                letters: "GHI",
            },
            {
                value: "5",
                letters: "JKL",
            },
            {
                value: "6",
                letters: "MNO",
            },
        ],
        [
            {
                value: "7",
                letters: "PQRS",
            },
            {
                value: "8",
                letters: "TUV",
            },
            {
                value: "9",
                letters: "WXYZ",
            },
        ],
        [
            {
                value: ".",
                letters: "",
            },
            {
                value: "0",
                letters: "",
            },
            {
                value: "delete",
                letters: "",
            },
        ],
    ];
    public onKeystroke(value: string): void {
        this.keystrokeSubject.next(value);
    }
}
