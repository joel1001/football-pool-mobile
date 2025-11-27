import { Team } from '@/services/competitions/competition-types';

type CompetitionCategory = 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues';

/**
 * Obtiene la URL de imagen correcta para un equipo según la categoría de la competencia
 * 
 * @param team - Objeto del equipo con flag e image
 * @param category - Categoría de la competencia
 * @returns URL de la imagen a usar
 */
export function getTeamImageUrl(
  team: { flag?: string; image?: string } | null | undefined,
  category: CompetitionCategory
): string | null {
  if (!team) return null;

  // Para clubes (fifaOfficialClubCups): usar team.image, con team.flag como fallback
  if (category === 'fifaOfficialClubCups') {
    return team.image || team.flag || null;
  }

  // Para nacionales (fifaNationalTeamCups): usar team.flag
  if (category === 'fifaNationalTeamCups') {
    return team.flag || null;
  }

  // Para ligas (nationalClubLeagues): usar team.image o team.flag según exista
  if (category === 'nationalClubLeagues') {
    return team.image || team.flag || null;
  }

  // Fallback
  return team.flag || team.image || null;
}

/**
 * Obtiene la URL de imagen para un equipo desde un mapa de equipos
 * Útil cuando tienes un teamId y necesitas buscar el equipo en un array
 * 
 * @param teamId - ID del equipo
 * @param teamsMap - Mapa de equipos (teamId -> Team)
 * @param category - Categoría de la competencia
 * @returns URL de la imagen a usar
 */
export function getTeamImageUrlById(
  teamId: string | null | undefined,
  teamsMap: Map<string, Team>,
  category: CompetitionCategory
): string | null {
  if (!teamId) return null;
  
  const team = teamsMap.get(teamId);
  return getTeamImageUrl(team, category);
}

