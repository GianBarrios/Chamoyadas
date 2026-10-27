import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../constants/theme';
import { formatMoney, todayKey } from '../utils/format';
import { loadCollection, saveCollection, makeId } from '../utils/data';
import { useCategories } from '../context/CategoriesContext';

export default function GastosScreen() {
  const { categories } = useCategories();
  const [gastos, setGastos] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(categories[0] || 'Otros');

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      loadCollection('gastos').then((data) => {
        if (activo) setGastos(data);
      });
      return () => {
        activo = false;
      };
    }, [])
  );

  const gastosHoy = useMemo(
    () => gastos.filter((g) => todayKey(g.fecha) === todayKey()).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    [gastos]
  );
  const totalHoy = gastosHoy.reduce((sum, g) => sum + g.monto, 0);

  const guardar = () => {
    const montoNum = parseFloat(monto);
    if (!concepto.trim() || !montoNum) return;
    const nuevo = { id: makeId(), concepto: concepto.trim(), monto: montoNum, categoria, fecha: new Date().toISOString() };
    const next = [...gastos, nuevo];
    setGastos(next);
    saveCollection('gastos', next);
    setConcepto('');
    setMonto('');
    setFormVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Gastos de hoy</Text>
        <TouchableOpacity style={styles.fab} onPress={() => setFormVisible((v) => !v)}>
          <Ionicons name={formVisible ? 'close' : 'add'} size={20} color={colors.blanco} />
        </TouchableOpacity>
      </View>

      {formVisible && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Concepto, ej. Hielo"
            placeholderTextColor={colors.carbonClaro}
            value={concepto}
            onChangeText={setConcepto}
          />
          <TextInput
            style={styles.input}
            placeholder="Monto"
            placeholderTextColor={colors.carbonClaro}
            keyboardType="decimal-pad"
            value={monto}
            onChangeText={setMonto}
          />
          <View style={styles.chipsRow}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat} style={[styles.chip, categoria === cat && styles.chipActivo]} onPress={() => setCategoria(cat)}>
                <Text style={[styles.chipTexto, categoria === cat && styles.chipTextoActivo]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.botonGuardar} onPress={guardar}>
            <Text style={styles.botonGuardarTexto}>Guardar gasto</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={gastosHoy}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vacio}>Sin gastos registrados hoy.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.flex1}>
              <Text style={styles.concepto}>{item.concepto}</Text>
              <Text style={styles.muted}>{item.categoria}</Text>
            </View>
            <Text style={styles.monto}>{formatMoney(item.monto)}</Text>
          </View>
        )}
        ListFooterComponent={
          gastosHoy.length > 0 ? (
            <View style={[styles.card, styles.cardTotal]}>
              <Text style={styles.labelTotal}>Total del día</Text>
              <Text style={styles.montoTotal}>{formatMoney(totalHoy)}</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.crema },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  label: { fontSize: 11, fontWeight: '800', color: colors.carbonSuave, textTransform: 'uppercase', letterSpacing: 0.4 },
  fab: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.chamoy, alignItems: 'center', justifyContent: 'center' },
  form: { marginHorizontal: spacing.lg, marginTop: spacing.sm, gap: spacing.sm },
  input: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.linea,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 14,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { backgroundColor: colors.blanco, borderWidth: 1, borderColor: colors.linea, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipActivo: { backgroundColor: colors.tamarindo, borderColor: colors.tamarindo },
  chipTexto: { fontSize: 12, fontWeight: '700', color: colors.carbonSuave },
  chipTextoActivo: { color: colors.blanco },
  botonGuardar: { backgroundColor: colors.chamoy, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  botonGuardarTexto: { color: colors.blanco, fontWeight: '800', fontSize: 13.5 },
  lista: { padding: spacing.lg, gap: spacing.sm },
  card: { backgroundColor: colors.blanco, borderWidth: 1, borderColor: colors.linea, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  flex1: { flex: 1 },
  concepto: { fontSize: 13.5, fontWeight: '700', color: colors.tamarindoOscuro },
  muted: { fontSize: 12, color: colors.carbonSuave, marginTop: 2 },
  monto: { fontSize: 14, fontWeight: '800', color: colors.peligro },
  cardTotal: { justifyContent: 'space-between', backgroundColor: colors.crema, borderStyle: 'dashed' },
  labelTotal: { fontSize: 12, fontWeight: '800', color: colors.carbonSuave },
  montoTotal: { fontSize: 16, fontWeight: '800', color: colors.peligro },
  vacio: { textAlign: 'center', color: colors.carbonClaro, fontSize: 13, marginTop: spacing.lg },
});
