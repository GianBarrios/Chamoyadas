import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../constants/theme';
import { loadCollection, saveCollection, makeId } from '../utils/data';

export default function InventarioScreen() {
  const [items, setItems] = useState([]);
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState('');
  const [stock, setStock] = useState('');
  const [minimo, setMinimo] = useState('');

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      loadCollection('inventario').then((data) => {
        if (activo) setItems(data);
      });
      return () => {
        activo = false;
      };
    }, [])
  );

  const persistir = (next) => {
    setItems(next);
    saveCollection('inventario', next);
  };

  const agregar = () => {
    const stockNum = parseFloat(stock);
    const minimoNum = parseFloat(minimo) || 0;
    if (!nombre.trim() || isNaN(stockNum)) return;
    const nuevo = { id: makeId(), nombre: nombre.trim(), unidad: unidad.trim() || 'pz', stock: stockNum, minimo: minimoNum };
    persistir([...items, nuevo]);
    setNombre('');
    setUnidad('');
    setStock('');
    setMinimo('');
  };

  const ajustarStock = (id, delta) => {
    persistir(items.map((i) => (i.id === id ? { ...i, stock: Math.max(0, +(i.stock + delta).toFixed(2)) } : i)));
  };

  const eliminar = (id) => persistir(items.filter((i) => i.id !== id));

  const bajos = items.filter((i) => i.stock < i.minimo);
  const ok = items.filter((i) => i.stock >= i.minimo);

  const renderFila = (item) => {
    const esBajo = item.stock < item.minimo;
    const pct = item.minimo > 0 ? Math.min(100, (item.stock / item.minimo) * 100) : 100;
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <View style={[styles.badge, esBajo ? styles.badgeWarn : styles.badgeOk]}>
            <Text style={[styles.badgeTexto, { color: esBajo ? colors.alerta : colors.exito }]}>
              {esBajo ? 'Bajo' : 'Ok'}
            </Text>
          </View>
        </View>
        <Text style={styles.muted}>
          {item.stock} {item.unidad} de {item.minimo} {item.unidad} mínimo
        </Text>
        <View style={styles.barraFondo}>
          <View style={[styles.barra, { width: `${pct}%`, backgroundColor: esBajo ? colors.alerta : colors.exito }]} />
        </View>
        <View style={styles.acciones}>
          <TouchableOpacity style={styles.botonAjuste} onPress={() => ajustarStock(item.id, -1)}>
            <Ionicons name="remove" size={16} color={colors.carbonSuave} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonAjuste} onPress={() => ajustarStock(item.id, 1)}>
            <Ionicons name="add" size={16} color={colors.carbonSuave} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonAjuste} onPress={() => eliminar(item.id)}>
            <Ionicons name="trash-outline" size={16} color={colors.carbonClaro} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.lista}
      data={[]}
      ListHeaderComponent={
        <View>
          <View style={styles.form}>
            <Text style={styles.label}>Nuevo insumo</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.flex2]} placeholder="Nombre" placeholderTextColor={colors.carbonClaro} value={nombre} onChangeText={setNombre} />
              <TextInput style={[styles.input, styles.flex1]} placeholder="Unidad" placeholderTextColor={colors.carbonClaro} value={unidad} onChangeText={setUnidad} />
            </View>
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.flex1]} placeholder="Stock actual" placeholderTextColor={colors.carbonClaro} keyboardType="decimal-pad" value={stock} onChangeText={setStock} />
              <TextInput style={[styles.input, styles.flex1]} placeholder="Mínimo" placeholderTextColor={colors.carbonClaro} keyboardType="decimal-pad" value={minimo} onChangeText={setMinimo} />
              <TouchableOpacity style={styles.botonAgregar} onPress={agregar}>
                <Ionicons name="add" size={20} color={colors.blanco} />
              </TouchableOpacity>
            </View>
          </View>

          {bajos.length > 0 && (
            <>
              <Text style={styles.label}>Insumos a reponer</Text>
              {bajos.map(renderFila)}
            </>
          )}

          <Text style={styles.label}>En buen nivel</Text>
          {ok.length ? ok.map(renderFila) : <Text style={styles.vacio}>Nada por aquí todavía.</Text>}
        </View>
      }
      renderItem={null}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.crema },
  lista: { padding: spacing.lg, gap: spacing.sm },
  form: { marginBottom: spacing.sm },
  label: { fontSize: 11, fontWeight: '800', color: colors.carbonSuave, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing.xs, marginTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'center' },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  input: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.linea,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 14,
  },
  botonAgregar: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.chamoy, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.blanco, borderWidth: 1, borderColor: colors.linea, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombre: { fontSize: 13.5, fontWeight: '700', color: colors.tamarindoOscuro },
  muted: { fontSize: 12, color: colors.carbonSuave, marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeOk: { backgroundColor: colors.exitoFondo },
  badgeWarn: { backgroundColor: colors.alertaFondo },
  badgeTexto: { fontSize: 10, fontWeight: '800' },
  barraFondo: { height: 5, borderRadius: 4, backgroundColor: colors.linea, marginTop: 8, overflow: 'hidden' },
  barra: { height: '100%', borderRadius: 4 },
  acciones: { flexDirection: 'row', gap: spacing.xs, marginTop: 8, justifyContent: 'flex-end' },
  botonAjuste: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.crema, alignItems: 'center', justifyContent: 'center' },
  vacio: { textAlign: 'center', color: colors.carbonClaro, fontSize: 13, marginTop: spacing.sm },
});
