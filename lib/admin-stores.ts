export const ADMIN_STORES_STORAGE_KEY = "admin-managed-stores";

export type ManagedStore = {
  id: string;
  name: string;
  product: string;
  adminEmail: string;
  status: string;
};

const LEGACY_MOCK_STORE_IDS = new Set(["store-1", "store-2", "store-3", "store-4", "store-5"]);

export const INITIAL_MANAGED_STORES: ManagedStore[] = [];

export function removeMockStores(stores: ManagedStore[]) {
  return stores.filter((store) => !LEGACY_MOCK_STORE_IDS.has(store.id));
}
