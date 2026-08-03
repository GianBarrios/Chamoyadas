import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import CajaScreen from './screens/CajaScreen';
import VentasScreen from './screens/VentasScreen';
import ProductosScreen from './screens/ProductosScreen';
import InventarioScreen from './screens/InventarioScreen';
import GastosScreen from './screens/GastosScreen';
import DashboardScreen from './screens/DashboardScreen';
import AjustesScreen from './screens/AjustesScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { colors } from './constants/theme';
import { useResponsive } from './utils/responsive';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { CategoriesProvider, useCategories } from './context/CategoriesContext';

const Tab = createBottomTabNavigator();

const ICONS = {
  Dashboard: 'stats-chart-outline',
  Caja: 'cash-outline',
  Ventas: 'cart-outline',
  Productos: 'pricetags-outline',
  Inventario: 'cube-outline',
  Gastos: 'wallet-outline',
};

function AjustesButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
      <Ionicons name="settings-outline" size={22} color={colors.blanco} />
    </TouchableOpacity>
  );
}

function Navigation() {
  const insets = useSafeAreaInsets();
  const { isSmall } = useResponsive();
  const { settings } = useSettings();
  const [ajustesVisible, setAjustesVisible] = useState(false);
  const tabBarBaseHeight = isSmall ? 54 : 60;

  return (
    <>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.tamarindo} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: colors.tamarindo, elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { color: colors.blanco, fontWeight: '800', letterSpacing: 0.3, fontSize: isSmall ? 16 : 18 },
            headerTintColor: colors.blanco,
            tabBarActiveTintColor: colors.chamoy,
            tabBarInactiveTintColor: colors.carbonSuave,
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
              backgroundColor: colors.blanco,
              borderTopColor: colors.linea,
              height: tabBarBaseHeight + insets.bottom,
              paddingBottom: Math.max(insets.bottom, 6),
              paddingTop: 6,
            },
            tabBarLabelStyle: { fontSize: isSmall ? 9 : 10.5, fontWeight: '700' },
            tabBarIcon: ({ color }) => (
              <Ionicons name={ICONS[route.name]} size={isSmall ? 17 : 19} color={color} />
            ),
          })}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: settings?.businessName || 'Dashboard',
              headerRight: () => <AjustesButton onPress={() => setAjustesVisible(true)} />,
            }}
          />
          <Tab.Screen name="Ventas" component={VentasScreen} options={{ title: 'Registrar venta' }} />
          <Tab.Screen name="Gastos" component={GastosScreen} options={{ title: 'Gastos' }} />
          <Tab.Screen name="Productos" component={ProductosScreen} options={{ title: 'Productos' }} />
          <Tab.Screen name="Inventario" component={InventarioScreen} options={{ title: 'Inventario' }} />
          <Tab.Screen name="Caja" component={CajaScreen} options={{ title: 'Caja del día' }} />
        </Tab.Navigator>
      </NavigationContainer>

      <Modal visible={ajustesVisible} animationType="slide" onRequestClose={() => setAjustesVisible(false)}>
        <SafeAreaView style={styles.ajustesSafe} edges={['top', 'bottom']}>
          <View style={styles.ajustesHeader}>
            <Text style={styles.ajustesTitulo}>Ajustes</Text>
            <TouchableOpacity onPress={() => setAjustesVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.blanco} />
            </TouchableOpacity>
          </View>
          <AjustesScreen />
        </SafeAreaView>
      </Modal>
    </>
  );
}

function Root() {
  const { loading: settingsLoading, onboarded } = useSettings();
  const { loading: categoriesLoading } = useCategories();

  if (settingsLoading || categoriesLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.chamoy} />
      </View>
    );
  }

  if (!onboarded) {
    return <OnboardingScreen />;
  }

  return <Navigation />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <CategoriesProvider>
          <Root />
        </CategoriesProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.crema },
  ajustesSafe: { flex: 1, backgroundColor: colors.crema },
  ajustesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.tamarindo, paddingHorizontal: 16, paddingVertical: 14 },
  ajustesTitulo: { color: colors.blanco, fontWeight: '800', fontSize: 18, letterSpacing: 0.3 },
});
