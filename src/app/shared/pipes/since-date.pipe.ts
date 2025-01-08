import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sinceDate',
  standalone: true

})
export class SinceDatePipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const now = new Date();
    const inputDate = new Date(value);
    const diffInSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

    if (isNaN(diffInSeconds)) {
      return 'Fecha inválida';
    }

    const secondsInMinute = 60;
    const secondsInHour = secondsInMinute * 60;
    const secondsInDay = secondsInHour * 24;
    const secondsInMonth = secondsInDay * 30;
    const secondsInYear = secondsInDay * 365;

    if (diffInSeconds < secondsInMinute) {
      return 'Hace un momento';
    } else if (diffInSeconds < secondsInHour) {
      const minutes = Math.floor(diffInSeconds / secondsInMinute);
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < secondsInDay) {
      const hours = Math.floor(diffInSeconds / secondsInHour);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInSeconds < secondsInDay * 2) {
      return 'Ayer';
    } else if (diffInSeconds < secondsInMonth) {
      const days = Math.floor(diffInSeconds / secondsInDay);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    } else if (diffInSeconds < secondsInYear) {
      const months = Math.floor(diffInSeconds / secondsInMonth);
      return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffInSeconds / secondsInYear);
      return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
    }
  }
}