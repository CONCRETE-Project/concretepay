import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { ClipboardPluginWeb, StoragePluginWeb } from "@capacitor/core";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { PAGES } from "./pages/pages";
import { COMPONENTS } from "./components/components";
import { PIPES } from "./pipes/pipes";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HTTP } from "@ionic-native/http/ngx";
import { CommonModule, DecimalPipe } from "@angular/common";
import { DIRECTIVES } from "./directives/directives";
import { QRCodeModule } from "angularx-qrcode";
import { MODALS } from "./modals/modals";
import { ZXingScannerModule } from "@zxing/ngx-scanner";
import { BarcodeScanner } from "@ionic-native/barcode-scanner/ngx";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { createTranslateLoader } from "src/translate-loader";

@NgModule({
    declarations: [
        AppComponent,
        ...PAGES,
        ...COMPONENTS,
        ...PIPES,
        ...DIRECTIVES,
        ...MODALS,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
        }),
        HttpClientModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        QRCodeModule,
        ZXingScannerModule,
    ],
    entryComponents: [...PAGES, ...COMPONENTS, ...MODALS],
    providers: [
        StoragePluginWeb,
        ClipboardPluginWeb,
        HTTP,
        DecimalPipe,
        BarcodeScanner,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
