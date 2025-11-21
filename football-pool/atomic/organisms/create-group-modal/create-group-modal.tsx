import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './create-group-modal.styles';
import { CreateGroupModalProps } from './create-group-modal.types';
import { validateEmails } from '@/services/groups';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/app-context';

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  competitionId,
  competitionName,
  category,
  onClose,
  onCreate,
}) => {
  const { t } = useTranslation();
  const { localData } = useAppContext();
  const [groupName, setGroupName] = useState('');
  const [totalBetAmount, setTotalBetAmount] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [validatedUsers, setValidatedUsers] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Constantes
  const MINIMUM_TOTAL_BET_AMOUNT = 50; // $50 USD mínimo total (fijo, se divide entre participantes)
  
  // Calcular número total de usuarios (creador + invitados + usuarios existentes)
  const totalUsers = 1 + validatedUsers.length; // 1 = creador
  const minimumTotalAmount = MINIMUM_TOTAL_BET_AMOUNT; // Siempre $50 fijo
  
  // Calcular monto equitativo por usuario
  const betAmountValue = parseFloat(totalBetAmount) || 0;
  const equitableAmountPerUser = totalUsers > 0 ? betAmountValue / totalUsers : 0;
  const isValidAmount = betAmountValue >= minimumTotalAmount; // Solo validar el total mínimo

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setGroupName('');
      setTotalBetAmount('');
      setEmailInput('');
      setEmails([]);
      setValidatedUsers([]);
    }
  }, [visible]);
  
  // Auto-ajustar monto mínimo cuando cambia el número de usuarios
  useEffect(() => {
    if (totalBetAmount && parseFloat(totalBetAmount) < minimumTotalAmount) {
      // No auto-ajustar, solo mostrar validación
      // El usuario debe ajustar manualmente
    }
  }, [validatedUsers.length, minimumTotalAmount]);

  // Validate emails when they change
  useEffect(() => {
    if (emails.length > 0) {
      validateEmailsList();
    } else {
      setValidatedUsers([]);
    }
  }, [emails]);

  const validateEmailsList = async () => {
    try {
      setIsValidating(true);
      const response = await validateEmails(emails);
      setValidatedUsers(response.users);
      console.log('📧 Emails validated:', response);
    } catch (err: any) {
      console.error('Error validating emails:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(t('createGroupModal.invalidEmail'), t('createGroupModal.invalidEmailMessage'));
      return;
    }
    
    // Check if user is trying to add themselves
    const currentUserEmail = localData.email?.toLowerCase();
    if (currentUserEmail && trimmedEmail === currentUserEmail) {
      Alert.alert(
        t('createGroupModal.cannotAddYourself'),
        t('createGroupModal.cannotAddYourselfMessage')
      );
      return;
    }
    
    // Check if email already added
    if (emails.includes(trimmedEmail)) {
      Alert.alert(t('createGroupModal.duplicateEmail'), t('createGroupModal.duplicateEmailMessage'));
      return;
    }
    
    setEmails([...emails, trimmedEmail]);
    setEmailInput('');
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
    setValidatedUsers(validatedUsers.filter(u => u.email !== email));
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      
      // Validar que el nombre del grupo esté presente
      if (!groupName.trim()) {
        Alert.alert(t('createGroupModal.groupNameRequired'));
        setIsCreating(false);
        return;
      }
      
      // Validar que haya al menos 1 participante (mínimo 2 personas: creador + 1)
      if (validatedUsers.length === 0) {
        Alert.alert(
          t('createGroupModal.minimumParticipantsError'),
          t('createGroupModal.minimumParticipantsMessage')
        );
        setIsCreating(false);
        return;
      }
      
      // Validar monto total
      const betAmount = parseFloat(totalBetAmount);
      if (!totalBetAmount.trim() || isNaN(betAmount) || betAmount <= 0) {
        Alert.alert(
          t('createGroupModal.invalidBetAmount'),
          t('createGroupModal.invalidBetAmountMessage')
        );
        setIsCreating(false);
        return;
      }
      
      // Validar monto mínimo total ($50 fijo)
      if (betAmount < minimumTotalAmount) {
        Alert.alert(
          t('createGroupModal.minimumAmountError'),
          t('createGroupModal.minimumAmountMessage', {
            minimum: minimumTotalAmount
          })
        );
        setIsCreating(false);
        return;
      }
      
      // Calcular monto por usuario (se divide equitativamente)
      const calculatedPerUser = betAmount / totalUsers;
      
      // Create group with validated users
      // Users with exists: true should have userId
      const existingUserIds = validatedUsers
        .filter(u => u.exists && u.userId)
        .map(u => u.userId!); // Non-null assertion since we filtered
      
      // Users with exists: false will receive email invitation
      const inviteEmails = validatedUsers
        .filter(u => !u.exists)
        .map(u => u.email);
      
      console.log('📋 Group creation summary:', {
        existingUsers: existingUserIds.length,
        inviteEmails: inviteEmails.length,
        groupName: groupName || 'Auto-generated',
        totalBetAmount: betAmount,
        totalUsers: totalUsers,
        equitableAmountPerUser: calculatedPerUser.toFixed(2),
      });
      
      await onCreate(groupName || undefined, existingUserIds, inviteEmails, betAmount);
      
    } catch (err) {
      console.error('Error in handleCreate:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const existingCount = validatedUsers.filter(u => u.exists).length;
  const nonExistingCount = validatedUsers.filter(u => !u.exists).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('groups.createGroup')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#1A4D3A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Competition Info */}
            <View style={styles.competitionInfo}>
              <Ionicons name="trophy" size={24} color="#10B981" />
              <Text style={styles.competitionName}>{competitionName}</Text>
            </View>

            {/* Group Name Input */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('createGroupModal.groupName')} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t('createGroupModal.groupNamePlaceholder')}
                placeholderTextColor="rgba(26, 77, 58, 0.4)"
                value={groupName}
                onChangeText={setGroupName}
              />
              <Text style={styles.hint}>
                {t('createGroupModal.groupNameRequired')}
              </Text>
            </View>

            {/* Total Bet Amount Input */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('createGroupModal.totalBetAmount')} *</Text>
              <View style={styles.betAmountContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.betAmountInput, !isValidAmount && totalBetAmount && styles.betAmountInputError]}
                  placeholder={t('createGroupModal.totalBetAmountPlaceholder')}
                  placeholderTextColor="rgba(26, 77, 58, 0.4)"
                  value={totalBetAmount}
                  onChangeText={(text) => {
                    // Solo permitir números y un punto decimal
                    const numericValue = text.replace(/[^0-9.]/g, '');
                    // Asegurar solo un punto decimal
                    const parts = numericValue.split('.');
                    const formattedValue = parts.length > 2 
                      ? parts[0] + '.' + parts.slice(1).join('')
                      : numericValue;
                    setTotalBetAmount(formattedValue);
                  }}
                  keyboardType="decimal-pad"
                  maxLength={10}
                />
              </View>
              
              {/* Información de validación */}
              <Text style={styles.hint}>
                {t('createGroupModal.totalBetAmountHint')}
              </Text>
              
              {/* Mostrar mínimo requerido */}
              <View style={styles.minimumInfo}>
                <Ionicons name="information-circle" size={14} color="#6B7280" />
                <Text style={styles.minimumInfoText}>
                  {t('createGroupModal.minimumRequired', {
                    minimum: minimumTotalAmount
                  })}
                </Text>
              </View>
              
              {/* Mostrar cálculo equitativo */}
              {totalBetAmount && !isNaN(betAmountValue) && betAmountValue > 0 && (
                <View style={styles.betCalculation}>
                  <Text style={styles.betCalculationLabel}>
                    {t('createGroupModal.betPerUser')}: 
                  </Text>
                  <Text style={styles.betCalculationAmount}>
                    ${equitableAmountPerUser.toFixed(2)}
                  </Text>
                  {totalUsers > 0 && (
                    <Text style={styles.betCalculationHint}>
                      {t('createGroupModal.betCalculationHint', {
                        total: betAmountValue.toFixed(2),
                        users: totalUsers,
                        perUser: equitableAmountPerUser.toFixed(2)
                      })}
                    </Text>
                  )}
                </View>
              )}
              
              {/* Mensaje de error si el monto no es válido */}
              {totalBetAmount && !isValidAmount && (
                <View style={styles.validationError}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.validationErrorText}>
                    {t('createGroupModal.amountTooLow', {
                      minimum: minimumTotalAmount
                    })}
                  </Text>
                </View>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('createGroupModal.addParticipants')} *</Text>
              <Text style={styles.hint}>
                {t('createGroupModal.minimumParticipantsHint')}
              </Text>
              <View style={styles.emailInputContainer}>
                <TextInput
                  style={styles.emailInput}
                  placeholder={t('createGroupModal.emailPlaceholder')}
                  placeholderTextColor="rgba(26, 77, 58, 0.4)"
                  value={emailInput}
                  onChangeText={setEmailInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleAddEmail}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddEmail}
                  disabled={!emailInput.trim()}
                >
                  <Ionicons name="add-circle" size={32} color={emailInput.trim() ? '#10B981' : '#ccc'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Validated Users List */}
            {isValidating && (
              <View style={styles.validatingContainer}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.validatingText}>{t('createGroupModal.validatingEmails')}</Text>
              </View>
            )}

            {/* Mensaje si no hay participantes */}
            {validatedUsers.length === 0 && !isValidating && (
              <View style={styles.noParticipantsWarning}>
                <Ionicons name="alert-circle" size={20} color="#F97316" />
                <Text style={styles.noParticipantsWarningText}>
                  {t('createGroupModal.noParticipantsWarning')}
                </Text>
              </View>
            )}

            {validatedUsers.length > 0 && !isValidating && (
              <View style={styles.section}>
                <Text style={styles.label}>
                  {t('groups.participants')} ({validatedUsers.length})
                </Text>
                
                {/* Existing Users */}
                {existingCount > 0 && (
                  <View style={styles.userTypeSection}>
                    <Text style={styles.userTypeLabel}>
                      ✅ {t('createGroupModal.registeredUsers')} ({existingCount})
                    </Text>
                    {validatedUsers.filter(u => u.exists).map((user) => (
                      <View key={user.email} style={styles.userCard}>
                        <View style={styles.userInfo}>
                          {user.profileImage ? (
                            <Image 
                              source={{ uri: user.profileImage }} 
                              style={styles.userAvatar}
                            />
                          ) : (
                            <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                              <Ionicons name="person" size={20} color="#10B981" />
                            </View>
                          )}
                          <View style={styles.userDetails}>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveEmail(user.email)}>
                          <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Non-Existing Users */}
                {nonExistingCount > 0 && (
                  <View style={styles.userTypeSection}>
                    <Text style={styles.userTypeLabel}>
                      ⚠️ {t('createGroupModal.willReceiveInvitation')} ({nonExistingCount})
                    </Text>
                    {validatedUsers.filter(u => !u.exists).map((user) => (
                      <View key={user.email} style={[styles.userCard, styles.userCardWarning]}>
                        <View style={styles.userInfo}>
                          <View style={[styles.userAvatar, styles.userAvatarWarning]}>
                            <Ionicons name="mail" size={20} color="#F97316" />
                          </View>
                          <View style={styles.userDetails}>
                            <Text style={styles.userEmailOnly}>{user.email}</Text>
                            <Text style={styles.userWarning}>{t('createGroupModal.userNotRegistered')}</Text>
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveEmail(user.email)}>
                          <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer with Create Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
              disabled={isCreating || !groupName.trim() || !totalBetAmount.trim() || !isValidAmount || validatedUsers.length === 0}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.createButtonGradient, 
                  (isCreating || !groupName.trim() || !totalBetAmount.trim() || !isValidAmount || validatedUsers.length === 0) && styles.createButtonDisabled
                ]}
              >
                {isCreating ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.createButtonText}>{t('createGroupModal.confirming')}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>{t('createGroupModal.confirmGroup')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


