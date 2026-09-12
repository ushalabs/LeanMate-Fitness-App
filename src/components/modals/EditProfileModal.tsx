import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X, User, Check, Camera } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useUIStore } from '../../store/useUIStore';
import { useFitnessStore } from '../../store/useFitnessStore';
import { ActivityLevel, TrainingIntensity } from '../../types/user';

export const EditProfileModal: React.FC = () => {
  const { isEditProfileModalOpen, closeEditProfileModal } = useUIStore();
  const { user, updateUserProfile } = useFitnessStore();

  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [height, setHeight] = useState(user.height.toString());
  const [weight, setWeight] = useState(user.currentWeight.toString());
  const [activity, setActivity] = useState<ActivityLevel>(user.activityLevel);
  const [intensity, setIntensity] = useState<TrainingIntensity>(user.trainingIntensity);
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || '');
  const [saved, setSaved] = useState(false);
  const initials = (fullName || username || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!isEditProfileModalOpen) return;
    setFullName(user.fullName);
    setUsername(user.username);
    setHeight(user.height.toString());
    setWeight(user.currentWeight.toString());
    setActivity(user.activityLevel);
    setIntensity(user.trainingIntensity);
    setProfilePhoto(user.profilePhoto || '');
    setSaved(false);
  }, [isEditProfileModalOpen, user]);

  const pickProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to update your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.45,
      base64: true,
    });

    const asset = result.canceled ? null : result.assets[0];
    if (asset?.uri && asset.base64) {
      setProfilePhoto(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
    } else if (asset?.uri) {
      Alert.alert('Photo not ready', 'Please choose the image again so LeanMate can prepare it for upload.');
    }
  };

  const handleSave = async () => {
    const h = parseInt(height, 10) || user.height;
    const w = parseFloat(weight) || user.currentWeight;

    try {
      await updateUserProfile(
        {
          fullName,
          username,
          profilePhoto: profilePhoto || undefined,
          height: h,
          currentWeight: w,
          activityLevel: activity,
          trainingIntensity: intensity,
        },
        { recordWeightChange: true }
      );

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        closeEditProfileModal();
      }, 900);
    } catch (e: any) {
      Alert.alert('Profile not saved', e?.message || 'Please try again.');
    }
  };

  return (
    <Modal visible={isEditProfileModalOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <User size={18} color="#7C3AED" />
              </View>
              <Text style={styles.title}>Edit Profile & Metrics</Text>
            </View>
            <TouchableOpacity onPress={closeEditProfileModal} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {saved ? (
            <View style={styles.successState}>
              <View style={[styles.successIcon, { backgroundColor: '#7C3AED' }]}>
                <Check size={28} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>Profile Updated!</Text>
              <Text style={styles.successSubtitle}>Maintenance calories recalculated</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
              <TouchableOpacity style={styles.photoPicker} onPress={pickProfilePhoto} activeOpacity={0.85}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.previewAvatar} />
                ) : (
                  <View style={styles.previewAvatarFallback}>
                    <Text style={styles.previewAvatarText}>{initials}</Text>
                  </View>
                )}
                <View style={styles.photoCopy}>
                  <Text style={styles.photoTitle}>Profile Picture</Text>
                  <Text style={styles.photoSubtitle}>Tap to choose a square photo</Text>
                </View>
                <View style={styles.cameraBtn}>
                  <Camera size={17} color="#5B21B6" />
                </View>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your full name"
                  placeholderTextColor={THEME.colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.textInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="your_username"
                  placeholderTextColor={THEME.colors.textMuted}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Current Weight (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Activity Level */}
              <Text style={styles.sectionHeader}>Activity Level</Text>
              <View style={styles.chipsRow}>
                {(['low', 'moderate', 'high', 'very_high'] as ActivityLevel[]).map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.chip, activity === a && styles.chipActive]}
                    onPress={() => setActivity(a)}
                  >
                    <Text style={[styles.chipText, activity === a && styles.chipTextActive]}>
                      {a.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Training Intensity */}
              <Text style={styles.sectionHeader}>Training Intensity</Text>
              <View style={styles.chipsRow}>
                {(['low', 'moderate', 'high', 'very_high'] as TrainingIntensity[]).map((ti) => (
                  <TouchableOpacity
                    key={ti}
                    style={[styles.chip, intensity === ti && styles.chipActive]}
                    onPress={() => setIntensity(ti)}
                  >
                    <Text style={[styles.chipText, intensity === ti && styles.chipTextActive]}>
                      {ti.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Profile Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 24, 63, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: '#F3EFFF',
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  scrollArea: {
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DDD2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: THEME.spacing.md,
  },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    marginBottom: THEME.spacing.lg,
  },
  previewAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  previewAvatarFallback: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(192, 132, 252, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarText: {
    color: '#5B21B6',
    fontSize: 18,
    fontWeight: '900',
  },
  photoCopy: {
    flex: 1,
    minWidth: 0,
  },
  photoTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  photoSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  cameraBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(192, 132, 252, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionHeader: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: THEME.spacing.md,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  chipActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#DDD2FF',
  },
  chipText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#5B21B6',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: THEME.spacing.md,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  successSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
});
