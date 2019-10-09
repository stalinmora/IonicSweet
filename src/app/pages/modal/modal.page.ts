import { Component, OnInit, Input } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavParams, ModalController } from '@ionic/angular';

const ITEMS_KITS = 'mi_componentes_kits';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {

  @Input() listado: any;
  @Input() productos: any;
  pt: any;
  pts: any;
  txtBuscar: string;
  ptskits: any;


  constructor(
    private storage: Storage,
    private navParams: NavParams,
    private modalCtrl: ModalController
  ) {
    this.pt = navParams.get('listado');
    this.pts = navParams.get('productos');
    console.log(this.pts);
  }

  ngOnInit() {

  }

  Buscar(event) {
    console.log(event);
    this.txtBuscar = event.detail.value;
  }

  Add_Articulos(item: any, unidades: any = 1) {
    console.log('VALOR DE ITEM en Add_Articulos : ', item);
    return this.storage.get(ITEMS_KITS).then((data) => {
      if (data) {
        data.push(item);
        console.log('DATA : Add_Articulos ', data);
        return this.storage.set(ITEMS_KITS, data);
      } else {
        return this.storage.set(ITEMS_KITS, [item]);
      }
    });
  }

  ActualizarArticulos(obj: any, unidades) {
    const data: any[] = [];
    obj.forEach(a => {
      const b = ({
        CODARTKIT: a.CODARTKIT,
        DESCRIPCION: a.DESCRIPCION,
        ESKIT: a.ESKIT,
        LINEAKIT: a.LINEAKIT,
        REFERENCIA: a.REFERENCIA,
        UDSELABORACION: a.UDSELABORACION,
        ULTIMOCOSTE: a.ULTIMOCOSTE,
        UNIDADES : ((a.UNIDADES / a.UDSELABORACION) * unidades),
        UNIDADMEDIDA: a.UNIDADMEDIDA,
        USASTOCKS: a.USASTOCKS
      });
      data.push(b);
    });
    return data;
  }

  async GetComponentes(codarticulo: number, obj: any = null, unidades: any = 1) {
    const a = await this.GetComponentesSQL(codarticulo);
    console.log('VALOR de A : ', a);
    const b = await this.ActualizarArticulos(a, unidades);
    console.log('Luego de Actualizar : ', b);
    if (b.length > 0) {
      for (let i = 0; i < b.length; i++) {
        if (b[i].ESKIT === 'F') {
          console.log('NO ES KIT',b[i]);
          await this.Add_Articulos(b[i],b[i].UNIDADES).then((val) => {
            console.log('Resultado: ', val);
           });
        } else {
          console.log('ES KIT', b[i]);
          await this.GetComponentes(b[i].CODARTKIT,b[i], unidades=b[i].UNIDADES);
        }
      }
    } else {
      console.log('ELSE GETCOMPONENTES',obj);
      await this.Add_Articulos(obj, unidades).then((val) => {
        console.log('RESULTADO INSERT NO : ',val);
      });
    }
  }

  RemovePTS() {
    this.storage.remove('PT_KITS');
  }

  GetItems() {
    return this.storage.get(ITEMS_KITS);
  }

  GetComponentesSQL(codarticulo:number) {
    console.log('Valor del CODARTICULO: ', codarticulo);
    const a = this.pts.filter((item) => {
      return item.CODARTICULO === codarticulo;
    });
    console.log('A GetComponentes : ',a);
    return a;
  }

  dedup_and_sum(arr: any) {
    let map = arr.reduce((prev, next) => {
      if(next.CODARTKIT in prev) {
        prev[next.CODARTKIT].UNIDADES += next.UNIDADES;
      } else {
        prev[next.CODARTKIT] = next;
      }
      return prev;
    }, {});
    return Object.keys(map).map(CODARTKIT => map[CODARTKIT]);
  }

  GetPTKits() {
    this.storage.get('PT_KITS').then((data) => {
      let t = JSON.parse(data);
      this.ptskits = t.pt_item;
    });
  }

  async Calcular(dato: any) {
    console.log('CODARTICULO',dato);
    const a = await this.GetComponentes(dato.CODARTICULO);
    const b = await this.GetItems();
    console.log('Valor de Calcular : ',b);
    b.forEach(a => {
      b.find(v => v.CODARTKIT == a.CODARTKIT).UNIDADES = a.UNIDADES * dato.UNIDADES;
      console.log('DATA CALCULADA DE : ' + a.CODARTKIT + ' UNIDADES : ' + a.UNIDADES);
    });
    console.log('VALOR DE B ACTUALIZADA : ',b);
    const c = await this.dedup_and_sum(b);
    this.storage.ready().then(() => {
      this.storage.remove(ITEMS_KITS).then((data) => {
        console.log('Borrando');
        console.log(data);
        this.SetDataPt(c).then((dat) => {
          console.log('Data Guardada');
          this.GetPTKits();
        });
      }).catch((error) => {
        console.log('Error : ');
        console.log(error);
      });
    });

  }

  SetDataPt(obj: any) {
    return new Promise((resolve, reject) => {
      this.storage.ready().then((data) => {
        // console.log('ARTICULOS :' + obj[0].articulos);
        this.storage.set('PT_KITS', JSON.stringify(
          {
            pt_item : obj
          }
          ));
        resolve(true);
      }).catch((error) => {
        reject(false);
      });
    });
  }

  BtnCerrar() {
    this.GetPTKits();
    this.modalCtrl.dismiss({
      pts: this.pts,
      ptskits: this.ptskits
    });
  }

}
