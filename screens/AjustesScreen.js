import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { useCategories } from '../context/CategoriesContext';

export default function AjustesScreen() {
  const { settings, updateSettings } = useSettings();
  const { categories, addCategory, removeCategory } = useCategories();
  const [nombre, setNombre] = useState(settings.businessName);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const guardarNombre = () => updateSettings({ businessName: nombre.trim() });

  const agregarCategoria = () => {
    addCategory(nuevaCategoria);
    setNuevaCategoria('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nombre del negocio</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.flex1]}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre del negocio"
          placeholderTextColor={colors.carbonClaro}
        />
        <TouchableOpacity style={styles.botonIcono} onPress={guardarNombre}>
          <Ionicons name="checkmark" size={20} color={colors.blanco} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Categorías de gastos</Text>
      <View style={styles.chipsWrap}>
        {categories.map((cat) => (
          <View key={cat} style={styles.chip}>
            <Text style={styles.chipTexto}>{cat}</Text>
            <TouchableOpacity onPress={() => removeCategory(cat)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="close" size={14} color={colors.carbonSuave} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.flex1]}
          value={nuevaCategoria}
          onChangeText={setNuevaCategoria}
          placeholder="Nueva categoría"
          placeholderTextColor={colors.carbonClaro}
          onSubmitEditing={agregarCategoria}
        />
        <TouchableOpacity style={styles.botonIcono} onPress={agregarCategoria}>
          <Ionicons name="add" size={20} color={colors.blanco} />
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Chamoy Control · v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.crema },
  content: { padding: spacing.lg, gap: spacing.sm },
  label: { fontSize: 11, fontWeight: '800', color: colors.carbonSuave, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: spacing.md, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex1: { flex: 1 },
  input: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.linea,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 14,
  },
  botonIcono: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.chamoy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.linea,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipTexto: { fontSize: 12, fontWeight: '700', color: colors.carbonSuave },
  version: { textAlign: 'center', fontSize: 11, color: colors.carbonClaro, marginTop: spacing.xl },
});
