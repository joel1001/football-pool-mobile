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

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  competitionId,
  competitionName,
  category,
  onClose,
  onCreate,
}) => {
  const [groupName, setGroupName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [validatedUsers, setValidatedUsers] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setGroupName('');
      setEmailInput('');
      setEmails([]);
      setValidatedUsers([]);
    }
  }, [visible]);

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
      Alert.alert('Email Inválido', 'Por favor ingresa un email válido');
      return;
    }
    
    // Check if email already added
    if (emails.includes(trimmedEmail)) {
      Alert.alert('Email Duplicado', 'Este email ya fue agregado');
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
      
      // Create group with validated users
      const existingUserIds = validatedUsers
        .filter(u => u.exists)
        .map(u => u.userId);
      
      const inviteEmails = validatedUsers
        .filter(u => !u.exists)
        .map(u => u.email);
      
      await onCreate(groupName || undefined, existingUserIds, inviteEmails);
      
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
            <Text style={styles.headerTitle}>Crear Grupo</Text>
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
              <Text style={styles.label}>Nombre del Grupo (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Amigos Mundial 2026"
                placeholderTextColor="rgba(26, 77, 58, 0.4)"
                value={groupName}
                onChangeText={setGroupName}
              />
              <Text style={styles.hint}>
                Si no ingresas un nombre, se generará automáticamente
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Agregar Participantes</Text>
              <View style={styles.emailInputContainer}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="email@ejemplo.com"
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
                <Text style={styles.validatingText}>Validando emails...</Text>
              </View>
            )}

            {validatedUsers.length > 0 && !isValidating && (
              <View style={styles.section}>
                <Text style={styles.label}>
                  Participantes ({validatedUsers.length})
                </Text>
                
                {/* Existing Users */}
                {existingCount > 0 && (
                  <View style={styles.userTypeSection}>
                    <Text style={styles.userTypeLabel}>
                      ✅ Usuarios registrados ({existingCount})
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
                      ⚠️ Recibirán invitación por email ({nonExistingCount})
                    </Text>
                    {validatedUsers.filter(u => !u.exists).map((user) => (
                      <View key={user.email} style={[styles.userCard, styles.userCardWarning]}>
                        <View style={styles.userInfo}>
                          <View style={[styles.userAvatar, styles.userAvatarWarning]}>
                            <Ionicons name="mail" size={20} color="#F97316" />
                          </View>
                          <View style={styles.userDetails}>
                            <Text style={styles.userEmailOnly}>{user.email}</Text>
                            <Text style={styles.userWarning}>Usuario no registrado</Text>
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
              disabled={isCreating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.createButtonGradient, isCreating && styles.createButtonDisabled]}
              >
                {isCreating ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Creando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Crear Grupo</Text>
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

