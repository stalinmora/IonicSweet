import { Component, OnInit, ViewChild, Input, Pipe } from '@angular/core';
import { AlertController, ModalController, IonSearchbar } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local/data-local.service';
import { AlertasService } from '../../services/alerta/alertas.service';
import { Storage } from '@ionic/storage';
import { PagerService } from '../../services/pager/pager.service';
import { ModalPage } from '../modal/modal.page';
import { DatePipe } from '@angular/common';
import { AddunidadPage } from '../addunidad/addunidad.page';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  @ViewChild('txtBusqueda', {static: true}) txtBusqueda : IonSearchbar;

  txtFecha: any;
  isBtnCargar: boolean = false;
  isDisabled: boolean = true;
  isBusquedaTexto: boolean = true;
  establecimientos: any;
  idEstablecimiento: any;
  regularizacion: any;
  regularizacionAPP: any;
  secciones: any;
  pts: any;
  pt: any;
  articulos: any;
  ptkits: any;
  idBusqueda: any;
  Busqueda: any;
  isBusqueda: any;
  subgrupocontables: any;
  isSeccion: any;
  regularizacioncopia: any;
  txtBuscar: string;

  pager: any = {};

  // paged items
  pagedItems: any[];

  constructor(
    private alertCtrl: AlertController,
    private datalocal: DataLocalService,
    private alertas: AlertasService,
    private storage: Storage,
    private pagerService: PagerService,
    private modalCtrl: ModalController,
    public datepipe: DatePipe,
  ) {
    this.storage.get('PARAMETROS').then((val) => {
          console.log('DATA PARAM : ' + JSON.stringify(val));
          if (JSON.stringify(val) === null) {
            this.isBtnCargar = false;
          } else {
            const t = JSON.parse(val);
            this.idEstablecimiento = t.CODALMACEN;
            this.isBtnCargar = true;
            this.VerificarDataInicial();
          }
        });
   }

  LeerData() {
    return new Promise((resolve, reject) => {
      this.storage.get('USER').then((val) => {
        const T = JSON.parse(val);
        console.log(T);
        this.establecimientos = T.almacenes;
        this.pts = T.pts;
        this.pt = T.pt;
        this.articulos = T.articulos;
        this.regularizacion = T.regularizaciones;
        this.secciones = T.secciones;
        this.subgrupocontables = T.subgrupocontable;
        //this.regularizacion.sort((a, b) => a.DESCRIPCION > b.DESCRIPCION);
        resolve(true);
      }).catch((error) => {
        reject(false);
      });
    });
  }

  async btnDeleteData() {
    const alert = await this.alertCtrl.create({
      header : 'Eliminar ',
      subHeader : 'Se eliminara Data.?',
      animated : true,
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
            this.datalocal.CerrarSesion();
          }
        }
      ]
    });
    await alert.present();
  }

  radioGroupChange(event) {
    console.log('radioGroupChange', event.detail);
    console.log('SECCIONES', this.secciones);
    this.isBusqueda = false;
    if(event.detail.value === 'all') {
      this.isBusqueda = true;
      this.regularizacionAPP = this.regularizacioncopia;
      this.isBusquedaTexto = false;
      this.setPage(1);
    } else if (event.detail.value === 'secciones') {
      console.log('ENTRO A SECCIONES');
      this.txtBusqueda.value = '';
      this.Busqueda = this.secciones;
      this.regularizacionAPP = this.regularizacioncopia;
      this.isSeccion = 1;
      this.isBusquedaTexto = true;
      this.setPage(1);
    } else if (event.detail.value === 'sub_contable') {
      console.log('NO ENTRO AL IF RADIO');
      this.txtBusqueda.value = '';
      this.isSeccion = 2;
      this.Busqueda = this.subgrupocontables;
      this.regularizacionAPP = this.regularizacioncopia;
      this.isBusquedaTexto = true;
      this.setPage(1);
      console.log('sub_contable', event.detail);
      console.log('BUSQUEDA', this.Busqueda);
    }
  }

  onCancelBusqueda(event) {
    // Reset the field
    event.detail.value = '';
  }

  Buscar(event) {
    console.log(event);
    this.pagedItems = this.regularizacionAPP;
    this.txtBuscar = event.detail.value;
    //this.setPageTodos(1);
  }

  async Mas(dato:any) {
    console.log('DATA',dato);
    const modal = await this.modalCtrl.create({
      component: AddunidadPage,
      backdropDismiss: false,
      componentProps: {
        listado : dato,
      }
    });
    await modal.present();
    const {data} = await modal.onDidDismiss();
    console.log('SUM : ', data.sum);
    dato.UNIDADES = data.sum;
    console.log('DATO ARTICULO DESPUES DE SUMAR',dato);
    this.Calcular(dato);
  }

  SelectEstablecimiento() {
    const idfilter = this.idEstablecimiento;
    console.log(this.idEstablecimiento);
  }

  SelectSeccion() {
    const idFilter = this.idBusqueda;
    console.log('SELECCION : ', idFilter);
    console.log('ARTICULOS : ', this.regularizacionAPP);
    if(this.isSeccion === 1) {
      this.regularizacionAPP = this.regularizacioncopia.filter((n) => {
        // console.log('DATA DE SELECCION : ' + JSON.stringify(n));
        return n.SECCION === idFilter;
      });
      this.setPage(1);
    } else {
      this.regularizacionAPP = this.regularizacioncopia.filter((n) => {
        console.log('DATA DE SELECCION SUBGRUPO : ' + JSON.stringify(n));
        return n.SUBGRUPO_CONTABLE === idFilter;
      });
      this.setPage(1);
    }
    console.log('REGULARIZACION APP', this.regularizacionAPP);
  }

  Calcular(dato: any, opc: any = 0) {
    if (opc === 1) {
      dato.FRACCION = (dato.FRACCION / dato.UDSELABORACION).toFixed(3);
      console.log(dato.FRACCION);
    }
    const suma = dato.FRACCION + dato.ADICIO;
    dato.DIFER = (dato.UNIDADES + suma) - dato.STOCK;
    this.datalocal.SetDataRegularizacionBodega(this.idEstablecimiento, this.regularizacioncopia);
  }

  BtnClickCargar() {
    this.regularizacionAPP = this.regularizacion.filter((n) => {
      return n.CODALMACEN === this.idEstablecimiento;
    });
    this.regularizacioncopia = this.regularizacionAPP;
    this.datalocal.SetDataRegularizacionBodega(this.idEstablecimiento, this.regularizacionAPP).then((data1) => {
      this.setPage(1);
      const data = JSON.stringify(
        {
          CODALMACEN: this.idEstablecimiento,
        }
      );
      this.storage.set('PARAMETROS', data);
      this.isBtnCargar = true;
      this.isDisabled = false;
    });
    console.log(this.regularizacionAPP);
    this.storage.keys().then((val) => {
      console.log('DATA KEYS : ' + JSON.stringify(val));
    });
  }

  setPageTodos(page: number) {
    // get pager object from service
    this.pager = this.pagerService.GetPager(this.regularizacionAPP.length, page);

    // get current page of items
    this.pagedItems = this.regularizacionAPP.slice(this.pager.startIndex, this.pager.endIndex + 1);

  }

  setPage(page: number) {
    // get pager object from service
    this.pager = this.pagerService.GetPager(this.regularizacionAPP.length, page);

    // get current page of items
    this.pagedItems = this.regularizacionAPP.slice(this.pager.startIndex, this.pager.endIndex + 1);

  }

  sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 0 : 1));
    });
}

  VerificarDataInicial() {
    return new Promise((resolve, reject) => {
      console.log('ESTABLECIMIENTO');
      this.storage.keys().then((val) => {
        console.log('DATA KEYS : ' + JSON.stringify(val));
      });
      this.storage.get('REGULARIZACION'+this.idEstablecimiento).then((data) => {
        console.log('YA DENTRO DE REGULARIZACION');
        const t = JSON.parse(data);
        console.log('REGULARIZACION APP', this.regularizacionAPP);
        console.log('Verifica Data Inicial');
        console.log(t);
        this.regularizacionAPP = t.regularizacion;
        this.regularizacioncopia = t.regularizacion;
        // this.isBtnCargar = true;
        this.isDisabled = false;
        this.setPage(1);
        resolve(true);
      }).catch((error) => {
        this.isBtnCargar = false;
        reject(false);

      });
    });
  }

  ngOnInit() {
    this.datalocal.VerificaArchivo().then((data) => {
      //this.DisabledBoton(true);
      console.log(data);
      // this.DisabledBoton(true);
      // this.datalocal.CerrarSesion();
      this.datalocal.CargarData().then((data1) => {
        console.log(data1);
        this.LeerData().then((data2) => {
          //this.isBtnCargar = true;
          this.Busqueda = this.secciones;
        });
      });
    }).catch((error) =>  {
      this.alertas.ShowMensaje('No se encontro el archivo');
      this.DisabledBoton(true);
    });
  }

  DisabledBoton(valor) {
    console.log('Valor : ' + valor);
    this.isBtnCargar = valor;
  }

  async BtnAddPt() {
    console.log('Articulos');
    console.log('PT', this.pt);
    console.log('PTS', this.pts);
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      backdropDismiss: false,
      componentProps: {
        listado : this.pts,
        productos : this.pt
      }
    });
    await modal.present();
    const {data} = await modal.onDidDismiss();
    console.log('Retorno del Modal : ', data);
    this.ptkits = data.ptskits;
    this.ptkits.forEach(c => {
      this.regularizacionAPP.find(v => v.CODARTICULO == c.CODARTKIT).ADICIO = c.UNIDADES;
    });
  }

  async BtnGenerarArchivo() {
    const alert = await this.alertCtrl.create({
      header : 'Fecha Inventario',
      subHeader : 'Por favor escoja la fecha del Inventario',
      cssClass: 'my-custom-modal-css',
      animated : true,
      inputs : [{
        name: 'txtFecha',
        type: 'date'
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
           console.log('Prueba');
           console.log(data);
           if (data === null || data === undefined) {
             console.log('Data es Null');
           }
           this.txtFecha = data.txtFecha;
           this.txtFecha = this.datepipe.transform(data.txtFecha, 'yyyyMMdd');
           console.log('Fecha : ', this.txtFecha);
           /*
           this.storage.get('REGULARIZACION'+this.idEstablecimiento).then((data) => {
            const t = JSON.parse(data);
            console.log('Verifica Data Inicial');
            console.log(t);
           });
           */
           this.regularizacionAPP.forEach(a => {
            a.FECHA = this.txtFecha;
           });
           console.log('DATA MODIFICADAD : ' , this.regularizacionAPP);
           this.datalocal.writeJSON('regularizacion.json', this.regularizacionAPP).then((data2) => {
            console.log('Creacion de File : ');
            console.log(data2);
          });
          }
        }
      ]
    });
    await alert.present();
  }
}
