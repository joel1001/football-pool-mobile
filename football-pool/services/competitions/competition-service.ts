import axiosBase from "../services-config";
import { 
  CompetitionsResponse, 
  CompetitionDetailsResponse,
  Competition
} from "./competition-types";

/**
 * GET /competitions
 * Obtener todas las competiciones organizadas por categoría
 */
export const getAllCompetitions = async (): Promise<CompetitionsResponse> => {
  const response = await axiosBase.get<CompetitionsResponse>("competitions");
  return response.data;
};

/**
 * GET /competitions/:category
 * Obtener competiciones de una categoría específica
 */
export const getCompetitionsByCategory = async (
  category: 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues'
): Promise<Competition[]> => {
  const response = await axiosBase.get<Competition[]>(`competitions/${category}`);
  return response.data;
};

/**
 * GET /competitions/:category/:id
 * Obtener detalles de una competición específica
 */
export const getCompetitionDetails = async (
  category: string,
  id: string
): Promise<CompetitionDetailsResponse> => {
  const response = await axiosBase.get<CompetitionDetailsResponse>(
    `competitions/${category}/${id}`
  );
  return response.data;
};

/**
 * GET /competitions/search?q=query
 * Buscar competiciones por nombre, región o país
 */
export const searchCompetitions = async (query: string): Promise<CompetitionsResponse> => {
  const response = await axiosBase.get<CompetitionsResponse>("competitions/search", {
    params: { q: query }
  });
  return response.data;
};

/**
 * POST /competitions/:category
 * Crear nueva competición
 */
export const createCompetition = async (
  category: string,
  competition: Omit<Competition, 'id'>
): Promise<Competition> => {
  const response = await axiosBase.post<Competition>(
    `competitions/${category}`,
    competition
  );
  return response.data;
};

/**
 * PUT /competitions/:category/:id
 * Actualizar competición completa
 */
export const updateCompetition = async (
  category: string,
  id: string,
  competition: Partial<Competition>
): Promise<Competition> => {
  const response = await axiosBase.put<Competition>(
    `competitions/${category}/${id}`,
    competition
  );
  return response.data;
};

/**
 * PATCH /competitions/:category/:id
 * Actualizar campos específicos de una competición
 */
export const patchCompetition = async (
  category: string,
  id: string,
  updates: Partial<Competition>
): Promise<Competition> => {
  const response = await axiosBase.patch<Competition>(
    `competitions/${category}/${id}`,
    updates
  );
  return response.data;
};

/**
 * DELETE /competitions/:category/:id
 * Eliminar competición
 */
export const deleteCompetition = async (
  category: string,
  id: string
): Promise<void> => {
  await axiosBase.delete(`competitions/${category}/${id}`);
};


