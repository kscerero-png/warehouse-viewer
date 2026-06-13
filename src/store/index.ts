import { create } from 'zustand';
import { createInventorySlice, type InventoryState } from './inventorySlice';
import { createUiSlice, type UiState } from './uiSlice';
import { createThreeSlice, type ThreeState } from './threeSlice';

export type AppStore = InventoryState & UiState & ThreeState;

export const useStore = create<AppStore>()((set, get) => ({
  ...createInventorySlice(set, get),
  ...createUiSlice(set),
  ...createThreeSlice(set),
}));
