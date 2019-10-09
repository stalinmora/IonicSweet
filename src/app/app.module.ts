import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, AlertController, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { File } from '@ionic-native/file/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { ModalPage } from './pages/modal/modal.page';
import { PipesModule } from './pipes/pipes.module';
import { DatePipe } from '@angular/common';
import { AddunidadPage } from './pages/addunidad/addunidad.page';

@NgModule({
  declarations: [AppComponent, ModalPage, AddunidadPage],
  entryComponents: [ModalPage, AddunidadPage],
  imports: [BrowserModule, FormsModule, PipesModule, IonicModule.forRoot(), AppRoutingModule, IonicStorageModule.forRoot()],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, File, AlertController, DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
