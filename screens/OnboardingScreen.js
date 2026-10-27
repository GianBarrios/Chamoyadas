import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

export default function OnboardingScreen() {
  const { completeOnboarding } = useSettings();
  const [nombre, setNombre] = useState('');

  const comenzar = () => {
    if (!nombre.trim()) return;
    completeOnboarding({ businessName: nombre.trim() });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="cafe-outline" size={32} color={colors.blanco} />
          </View>
          <Text style={styles.titulo}>Bienvenido a Chamoy Control</Text>
          <Text style={styles.subtitulo}>
            Lleva el control de tus ventas, gastos, inventario y caja — todo en un solo lugar.
          </Text>

          <Text style={styles.label}>¿Cómo se llama tu negocio?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Chamoyadas Doña Gaby"
            placeholderTextColor={colors.carbonClaro}
            value={nombre}
            onChangeText={setNombre}
            returnKeyType="done"
            onSubmitEditing={comenzar}
          />

          <TouchableOpacity
            style={[styles.boton, !nombre.trim() && styles.botonDeshabilitado]}
            onPress={comenzar}
            disabled={!nombre.trim()}
          >
            <Text style={styles.botonTexto}>Comenzar</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.blanco} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.crema },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.tamarindo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.tamarindo, marginBottom: spacing.sm },
  subtitulo: { fontSize: 14, color: colors.carbonSuave, lineHeight: 20, marginBottom: spacing.xl },
  label: { fontSize: 12, fontWeight: '800', color: colors.carbonSuave, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.linea,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  boton: {
    backgroundColor: colors.chamoy,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  botonDeshabilitado: { backgroundColor: colors.carbonClaro },
  botonTexto: { color: colors.blanco, fontWeight: '800', fontSize: 15, marginRight: 4 },
});
