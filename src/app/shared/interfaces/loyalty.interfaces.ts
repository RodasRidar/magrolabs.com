/**
 * Interfaces para el sistema de lealtad
 */

export enum LoyaltyTier {
  CARBON = 'CARBON',
  BRONCE = 'BRONCE',
  PLATA = 'PLATA',
  ORO = 'ORO',
  PLATINO = 'PLATINO',
  DIAMANTE = 'DIAMANTE'
}

export interface LoyaltyTierInfo {
  tier: LoyaltyTier;
  threshold: number;
  color: string;
  nextTier?: LoyaltyTier;
  nextThreshold?: number;
}

export interface UserCurrentTierResponse {
  currentTier: LoyaltyTierInfo;
  totalEarnedCredits: number;
  nextTier?: LoyaltyTier;
  creditsToNextTier?: number;
}

/**
 * Response del endpoint para obtener el tier del usuario
 */
export interface GetUserTierResponse {
  status: string;
  data: UserCurrentTierResponse;
}

export interface LoyaltyTierImageRoutes {
  png: string;
  pngComprimido: string;
  png245x254: string;
  svg: string;
}