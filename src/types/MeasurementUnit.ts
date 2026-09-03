export type UnitKind = 'WEIGHT' | 'VOLUME' | 'COUNT';

export interface MeasurementUnit {
  id: string;
  /** Nulo nas unidades de sistema, que são compartilhadas por todos. */
  userId: string | null;
  code: string;
  name: string;
  kind: UnitKind;
  /**
   * Quantas unidades base cabem em 1 desta unidade — 1 KG = 1000 G.
   * Nulo nas unidades de embalagem, que não têm fator universal.
   */
  factorToBase: number | null;
  /** Marca a unidade canônica da grandeza (G, ML, UN). */
  isBase: boolean;
  isPackaging: boolean;
  isSystem: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const unitKinds: UnitKind[] = ['WEIGHT', 'VOLUME', 'COUNT'];

export const unitKindLabels: Record<UnitKind, string> = {
  WEIGHT: 'Peso',
  VOLUME: 'Volume',
  COUNT: 'Contagem',
};
