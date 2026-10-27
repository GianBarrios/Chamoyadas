import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../constants/theme';
import { formatMoney, formatTime, todayKey, dayLabel, lastNDays } from '../utils/format';
import { loadCollection } from '../utils/data';

export default function DashboardScreen() {
  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      Promise.all([loadCollection('ventas'), loadCollection('gastos')]).then(([v, g]) => {
        if (activo) {
          setVentas(v);
          setGastos(g);
        }
      });
      return () => {
        activo = false;
      };
    }, [])
  );

  const ventasHoy = useMemo(() => ventas.filter((v) => todayKey(v.fecha) === todayKey()), [ventas]);
  const gastosHoy = useMemo(() => gastos.filter((g) => todayKey(g.fecha) === todayKey()), [gastos]);

  const totalVentas = ventasHoy.reduce((sum, v) => sum + v.total, 0);
  const totalGastos = gastosHoy.reduce((sum, g) => sum + g.monto, 0);
  const gananciaNeta = totalVentas - totalGastos;
  const ticketPromedio = ventasHoy.length ? totalVentas / ventasHoy.length : 0;

  const dias = lastNDays(7);
  const porDia = dias.map((d) => {
    const key = todayKey(d);
    const total = ventas.filter((v) => todayKey(v.fecha) === key).reduce((sum, v) => sum + v.total, 0);
    return { key, total, esHoy: key === todayKey() };
  });
  const maxDia = Math.max(1, ...porDia.map((d) => d.total));

  const actividad = [
    ...ventas.map((v) => ({ tipo: 'venta', texto: `Venta · ${v.items?.[0]?.nombre || 'Producto'}${v.items?.length > 1 ? ` +${v.items.length - 1}` : ''}`, fecha: v.fecha })),
    ...gastos.map((g) => ({ tipo: 'gasto', texto: `Gasto · ${g.concepto}`, fecha: g.fecha })),
  ]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Ventas de hoy</Text>
        <Text style={styles.heroNum}>{formatMoney(totalVentas)}</Text>
        <Text style={styles.heroSub}>
          {ventasHoy.length} {ventasHoy.length === 1 ? 'ticket' : 'tickets'} · promedio {formatMoney(ticketPromedio)}
        </Text>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statTile}>
          <Text style={styles.label}>Gastos hoy</Text>
          <Text style={[styles.statAmount, { color: colors.peligro }]}>{formatMoney(totalGastos)}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.label}>Ganancia neta</Text>
          <Text style={[styles.statAmount, { color: gananciaNeta >= 0 ? colors.exito : colors.peligro }]}>{formatMoney(gananciaNeta)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Últimos 7 días</Text>
        <View style={styles.chart}>
          {porDia.map((d) => (
            <View key={d.key} style={styles.barWrap}>
              <View style={[styles.bar, { height: `${Math.max(6, (d.total / maxDia) * 100)}%`, backgroundColor: d.esHoy ? colors.chamoy : colors.linea }]} />
              <Text style={styles.barLabel}>{dayLabel(d.key)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Actividad reciente</Text>
        {actividad.length === 0 ? (
          <Text style={styles.vacio}>Todavía no hay movimientos hoy.</Text>
        ) : (
          actividad.map((a, idx) => (
            <View key={idx} style={[styles.activityItem, idx === 0 && styles.sinBorde]}>
              <View style={[styles.dot, { backgroundColor: a.tipo === 'venta' ? colors.exito : colors.peligro }]} />
              <Text style={styles.activityTexto}>{a.texto}</Text>
              <Text style={styles.activityHora}>{formatTime(a.fecha)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.crema },
  content: { padding: spacing.lg, gap: spacing.md },
  hero: { backgroundColor: colors.tamarindo, borderRadius: radius.xl, padding: spacing.lg },
  heroLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroNum: { fontSize: 32, fontWeight: '800', color: colors.blanco, marginTop: 2 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 6 },
  statGrid: { flexDirection: 'row', gap: spacing.sm },
  statTile: { flex: 1, backgroundColor: colors.blanco, borderWidth: 1, borderColor: colors.linea, borderRadius: radius.lg, padding: spacing.md },
  statAmount: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  card: { backgroundColor: colors.blanco, borderWidth: 1, borderColor: colors.linea, borderRadius: radius.lg, padding: spacing.md },
  label: { fontSize: 11, fontWeight: '800', color: colors.carbonSuave, textTransform: 'uppercase', letterSpacing: 0.4 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 64, marginTop: spacing.sm, gap: 7 },
  barWrap: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 5 },
  bar: { width: '100%', borderRadius: 5 },
  barLabel: { fontSize: 9, fontWeight: '700', color: colors.carbonSuave },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.linea, marginTop: 4 },
  sinBorde: { borderTopWidth: 0, marginTop: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  activityTexto: { flex: 1, fontSize: 12.5, color: colors.carbonSuave },
  activityHora: { fontSize: 11, color: colors.carbonClaro },
  vacio: { textAlign: 'center', color: colors.carbonClaro, fontSize: 13, marginTop: spacing.sm },
});
