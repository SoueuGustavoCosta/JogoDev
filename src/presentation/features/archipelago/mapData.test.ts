import { describe, expect, it } from 'vitest';
import { getTrailById } from '@/content/registry';
import { ERAS, SATELLITE_ICON_PATHS } from './mapData';

describe('luas do mapa', () => {
  it('toda lua com trilha aponta para uma trilha registrada e tem ícone', () => {
    for (const era of ERAS) {
      for (const sat of era.satellites ?? []) {
        if (sat.trailId) expect(getTrailById(sat.trailId), sat.id).toBeDefined();
        expect(SATELLITE_ICON_PATHS[sat.icon], sat.id).toBeTruthy();
      }
    }
  });

  it('era com lua de trilha própria diz o nome do chefe que abre a lua', () => {
    for (const era of ERAS) {
      if ((era.satellites ?? []).some((s) => s.trailId)) {
        expect(era.bossName, era.id).toBeTruthy();
        expect(getTrailById(era.trailId!)?.bossFight?.bossName.toLowerCase()).toContain(era.bossName!.replace(/^o /, '').toLowerCase());
      }
    }
  });

  it('a Era dos Dados tem a Lua da Modelagem e a Lua do Guardião', () => {
    const dados = ERAS.find((e) => e.id === 'dados');
    expect(dados?.satellites?.map((s) => s.trailId)).toEqual(['dados-modelagem', 'dados-guardiao']);
  });

  it('luas da mesma era não ficam uma em cima da outra', () => {
    for (const era of ERAS) {
      const angles = (era.satellites ?? []).map((s) => s.angle).sort((a, b) => a - b);
      for (let i = 1; i < angles.length; i++) expect(angles[i]! - angles[i - 1]!, era.id).toBeGreaterThanOrEqual(40);
    }
  });
});
