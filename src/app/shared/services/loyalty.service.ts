import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/env';
import { 
  LoyaltyTier, 
  GetUserTierResponse, 
  UserCurrentTierResponse,
  LoyaltyTierInfo,
  LoyaltyTierImageRoutes
} from '../interfaces/loyalty.interfaces';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiMagroLabs}/loyalty`;

  /**
   * Obtiene el tier actual del usuario
   * @param userId ID del usuario
   * @returns Observable con la información del tier del usuario
   */
  getUserTier(userId: string): Observable<UserCurrentTierResponse> {
    return this.http.get<GetUserTierResponse>(`${this.baseUrl}/user/${userId}/tier`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Genera las rutas de imágenes según el tier del usuario
   * @param tier Tier del usuario
   * @returns Objeto con todas las rutas de imágenes disponibles para el tier
   */
  getTierImageRoutes(tier: LoyaltyTier): LoyaltyTierImageRoutes {
    const tierFolderMap: Record<LoyaltyTier, string> = {
      [LoyaltyTier.CARBON]: 'CARBON',
      [LoyaltyTier.BRONCE]: 'BRONCE',
      [LoyaltyTier.PLATA]: 'PLATA',
      [LoyaltyTier.ORO]: 'ORO',
      [LoyaltyTier.PLATINO]: 'PLATINO',
      [LoyaltyTier.DIAMANTE]: 'DIAMANTE'
    };

    const tierFileMap: Record<LoyaltyTier, string> = {
      [LoyaltyTier.CARBON]: 'magropoints_carbon',
      [LoyaltyTier.BRONCE]: 'magropuntos_bronce',
      [LoyaltyTier.PLATA]: 'magropoints_plata',
      [LoyaltyTier.ORO]: 'magropoints_oro',
      [LoyaltyTier.PLATINO]: 'magropoints_platinos',
      [LoyaltyTier.DIAMANTE]: 'magropoints_diamante'
    };

    const folder = tierFolderMap[tier];
    const fileName = tierFileMap[tier];

    if (!folder || !fileName) {
      // Fallback para tiers no encontrados
      return {
        png: '/magropoints_img.png',
        pngComprimido: '/magropoints_img.png',
        png245x254: '/magropoints_img.png',
        svg: '/magropoints_img.png'
      };
    }

    return {
      png: `/Magropoints/${folder}/${fileName}.png`,
      pngComprimido: `/Magropoints/${folder}/${fileName}_cc.png`,
      png245x254: `/Magropoints/${folder}/${fileName}_cc_254x254.png`,
      svg: `/Magropoints/${folder}/${fileName}_cc_254x254.svg`
    };
  }

  /**
   * Obtiene la URL de la imagen según el tier (versión optimizada por defecto)
   * @param tier Tier del usuario
   * @returns URL de la imagen comprimida correspondiente al tier
   */
  getTierImageUrl(tier: LoyaltyTier): string {
    const routes = this.getTierImageRoutes(tier);
    return routes.pngComprimido; // Usa la versión comprimida por defecto
  }

  /**
   * Obtiene una URL específica de imagen según el tier y tipo
   * @param tier Tier del usuario
   * @param imageType Tipo de imagen deseada
   * @returns URL de la imagen específica
   */
  getTierImageByType(tier: LoyaltyTier, imageType: keyof LoyaltyTierImageRoutes): string {
    const routes = this.getTierImageRoutes(tier);
    return routes[imageType];
  }

  /**
   * Obtiene el nombre amigable del tier
   * @param tier Tier del usuario
   * @returns Nombre amigable del tier
   */
  getTierDisplayName(tier: LoyaltyTier): string {
    const tierNames: Record<LoyaltyTier, string> = {
      [LoyaltyTier.CARBON]: 'Carbon',
      [LoyaltyTier.BRONCE]: 'Bronce',
      [LoyaltyTier.PLATA]: 'Plata',
      [LoyaltyTier.ORO]: 'Oro',
      [LoyaltyTier.PLATINO]: 'Platino',
      [LoyaltyTier.DIAMANTE]: 'Diamante'
    };

    return tierNames[tier] || 'MagroPoints';
  }

  /**
   * Obtiene información completa del tier incluyendo imagen y nombre
   * @param userId ID del usuario
   * @returns Observable con la información completa del tier
   */
  getUserTierInfo(userId: string): Observable<{
    tierData: UserCurrentTierResponse;
    imageRoutes: LoyaltyTierImageRoutes;
    displayName: string;
  }> {
    return this.getUserTier(userId).pipe(
      map(tierData => {
        const imageRoutes = this.getTierImageRoutes(tierData.currentTier.tier);
        return {
          tierData,
          imageRoutes,
          displayName: this.getTierDisplayName(tierData.currentTier.tier)
        };
      })
    );
  }

  /**
   * Obtiene todos los tiers disponibles con su información
   * @returns Array con información de todos los tiers
   */
  getAllTiers(): LoyaltyTierInfo[] {
    return [
      {
        tier: LoyaltyTier.CARBON,
        threshold: 0,
        color: '#4A4A4A',
        nextTier: LoyaltyTier.BRONCE,
        nextThreshold: 100
      },
      {
        tier: LoyaltyTier.BRONCE,
        threshold: 100,
        color: '#CD7F32',
        nextTier: LoyaltyTier.PLATA,
        nextThreshold: 250
      },
      {
        tier: LoyaltyTier.PLATA,
        threshold: 250,
        color: '#C0C0C0',
        nextTier: LoyaltyTier.ORO,
        nextThreshold: 500
      },
      {
        tier: LoyaltyTier.ORO,
        threshold: 500,
        color: '#FFD700',
        nextTier: LoyaltyTier.PLATINO,
        nextThreshold: 1000
      },
      {
        tier: LoyaltyTier.PLATINO,
        threshold: 1000,
        color: '#E5E4E2',
        nextTier: LoyaltyTier.DIAMANTE,
        nextThreshold: 2000
      },
      {
        tier: LoyaltyTier.DIAMANTE,
        threshold: 2000,
        color: '#B9F2FF',
        nextTier: undefined,
        nextThreshold: undefined
      }
    ];
  }
}
