import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../constants/theme';
import { formatMoney } from '../utils/format';
import { loadCollection, saveCollection, makeId } from '../utils/data';

export default function VentasScreen() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [carrito, setCarrito] = useState({});

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      Promise.all([loadCollection('productos'), loadCollection('ventas')]).then(([p, v]) => {
        if (activo) {
          setProductos(p);
          setVentas(v);
        }
      });
      return () => {
        activo = false;
      };
    }, [])
  );

  const agregar = (producto) => {
    setCarrito((prev) => ({
      ...prev,
      [producto.id]: { producto, cantidad: (prev[producto.id]?.cantidad || 0) + 1 },
    }));
  };

  const quitarUno = (id) => {
    setCarrito((prev) => {
      const actual = prev[id];
      if (!actual) return prev;
      if (actual.cantidad <= 1) {
        const { [id]: _omitido, ...resto } = prev;
        return resto;
      }
      return { ...prev, [id]: { ...actual, cantidad: actual.cantidad - 1 } };
    });
  };

  const items = Object.values(carrito);
  const total = items.reduce((sum, it) => sum + it.producto.precio * it.cantidad, 0);
  const cantidadTotal = items.reduce((sum, it) => sum + it.cantidad, 0);

  const cobrar = () => {
    if (total === 0) return;
    const venta = {
      id: makeId(),
      fecha: new Date().toISOString(),
      items: items.map((it) => ({ nombre: it.producto.nombre, precio: it.producto.precio, cantidad: it.cantidad })),
      total,
    };
    const next = [...ventas, venta];
    setVentas(next);
    saveCollection('ventas', next);
    setCarrito({});
    Alert.alert('Venta registrada', `Se cobraron ${formatMoney(total)}.`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columna}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={<Text style={styles.label}>Toca para agregar</Text>}
        ListEmptyComponent={<Text style={styles.vacio}>Agrega productos en la pestaña Productos.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.prodBtn} onPress={() => agregar(item)}>
            <Text style={styles.prodNombre}>{item.nombre}</Text>
            <Text style={styles.prodPrecio}>{formatMoney(item.precio)}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.cuentaCard}>
            <View style={styles.cuentaHeader}>
              <Text style={styles.label}>Cuenta actual</Text>
              <Text style={styles.muted}>{cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}</Text>
            </View>
            {items.length === 0 ? (
              <Text style={styles.vacio}>Sin productos todavía</Text>
            ) : (
              items.map((it) => (
                <TouchableOpacity key={it.producto.id} style={styles.cartRow} onPress={() => quitarUno(it.producto.id)}>
                  <Text style={styles.cartTexto}>{it.cantidad} × {it.producto.nombre}</Text>
                  <Text style={styles.cartMonto}>{formatMoney(it.producto.precio * it.cantidad)}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        }
      />
      <TouchableOpacity style={[styles.payBtn, total === 0 && styles.payBtnDisabled]} onPress={cobrar} disabled={total === 0}>
        <Text style={styles.payBtnTexto}>Cobrar {formatMoney(total)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.crema },
  lista: { padding: spacing.lg, paddingBottom: 90, gap: spacing.sm },
  columna: { gap: spacing.sm },
  label: { fontSize: 11, fontWeight: '800', color: colors.carbonSuave, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing.xs },
  muted: { fontSize: 12, color: colors.carbonSuave },
  prodBtn: {
    flex: 1,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.linea,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  prodNombre: { fontSize: 12.5, fontWeight: '700', color: colors.tamarindoOscuro },
  prodPrecio: { fontSize: 12, fontWeight: '800', color: colors.chamoyOscuro, marginTop: 3 },
  cuentaCard: { backgroundColor: colors.blanco, borderWidth: 1, borderColor: colors.linea, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  cuentaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.linea },
  cartTexto: { fontSize: 12.5, color: colors.carbonSuave },
  cartMonto: { fontSize: 13, fontWeight: '800', color: colors.tamarindoOscuro },
  vacio: { textAlign: 'center', color: colors.carbonClaro, fontSize: 12.5, paddingVertical: 8 },
  payBtn: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.chamoy,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payBtnDisabled: { backgroundColor: colors.carbonClaro },
  payBtnTexto: { color: colors.blanco, fontWeight: '800', fontSize: 14.5 },
});
