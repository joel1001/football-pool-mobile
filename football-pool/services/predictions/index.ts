// ================================================================================
// PREDICTIONS MODULE - Exports
// ================================================================================
// Exporta todos los tipos y funciones del módulo de predicciones

// Service
export {
  default as PredictionService,
  savePrediction,
  savePredictionWithAutoGroupIds,
  getPredictions,
  getPrediction,
  calculateTotalPoints,
  getCalculatedPredictions,
  getPendingPredictions,
  getCompetitionPredictions,
  getRealMatchScores,
} from './prediction-service';

// Types
export type {
  SavePredictionRequest,
  SavePredictionResponse,
  GroupAppliedResult,
  UserPrediction,
  GroupUserPrediction,
  MatchInfo,
  CompetitionPrediction,
  GetPredictionsResponse,
  GetPredictionResponse,
  PredictionErrorResponse,
  PredictionSummary,
  PredictionStatus,
  ValidationResult,
} from './prediction-types';

// Constants
export {
  SCORING_TABLE,
  PREDICTION_ENDPOINTS,
} from './prediction-types';

// Validators & Type Guards
export {
  validateSavePredictionRequest,
  isPredictionError,
  hasPredictionPoints,
  isKnockoutPrediction,
} from './prediction-types';



