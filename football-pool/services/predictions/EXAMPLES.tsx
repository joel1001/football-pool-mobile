// ================================================================================
// PREDICTION SERVICE - EJEMPLOS DE INTEGRACIÓN
// ================================================================================
// Este archivo contiene ejemplos prácticos de cómo integrar el servicio de
// predicciones en componentes de React Native

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  savePrediction,
  getPredictions,
  getPrediction,
  validateSavePredictionRequest,
  SavePredictionRequest,
  GetPredictionsResponse,
  UserPrediction,
} from './index';

// ================================================================================
// EJEMPLO 1: Componente Simple de Predicción
// ================================================================================

interface SimplePredictionFormProps {
  matchId: string;
  userId: string;
  groupIds: string[];
  competitionId?: string;
  team1: string; // ⚠️ REQUERIDO: Nombre del equipo 1
  team2: string; // ⚠️ REQUERIDO: Nombre del equipo 2
  category?: 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues';
}

export const SimplePredictionForm: React.FC<SimplePredictionFormProps> = ({
  matchId,
  userId,
  groupIds,
  competitionId,
  team1,
  team2,
  category,
}) => {
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validar que los campos no estén vacíos
    if (!team1Score || !team2Score) {
      Alert.alert('Error', 'Por favor ingresa ambos marcadores');
      return;
    }

    // Crear el request
    const request: SavePredictionRequest = {
      matchId,
      team1Score: parseInt(team1Score) || 0,
      team2Score: parseInt(team2Score) || 0,
      groupIds,
      competitionId,
      category,
    };

    // Validar el request
    const errors = validateSavePredictionRequest(request);
    if (errors.length > 0) {
      Alert.alert('Error de validación', errors.join('\n'));
      return;
    }

    // Guardar predicción
    setLoading(true);
    try {
      const response = await savePrediction(userId, request);

      // Mostrar resultado
      const pointsInfo = response.groupsApplied
        .map((g) => `${g.groupName}: ${g.points} puntos`)
        .join('\n');

      Alert.alert('✅ Predicción guardada', pointsInfo);

      // Limpiar form
      setTeam1Score('');
      setTeam2Score('');
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresa tu predicción</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Equipo 1"
          keyboardType="numeric"
          value={team1Score}
          onChangeText={setTeam1Score}
          editable={!loading}
        />
        <Text style={styles.separator}>-</Text>
        <TextInput
          style={styles.input}
          placeholder="Equipo 2"
          keyboardType="numeric"
          value={team2Score}
          onChangeText={setTeam2Score}
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Guardar Predicción</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ================================================================================
// EJEMPLO 2: Componente con Knockout (Tiempo Extra y Penales)
// ================================================================================

interface KnockoutPredictionFormProps {
  matchId: string;
  userId: string;
  groupIds: string[];
  competitionId?: string;
  team1: string; // ⚠️ REQUERIDO: Nombre del equipo 1
  team2: string; // ⚠️ REQUERIDO: Nombre del equipo 2
  category?: 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues';
  isKnockout?: boolean;
}

export const KnockoutPredictionForm: React.FC<KnockoutPredictionFormProps> = ({
  matchId,
  userId,
  groupIds,
  competitionId,
  team1,
  team2,
  category,
  isKnockout = false,
}) => {
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [extraTime, setExtraTime] = useState(false);
  const [penalties, setPenalties] = useState(false);
  const [penaltiesTeam1, setPenaltiesTeam1] = useState('');
  const [penaltiesTeam2, setPenaltiesTeam2] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Crear el request
    const request: SavePredictionRequest = {
      matchId,
      competitionId: competitionId || '', // REQUERIDO
      team1: team1, // ⚠️ REQUERIDO: Nombre del equipo 1
      team2: team2, // ⚠️ REQUERIDO: Nombre del equipo 2
      team1Score: parseInt(team1Score) || 0,
      team2Score: parseInt(team2Score) || 0,
      realTeam1Score: 0, // Obtener del servicio tournaments (0 si no se ha jugado)
      realTeam2Score: 0, // Obtener del servicio tournaments (0 si no se ha jugado)
      groupIds,
    };

    // Agregar campos de knockout si aplica
    if (isKnockout) {
      request.extraTime = extraTime;
      request.penaltiesteam1Score = penalties ? parseInt(penaltiesTeam1) || 0 : null;
      request.penaltiesteam2Score = penalties ? parseInt(penaltiesTeam2) || 0 : null;
    }

    // Validar
    const errors = validateSavePredictionRequest(request);
    if (errors.length > 0) {
      Alert.alert('Error de validación', errors.join('\n'));
      return;
    }

    // Guardar
    setLoading(true);
    try {
      const response = await savePrediction(userId, request);

      Alert.alert(
        '✅ Predicción guardada',
        `Puntos: ${response.groupsApplied[0].points}\nScore total: ${response.groupsApplied[0].totalScore}`
      );
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Predicción</Text>

      {/* Marcadores principales */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Equipo 1"
          keyboardType="numeric"
          value={team1Score}
          onChangeText={setTeam1Score}
        />
        <Text style={styles.separator}>-</Text>
        <TextInput
          style={styles.input}
          placeholder="Equipo 2"
          keyboardType="numeric"
          value={team2Score}
          onChangeText={setTeam2Score}
        />
      </View>

      {/* Campos adicionales para knockout */}
      {isKnockout && (
        <View style={styles.knockoutSection}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setExtraTime(!extraTime)}
          >
            <Text>{extraTime ? '☑️' : '⬜️'} Tiempo Extra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setPenalties(!penalties)}
          >
            <Text>{penalties ? '☑️' : '⬜️'} Penales</Text>
          </TouchableOpacity>

          {penalties && (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Penales Equipo 1"
                keyboardType="numeric"
                value={penaltiesTeam1}
                onChangeText={setPenaltiesTeam1}
              />
              <Text style={styles.separator}>-</Text>
              <TextInput
                style={styles.input}
                placeholder="Penales Equipo 2"
                keyboardType="numeric"
                value={penaltiesTeam2}
                onChangeText={setPenaltiesTeam2}
              />
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Guardar Predicción</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

// ================================================================================
// EJEMPLO 3: Hook Personalizado para Predicciones
// ================================================================================

interface UsePredictionsReturn {
  predictions: UserPrediction[];
  loading: boolean;
  error: string | null;
  totalScore: number;
  refresh: () => Promise<void>;
  save: (request: SavePredictionRequest) => Promise<void>;
  getPredictionForMatch: (matchId: string) => UserPrediction | null;
}

export const usePredictions = (
  userId: string,
  groupId?: string
): UsePredictionsReturn => {
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPredictions(userId, groupId);
      setPredictions(response.predictions);
      setTotalScore(response.totalScore || 0);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePredictionHandler = async (request: SavePredictionRequest) => {
    try {
      await savePrediction(userId, request);
      await fetchPredictions(); // Refresh
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getPredictionForMatch = (matchId: string): UserPrediction | null => {
    return predictions.find((p) => p.matchId === matchId) || null;
  };

  useEffect(() => {
    if (userId) {
      fetchPredictions();
    }
  }, [userId, groupId]);

  return {
    predictions,
    loading,
    error,
    totalScore,
    refresh: fetchPredictions,
    save: savePredictionHandler,
    getPredictionForMatch,
  };
};

// ================================================================================
// EJEMPLO 4: Lista de Predicciones
// ================================================================================

interface PredictionsListProps {
  userId: string;
  groupId?: string;
}

export const PredictionsList: React.FC<PredictionsListProps> = ({
  userId,
  groupId,
}) => {
  const { predictions, loading, error, totalScore, refresh } = usePredictions(
    userId,
    groupId
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00B894" />
        <Text>Cargando predicciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ Error: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={refresh}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (predictions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No tienes predicciones aún</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Predicciones</Text>
        <Text style={styles.totalScore}>Score Total: {totalScore}</Text>
      </View>

      {predictions.map((prediction) => (
        <View key={prediction.matchId} style={styles.predictionCard}>
          <Text style={styles.matchId}>Partido: {prediction.matchId}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.score}>
              {prediction.team1Score} - {prediction.team2Score}
            </Text>
            <Text style={styles.points}>
              {prediction.points > 0 ? `${prediction.points} pts` : 'Pendiente'}
            </Text>
          </View>
          <Text style={styles.date}>
            {new Date(prediction.predictedDate).toLocaleDateString()}
          </Text>
        </View>
      ))}

      <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
        <Text style={styles.buttonText}>Actualizar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ================================================================================
// EJEMPLO 5: Componente Completo con Predicción Existente
// ================================================================================

interface MatchPredictionProps {
  matchId: string;
  userId: string;
  groupIds: string[];
  competitionId?: string;
  team1: string; // ⚠️ REQUERIDO: Nombre del equipo 1
  team2: string; // ⚠️ REQUERIDO: Nombre del equipo 2
  category?: 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues';
}

export const MatchPrediction: React.FC<MatchPredictionProps> = ({
  matchId,
  userId,
  groupIds,
  competitionId,
  team1,
  team2,
  category,
}) => {
  const [existingPrediction, setExistingPrediction] = useState<UserPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const response = await getPrediction(userId, matchId);
        setExistingPrediction(response.prediction);
      } catch (error) {
        console.error('Error fetching prediction:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExisting();
  }, [userId, matchId]);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      {existingPrediction ? (
        <View>
          <Text style={styles.title}>Tu predicción:</Text>
          <Text style={styles.score}>
            {existingPrediction.team1Score} - {existingPrediction.team2Score}
          </Text>
          <Text style={styles.points}>
            {existingPrediction.points > 0
              ? `${existingPrediction.points} puntos`
              : 'Pendiente (partido no jugado)'}
          </Text>

          <SimplePredictionForm
            matchId={matchId}
            userId={userId}
            groupIds={groupIds}
            competitionId={competitionId}
            team1={team1}
            team2={team2}
            category={category}
          />
          <Text style={styles.hint}>
            Puedes actualizar tu predicción en cualquier momento
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Haz tu predicción:</Text>
          <SimplePredictionForm
            matchId={matchId}
            userId={userId}
            groupIds={groupIds}
            competitionId={competitionId}
            team1={team1}
            team2={team2}
            category={category}
          />
        </View>
      )}
    </View>
  );
};

// ================================================================================
// EJEMPLO 6: Estadísticas de Predicciones
// ================================================================================

interface PredictionStatsProps {
  userId: string;
  groupId?: string;
}

export const PredictionStats: React.FC<PredictionStatsProps> = ({
  userId,
  groupId,
}) => {
  const { predictions, totalScore, loading } = usePredictions(userId, groupId);

  if (loading) return <ActivityIndicator />;

  const calculated = predictions.filter((p) => p.points > 0);
  const pending = predictions.filter((p) => p.points === 0);
  const exactScores = predictions.filter((p) => p.points === 5).length;
  const correctResults = predictions.filter((p) => p.points === 3).length;

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Estadísticas</Text>

      <View style={styles.statRow}>
        <Text>Total de predicciones:</Text>
        <Text style={styles.statValue}>{predictions.length}</Text>
      </View>

      <View style={styles.statRow}>
        <Text>Calculadas:</Text>
        <Text style={styles.statValue}>{calculated.length}</Text>
      </View>

      <View style={styles.statRow}>
        <Text>Pendientes:</Text>
        <Text style={styles.statValue}>{pending.length}</Text>
      </View>

      <View style={styles.statRow}>
        <Text>Marcadores exactos:</Text>
        <Text style={styles.statValue}>{exactScores}</Text>
      </View>

      <View style={styles.statRow}>
        <Text>Resultados correctos:</Text>
        <Text style={styles.statValue}>{correctResults}</Text>
      </View>

      <View style={[styles.statRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Score Total:</Text>
        <Text style={styles.totalValue}>{totalScore}</Text>
      </View>
    </View>
  );
};

// ================================================================================
// ESTILOS
// ================================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  separator: {
    fontSize: 20,
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00B894',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  knockoutSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  checkbox: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B894',
  },
  predictionCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  matchId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  points: {
    fontSize: 16,
    color: '#00B894',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  refreshButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#00B894',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#00B894',
    borderBottomWidth: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B894',
  },
});

// ================================================================================
// EXPORTS
// ================================================================================

export default {
  SimplePredictionForm,
  KnockoutPredictionForm,
  PredictionsList,
  MatchPrediction,
  PredictionStats,
  usePredictions,
};




