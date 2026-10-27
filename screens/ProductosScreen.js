import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../constants/theme';
import { formatMoney } from '../utils/format';
import { loadCollection, saveCollection, makeId } from '../utils/data';

const CATEGORIAS = ['Bebidas', 'Snacks', 'Especiales'];

export default function ProductosScreen() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      loadCollection('productos').then((data) => {
        if (activo) setProductos(data);
      });
      return () => {
        activo = false;
      };
    }, [])
  );

  const agregar = () => {
    const precioNum = parseFloat(precio);
    if (!nombre.trim() || !precioNum) return;
    const nuevo = { id: makeId(), nombre: nombre.trim(), precio: precioNum, categoria };
    const next = [...productos, nuevo];
    setProductos(next);
    saveCollection('productos', next);
    setNombre('');
    setPrecio('');
  };

  const eliminar = (id) => {
    const next = productos.filter((p) => p.id !== id);
    setProductos(next);
    saveCollection('productos', next);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.form}>
            <Text style={styles.label}>Nuevo producto</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex2]}
                placeholder="Nombre"
                placeholderTextColor={colors.carbonClaro}
                value={nombre}
                onChangeText={setNombre}
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="Precio"
                placeholderTextColor={colors.carbonClaro}
                keyboardType="decimal-pad"
                value={precio}
                onChangeText={setPrecio}
              />
            </View>
            <View style={styles.chipsRow}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, categoria === cat && styles.chipActivo]}
                  onPress={() => setCategoria(cat)}
                >
                  <Text style={[styles.chipTexto, categoria === cat && styles.chipTextoActivo]}>{cat}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.botonAgregar} onPress={agregar}>
                <Ionicons name="add" size={18} color={colors.blanco} />
                <Text style={styles.botonAgregarTexto}>Agregar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Catálogo</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.flex1}>
              <Text style={styles.nombreProducto}>{item.nombre}</Text>
              <View style={styles.chipMini}>
                <Text style={styles.chipMiniTexto}>{item.categoria}</Text>
              </View>
            </View>
            <Text style={styles.precio}>{formatMoney(item.precio)}</Text>
            <TouchableOpacity onPress={() => eliminar(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={18} color={colors.carbonClaro} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vacio}>Todavía no agregas productos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.crema },
  lista: { padding: spacing.lg, gap: spacing.sm },
  form: { marginBottom: spacing.md },
  label: { fontSize: 11, fontWeight: '800', color: colors.carbonSuave, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing.xs, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm, alignItems: 'center' },
  chip: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.linea,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActivo: { backgroundColor: colors.tamarindo, borderColor: colors.tamarindo },
  chipTexto: { fontSize: 12, fontWeight: '700', color: colors.carbonSuave },
  chipTextoActivo: { color: colors.blanco },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.chamoy,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginLeft: 'auto',
  },
  botonAgregarTexto: { color: colors.blanco, fontSize: 12, fontWeight: '800' },
  card: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.linea,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nombreProducto: { fontSize: 14, fontWeight: '700', color: colors.tamarindoOscuro },
  chipMini: { alignSelf: 'flex-start', backgroundColor: colors.crema, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  chipMiniTexto: { fontSize: 10, fontWeight: '700', color: colors.carbonSuave },
  precio: { fontSize: 14, fontWeight: '800', color: colors.chamoyOscuro },
  vacio: { textAlign: 'center', color: colors.carbonClaro, fontSize: 13, marginTop: spacing.lg },
});
