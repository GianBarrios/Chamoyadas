import { getItem, setItem } from './storage';

const KEYS = {
  productos: '@chamoy_control/productos',
  inventario: '@chamoy_control/inventario',
  gastos: '@chamoy_control/gastos',
  ventas: '@chamoy_control/ventas',
  caja: '@chamoy_control/caja',
};

const SEEDS = {
  productos: [
    { id: 'p1', nombre: 'Chamoyada mango', precio: 45, categoria: 'Bebidas' },
    { id: 'p2', nombre: 'Mangonada', precio: 50, categoria: 'Bebidas' },
    { id: 'p3', nombre: 'Tamarindo loco', precio: 40, categoria: 'Bebidas' },
    { id: 'p4', nombre: 'Esquite preparado', precio: 35, categoria: 'Snacks' },
  ],
  inventario: [
    { id: 'i1', nombre: 'Chamoy (salsa)', unidad: 'L', stock: 3.5, minimo: 2 },
    { id: 'i2', nombre: 'Pulpa de tamarindo', unidad: 'kg', stock: 1.2, minimo: 2 },
    { id: 'i3', nombre: 'Mango congelado', unidad: 'kg', stock: 8, minimo: 3 },
    { id: 'i4', nombre: 'Vasos 16oz', unidad: 'pz', stock: 120, minimo: 100 },
  ],
  gastos: [],
  ventas: [],
  caja: [],
};

export async function loadCollection(name) {
  const stored = await getItem(KEYS[name], null);
  if (stored !== null) return stored;
  const seed = SEEDS[name] || [];
  await setItem(KEYS[name], seed);
  return seed;
}

export async function saveCollection(name, items) {
  await setItem(KEYS[name], items);
}

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
