// Frontend data layer that can switch between real API modules and local mock data.
// TODO: Wire to a bundler/runtime that can import the TS API files directly.

const MOCK = {
  plants: [{ id: 'p1', name: 'Monstera deliciosa', created_at: new Date().toISOString() }],
  remedies: [{ id: 'r1', title: 'Neem spray', created_at: new Date().toISOString() }],
  collections: [{ id: 'c1', name: 'Indoor tropicals' }],
  community: [{ id: 'cm1', title: 'Thrips prevention tips' }],
  marketplace: [{ id: 'm1', title: 'Moisture meter' }],
};

export async function getLibraryData() {
  return { plants: MOCK.plants, remedies: MOCK.remedies };
}

export async function getCollectionsData() {
  return MOCK.collections;
}

export async function getExploreData() {
  return { community: MOCK.community, marketplace: MOCK.marketplace };
}
