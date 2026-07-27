import { create } from 'zustand';

interface GlobalModalState {
  isTaskModalOpen: boolean;
  openTaskModal: () => void;
  closeTaskModal: () => void;
}

export const useGlobalModalStore = create<GlobalModalState>((set) => ({
  isTaskModalOpen: false,
  openTaskModal: () => set({ isTaskModalOpen: true }),
  closeTaskModal: () => set({ isTaskModalOpen: false }),
}));
