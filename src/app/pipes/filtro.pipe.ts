import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtro'
})
export class FiltroPipe implements PipeTransform {

  transform(value: any[], text: string): any [] {
    //console.log(value);
    if (text === '' || text === undefined) {
      return value;
    }
    return value.filter((items) => {
      return items.DESCRIPCION.toLowerCase().includes(text.toLowerCase());
    });
  }

}
