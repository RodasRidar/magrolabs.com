import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ml-loyalty-meter',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    <div class="overflow-hidden shadow rounded-lg text-white"
        style="background:linear-gradient(90deg, rgba(20, 20, 20, 1) 0%, rgb(40 40 66) 35%, #393737 100%)">
        <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-xl font-medium leading-6 text-white">Magropuntos ahorrados:</h3>
                <a routerLink="/cuenta/credito"
                    class="hidden sm:flex items-center text-white text-sm hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="currentColor"
                        class="mr-1" viewBox="0 0 24 24">
                        <path
                            d="M17,10.43V2H7v8.43c0,0.35,0.18,0.68,0.49,0.86l4.18,2.51l-0.99,2.34l-3.41,0.29l2.59,2.24L9.07,22L12,20.23L14.93,22 l-0.78-3.33l2.59-2.24l-3.41-0.29l-0.99-2.34l4.18-2.51C16.82,11.11,17,10.79,17,10.43z M13,12.23l-1,0.6l-1-0.6V3h2V12.23z" />
                    </svg>
                    Premiamos tu constancia
                </a>
            </div>

            <div class="mt-4">
                <h2 class="text-5xl mt-4 mb-8 font-bold flex items-center max-sm:justify-start">
                    {{ points() }}
                    <img [src]="tierImageSrc()" [alt]="tierAlt()" class="w-16 h-16 mx-2 select-none">
                </h2>

                <div class="relative mt-6 mb-4 w-[94%] max-w-[975px]">
                    <div class="h-2.5 bg-surface bg-opacity-20 rounded-r-lg"></div>
                    <div class="absolute top-0 left-0 h-2.5 rounded-r-lg animate-pulse"
                        [style.width]="progressWidth()"
                        style="transition: width 1.5s ease-in-out; background: #141414; background: linear-gradient(40deg, #221111 19%, rgba(208, 125, 102, 1) 100%);">
                    </div>

                    <div class="relative h-20">
                        <div class="absolute left-[25%] flex flex-col items-center"
                            style="transform: translateX(-50%);">
                            <div class="w-7 h-7 flex items-center justify-center rounded-full -mt-5"
                                [class.w-9]="tierName() === 'Bronce'"
                                [class.h-9]="tierName() === 'Bronce'"
                                [class.-mt-6]="tierName() === 'Bronce'">
                                <img src="/Magropoints/BRONCE/magropuntos_bronce_cc_254x254.png"
                                    alt="Magropuntos bronce" class="select-none">
                            </div>
                            <span class="text-base font-semibold mt-1 max-sm:text-xs">50</span>
                            <span class="text-white text-opacity-80 text-sm max-sm:text-xs">Bronce</span>
                        </div>

                        <div class="absolute left-[40%] flex flex-col items-center"
                            style="transform: translateX(-50%);">
                            <div class="w-7 h-7 flex items-center justify-center rounded-full -mt-5"
                                [class.w-9]="tierName() === 'Plata'"
                                [class.h-9]="tierName() === 'Plata'"
                                [class.-mt-6]="tierName() === 'Plata'">
                                <img src="/Magropoints/PLATA/magropoints_plata_cc_254x254.png"
                                    alt="Magropuntos plata" class="select-none">
                            </div>
                            <span class="text-base font-semibold mt-1 max-sm:text-xs">80</span>
                            <span class="text-white text-opacity-80 text-sm max-sm:text-xs">Plata</span>
                        </div>

                        <div class="absolute left-[55%] flex flex-col items-center"
                            style="transform: translateX(-50%);">
                            <div class="w-7 h-7 flex items-center justify-center rounded-full -mt-5"
                                [class.w-9]="tierName() === 'Oro'"
                                [class.h-9]="tierName() === 'Oro'"
                                [class.-mt-6]="tierName() === 'Oro'">
                                <img src="/Magropoints/ORO/magropoints_oro_cc_254x254.svg"
                                    alt="Magropuntos oro" class="select-none">
                            </div>
                            <span class="text-base font-semibold mt-1 max-sm:text-xs">110</span>
                            <span class="text-white text-opacity-80 text-sm max-sm:text-xs">Oro</span>
                        </div>

                        <div class="absolute left-[75%] flex flex-col items-center"
                            style="transform: translateX(-50%);">
                            <div class="w-7 h-7 flex items-center justify-center rounded-full -mt-5"
                                [class.w-9]="tierName() === 'Platino'"
                                [class.h-9]="tierName() === 'Platino'"
                                [class.-mt-6]="tierName() === 'Platino'">
                                <img src="/Magropoints/PLATINO/magropoints_platinos_cc_254x254.png"
                                    alt="Magropuntos platino" class="select-none">
                            </div>
                            <span class="text-base font-semibold mt-1 max-sm:text-xs">150</span>
                            <span class="text-white text-opacity-80 text-sm max-sm:text-xs">Platino</span>
                        </div>

                        <div class="absolute right-0 flex flex-col items-center"
                            style="transform: translateX(50%);">
                            <div class="w-7 h-7 flex items-center justify-center rounded-full -mt-5"
                                [class.w-9]="tierName() === 'Diamante'"
                                [class.h-9]="tierName() === 'Diamante'"
                                [class.-mt-6]="tierName() === 'Diamante'">
                                <img src="/Magropoints/DIAMANTE/magropoints_diamante_cc_254x254.png"
                                    alt="Magropuntos diamante" class="select-none">
                            </div>
                            <span class="text-base font-semibold mt-1 max-sm:text-xs">200</span>
                            <span class="text-white text-opacity-80 text-sm max-sm:text-xs">Diamante</span>
                        </div>
                    </div>
                </div>

                <div class="flex mt-6 animate-bounce">
                    <span class="mr-1">🎁</span>
                    <a routerLink="/cuenta/credito"
                        class="text-white underline hover:text-primary-hover flex items-center">
                        <span class="font-medium"> Gana 30 Magropuntos gratis → </span>
                    </a>
                </div>
            </div>
        </div>
    </div>
  `,
})
export class LoyaltyMeterComponent {
  points = input.required<number>();
  tierImageSrc = input.required<string>();
  tierAlt = input.required<string>();
  progressWidth = input.required<string>();
  tierName = input.required<string>();
}
