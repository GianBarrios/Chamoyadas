import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../constants/theme';
import { formatMoney, todayKey } from '../utils/format';
import { loadCollection, saveCollection } from '../utils/data';
import { useSettings } from '../context/SettingsContext';

export default function CajaScreen() {
  const { settings } = useSettings();
  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [cajas, setCajas] = useState([]);
  const [contado, setContado] = useState('');
  const [resultado, setResultado] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      Promise.all([loadCollection('ventas'), loadCollection('gastos'), loadCollection('caja')]).then(([v, g, c]) => {
        if (activo) {
          setVentas(v);
          setGastos(g);
          setCajas(c);
          const cierreHoy = c.find((cx) => cx.fecha === todayKey());
          setResultado(cierreHoy || null);
          setContado(cierreHoy ? String(cierreHoy.contado) : '');
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
  const apertura = settings.aperturaDefault || 0;
  const esperado = apertura + totalVentas - totalGastos;

  const cerrarCaja = () => {
    const contadoNum = parseFloat(contado);
    if (isNaN(contadoNum)) return;
    const diferencia = +(contadoNum - esperado).toFixed(2);
    const registro = { fecha: todayKey(), apertura, ventas: totalVentas, gastos: totalGastos, esperado, contado: contadoNum, diferencia };
    const next = [...cajas.filter((c) => c.fecha !== todayKey()), registro];
    setCajas(next);
    saveCollection('caja', next);
    setResultado(registro);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Corte de caja · hoy</Text>
        <View style={styles.linea}>
          <Text style={styles.muted}>Apertura de caja</Text>
          <Text style={styles.amount}>{formatMoney(apertura)}</Text>
        </View>
        <View style={styles.linea}>
          <Text style={styles.muted}>+ Ventas del día ({ventasHoy.length})</Text>
          <Text style={[styles.amount, { color: colors.exito }]}>{formatMoney(totalVentas)}</Text>
        </View>
        <View style={styles.linea}>
          <Text style={styles.muted}>− Gastos del día ({gastosHoy.length})</Text>
          <Text style={[styles.amount, { color: colors.peligro }]}>{formatMoney(totalGastos)}</Text>
        </View>
        <View style={[styles.linea, styles.lineaTotal]}>
          <Text style={styles.labelTotal}>Efectivo esperado</Text>
          <Text style={styles.amountTotal}>{formatMoney(esperado)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Cerrar caja</Text>
        <TextInput
          style={styles.input}
          placeholder="Efectivo contado al cierre"
          placeholderTextColor={colors.carbonClaro}
          keyboardType="decimal-pad"
          value={contado}
          onChangeText={setContado}
        />
        <TouchableOpacity style={styles.botonCerrar} onPress={cerrarCaja}>
          <Text style={styles.botonCerrarTexto}>Cerrar caja</Text>
        </TouchableOpacity>

        {resultado && (
          <View
            style={[
              styles.diffBox,
              { backgroundColor: resultado.diferencia === 0 ? colors.exitoFondo : colors.alertaFondo },
            ]}
          >
            <Text style={{ color: resultado.diferencia === 0 ? colors.exito : colors.alerta, fontWeight: '700', fontSize: 12.5 }}>
              {resultado.diferencia === 0
                ? 'Caja cerrada. Sin diferencias — todo cuadra.'
                : `Caja cerrada con una diferencia de ${resultado.diferencia > 0 ? '+' : ''}${formatMoney(resultado.diferencia)}.`}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.crema },
  content: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.blanco, borderWidth: 1, borderColor: colors.linea, borderRadius: radius.lg, padding: spacing.md },
  label: { fontSize: 11, fontWeight: '800', color: colors.carbonSuave, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing.sm },
  linea: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  lineaTotal: { borderTopWidth: 1, borderTopColor: colors.linea, marginTop: 4, paddingTop: 10 },
  muted: { fontSize: 13, color: colors.carbonSuave },
  amount: { fontSize: 13, fontWeight: '800', color: colors.tamarindoOscuro },
  labelTotal: { fontSize: 14.5, fontWeight: '800', color: colors.tamarindoOscuro },
  amountTotal: { fontSize: 16, fontWeight: '800', color: colors.tamarindoOscuro },
  input: {
    backgroundColor: colors.crema,
    borderWidth: 1,
    borderColor: colors.linea,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  botonCerrar: { backgroundColor: colors.tamarindo, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  botonCerrarTexto: { color: colors.blanco, fontWeight: '800', fontSize: 13.5 },
  diffBox: { marginTop: spacing.sm, borderRadius: radius.sm, padding: 10 },
});
