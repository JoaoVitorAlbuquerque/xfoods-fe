export const analyticsQueryKey = ['analytics'];

/**
 * Os endpoints de analytics agregam no banco e devolvem uma linha por produto —
 * são consultas caras e de resposta estável. Cinco minutos é razoável para
 * painel: ninguém decide preço com dado de trinta segundos atrás.
 */
export const analyticsStaleTime = 1000 * 60 * 5;
