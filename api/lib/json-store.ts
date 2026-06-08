import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, '../../data/foods.json');

interface Food {
  id: number;
  name: string;
  category: 'breakfast' | 'main' | 'snack';
  calories: number;
  source: string;
  tags: string;
  imageUrl: string | null;
  createdAt: string;
}

let foods: Food[] = [];
let nextId = 1;

function load(): Food[] {
  if (!existsSync(DATA_FILE)) return [];
  const raw = readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function save(data: Food[]) {
  const dir = path.dirname(DATA_FILE);
  if (!existsSync(dir)) {
    const fs = require('fs');
    fs.mkdirSync(dir, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  foods = data;
}

// Initialize with seed data
const hasData = existsSync(DATA_FILE);
foods = hasData ? load() : [];

export function list() {
  foods = load();
  return foods;
}

export function getById(id: number) {
  foods = load();
  return foods.find(f => f.id === id) ?? null;
}

export function getByCategory(category: string) {
  foods = load();
  return foods.filter(f => f.category === category);
}

export function randomByCategory(category: string) {
  const filtered = getByCategory(category);
  if (filtered.length === 0) return null;
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}

export function create(data: Omit<Food, 'id' | 'createdAt'>) {
  foods = load();
  const maxId = foods.reduce((max, f) => Math.max(max, f.id), 0);
  const item: Food = {
    ...data,
    id: maxId + 1,
    createdAt: new Date().toISOString(),
  };
  foods.push(item);
  save(foods);
  return item;
}

export function update(id: number, data: Partial<Omit<Food, 'id' | 'createdAt'>>) {
  foods = load();
  const idx = foods.findIndex(f => f.id === id);
  if (idx === -1) return null;
  foods[idx] = { ...foods[idx], ...data };
  save(foods);
  return foods[idx];
}

export function remove(id: number) {
  foods = load();
  const len = foods.length;
  foods = foods.filter(f => f.id !== id);
  if (foods.length === len) return false;
  save(foods);
  return true;
}
