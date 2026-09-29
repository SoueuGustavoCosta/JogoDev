import type { GemSpec } from '@/domain/webEra';
import { webEraTrails, webSpecialGems } from './era';
import { webMoons } from './moons';

export { BASE_CARDS, TAGS_FAKE, TAGS_HTML, ecoBoss, webEraTrails, webSpecialGems } from './era';
export { webMoons } from './moons';
export { webBranches } from './branches';
export { webEraCopy } from './copy';

/** As 15 insígnias-gema da era, na ordem da estante: 10 trilhas, rara, lendária e 3 luas. */
export const webEraGems: GemSpec[] = [
  ...webEraTrails.map((t) => t.gem),
  webSpecialGems.rara,
  webSpecialGems.lendaria,
  ...webMoons.map((m) => m.gem),
];

export function getWebMoon(id: string) {
  return webMoons.find((m) => m.id === id);
}
