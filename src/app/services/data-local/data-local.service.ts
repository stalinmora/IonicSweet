import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { reject } from 'q';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  constructor(
    private storage: Storage,
    private file: File
  ) { }


  VerificaArchivo() {
    return new Promise((resolve, reject) => {
      console.log('ARCHIVO EN TARJETA : ' + this.file.externalApplicationStorageDirectory);
      console.log('ARCHIVO EN INTERNO : ' + this.file.applicationStorageDirectory);
      this.file.checkFile(this.file.externalApplicationStorageDirectory, 'dataSweet.json').then(() => {
        resolve(true);
      }).catch((error) => {
        reject(false);
      });
    });
  }

  writeJSON(filename, object) {
    return this.file.writeFile(this.file.externalApplicationStorageDirectory, filename, JSON.stringify(object), {replace: true});
  }

  LeerData() {

  }

  SetDataRegularizacionBodega(bodega: string, obj: any) {
    return new Promise((resolve, reject) => {
      this.storage.ready().then((data) => {
        this.storage.set('REGULARIZACION' + bodega, JSON.stringify(
          {
            regularizacion : obj
          }
          ));
        resolve(true);
      }).catch((error) => {
        reject(false);
      });
    });
  }

  CargarData() {
    return new Promise((resolve, reject) => {
      this.file.readAsText(this.file.externalApplicationStorageDirectory, 'dataSweet.json')
      .then(res => JSON.parse(res))
      .then(json => {
        this.SetDataGlobal(json);
        resolve(true);
      }).catch(() => {
        reject(false);
      });
    });
  }

  CerrarSesion() {
    this.storage.ready().then(() => {
      this.storage.remove('USER').then((data) => {
        console.log('Borrando');
        console.log(data);
      }).catch((error) => {
        console.log('Error : ');
        console.log(error);
      });
    });
    this.storage.clear();
  }

  SetDataGlobal(obj: any) {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        console.log('ARTICULOS :' + JSON.stringify(obj[0].articulos));
        this.storage.set('USER', JSON.stringify(
          {
            articulos: obj[0].articulos,
            kits: obj[0].kits,
            almacenes: obj[0].almacenes,
            stocks: obj[0].stocks,
            regularizaciones: obj[0].regularizaciones,
            secciones: obj[0].secciones,
            pt: obj[0].pt,
            pts: obj[0].pts,
            articuloslibres: obj[0].articuloslibres,
            subgrupocontable: obj[0].subgrupocontables
          }
        ));
        resolve(true);
      }).catch(() => {
        reject(false);
      });
    });
  }

}
