import { Component, OnInit, Input } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavParams, ModalController, AlertController } from '@ionic/angular';

const addconteo = 'addconteo';

@Component({
  selector: 'app-addunidad',
  templateUrl: './addunidad.page.html',
  styleUrls: ['./addunidad.page.scss'],
})
export class AddunidadPage implements OnInit {

  @Input() listado: any;
  listadoadd: any;
  valores_apertura: any;

  valores: any = [];
  codarticulo: any;
  sum: any = 0;

  constructor(
    private storage: Storage,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    this.listadoadd = navParams.get('listado');
    this.codarticulo = this.listadoadd.CODARTICULO;
    console.log('LISTADO : ', this.listadoadd);
  }

  ngOnInit() {
    this.storage.get(addconteo + this.codarticulo).then((data) => {
      console.log('VALOR DE APERTURA', data);
      this.valores_apertura = data[0];
      this.valores = this.valores_apertura;
      console.log('VALORES LISTA APERTURA', this.valores_apertura);
      console.log('VALORES LISTA ', this.valores);
    });
  }

  BtnCerrar() {
    this.valores.forEach(a => {
      console.log('VALOR DE ITEM', a.txtConteo);
      this.sum = parseFloat(this.sum) + parseFloat(a.txtConteo);
      console.log('VALOR DE SUMA', this.sum);
    });
    this.Limpiar().then(() => {
      this.Add_Articulos(this.valores).then((data) => {
        console.log('RETORNO : ', data);
      });
    });
    this.modalCtrl.dismiss({
      sum : this.sum
    });
  }

  Limpiar() {
    return this.storage.ready().then(() => {
      this.storage.remove(addconteo + this.codarticulo).then((data) => {
        console.log('Borrando');
        console.log(data);
      }).catch((error) => {
        console.log('Error : ');
        console.log(error);
      });
    });
  }

  Add_Articulos(item: any) {
    console.log('VALOR DE ITEM en Add_Articulos : ', item);
    return this.storage.get(addconteo + this.codarticulo).then((data) => {
      if (data) {
        data.push(item);
        console.log('DATA : Add_Articulos ', data);
        return this.storage.set(addconteo + this.codarticulo, data);
      } else {
        return this.storage.set(addconteo + this.codarticulo, [item]);
      }
    });
  }

  async add() {
    console.log('ADD BUTTON');
    const alert = await this.alertCtrl.create({
      header : 'Agregar Conteo',
      animated : true,
      inputs : [{
        name: 'txtConteo',
      }],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirmando Cancelado');
          }
        },
        {
          text: 'OK',
          handler: (data) => {
           this.valores.push(data);
           // this.Add_Articulos(data);
          }
        }
      ]
    });
    console.log('VALORES :', this.valores);
    await alert.present();
  }

  async edit(valor){
    const alert = await this.alertCtrl.create({
      header : 'Editar Conteo',
      animated : true,
      inputs : [{
        name: 'txtConteo',
      }],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirmando Cancelado');
          }
        },
        {
          text: 'OK',
          handler: (data) => {
            const index = this.valores.indexOf(valor);
            console.log('INDEX',index);
            if(index > -1) {
              this.valores[index] = data;
            }
          }
        }
      ]
    });
    console.log('VALORES :', this.valores);
    await alert.present();
  }

  delete(valor){
    const index = this.valores.indexOf(valor);
    console.log('INDEX', index);
    if (index > -1) {
      this.valores.splice(index, 1);
    }
  }

}
