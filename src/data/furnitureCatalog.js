export const FURNITURE_CATALOG_VERSION = "StyleMatch.FurnitureEnvelope/1.0";

export const FURNITURE_CATALOG = [
  { id: "sofa-3-seat", name: "三人沙發", category: "seating", width: 2100, depth: 900 },
  { id: "sofa-2-seat", name: "雙人沙發", category: "seating", width: 1600, depth: 850 },
  { id: "coffee-table", name: "茶几", category: "table", width: 1200, depth: 600 },
  { id: "tv-console", name: "電視櫃", category: "storage", width: 1800, depth: 450 },
  { id: "dining-table-4", name: "四人餐桌", category: "table", width: 1400, depth: 800 },
  { id: "dining-table-6", name: "六人餐桌", category: "table", width: 1800, depth: 900 },
  { id: "double-bed", name: "雙人床", category: "bed", width: 1880, depth: 2120 },
  { id: "queen-bed", name: "加大雙人床", category: "bed", width: 2000, depth: 2120 },
  { id: "wardrobe", name: "衣櫃", category: "storage", width: 1800, depth: 600 },
  { id: "desk", name: "工作桌", category: "desk", width: 1200, depth: 600 },
];

export function createFurniturePlacement(catalogId, index, roomId = "room-1") {
  const item = FURNITURE_CATALOG.find((entry) => entry.id === catalogId) || FURNITURE_CATALOG[0];
  return { id: `${item.id}-${index}`, catalog_id: item.id, catalog_version: FURNITURE_CATALOG_VERSION, name: item.name, category: item.category, room_id: roomId, x: 500, y: 500, width: item.width, depth: item.depth, rotation: 0 };
}
