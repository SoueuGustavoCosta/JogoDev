import type { WebMission } from '@/domain/webEra';
import { BugMission } from './BugMission';
import { CatchMission } from './CatchMission';
import { CodeMission } from './CodeMission';
import { OrderMission } from './OrderMission';
import { SortMission } from './SortMission';
import { TuneMission } from './TuneMission';
import type { MissionApi } from './types';

export type { MissionApi } from './types';

/** Escolhe o motor pelo tipo da missão. Os 6 motores são genéricos: recebem a missão por props. */
export function MissionEngine({ mission, api }: { mission: WebMission; api: MissionApi }) {
  switch (mission.type) {
    case 'order':
      return <OrderMission mission={mission} api={api} />;
    case 'sort':
      return <SortMission mission={mission} api={api} />;
    case 'catch':
      return <CatchMission mission={mission} api={api} />;
    case 'bug':
      return <BugMission mission={mission} api={api} />;
    case 'code':
      return <CodeMission mission={mission} api={api} />;
    case 'tune':
      return <TuneMission mission={mission} api={api} />;
  }
}
