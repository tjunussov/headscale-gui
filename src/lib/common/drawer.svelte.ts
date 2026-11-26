// global detail panel (rendered as shadcn Sheet in +layout); id like 'userDrawer-1' / 'nodeDrawer-3'
export const drawer = $state({ id: '', meta: null as any });
export const openDrawer = (id: string, meta: unknown) => Object.assign(drawer, { id, meta });
export const closeDrawer = () => { drawer.id = '' };
