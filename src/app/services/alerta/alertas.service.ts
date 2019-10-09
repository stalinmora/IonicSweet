import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertasService {

  constructor(
    private alertCtrl: AlertController
  ) { }

  async ShowMensaje(subtitulos: string) {
    const alert = await this.alertCtrl.create({
      header: 'Mensaje',
      subHeader: subtitulos,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
            alert.dismiss(false);
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            alert.dismiss(true);
          }
        }
      ]
    });
    return alert.present();
  }
}
