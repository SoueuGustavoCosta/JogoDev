import type { WebMission } from '@/domain/webEra';
import { BlocksMission } from './BlocksMission';
import { BugMission } from './BugMission';
import { CatchMission } from './CatchMission';
import { CodeMission } from './CodeMission';
import { DefuseMission } from './DefuseMission';
import { FillMission } from './FillMission';
import { OrderMission } from './OrderMission';
import { PortalMission } from './PortalMission';
import { PruneMission } from './PruneMission';
import { QuizMission } from './QuizMission';
import { SortMission } from './SortMission';
import { TuneMission } from './TuneMission';
import type { EngineProps } from './types';

export type { MissionApi } from './types';

/** Escolhe o motor pelo tipo da missão. Os motores são genéricos: recebem a missão por props. */
export function MissionEngine({ mission, ...rest }: EngineProps<WebMission>) {
  switch (mission.type) {
    case 'order':
      return <OrderMission mission={mission} {...rest} />;
    case 'sort':
      return <SortMission mission={mission} {...rest} />;
    case 'catch':
      return <CatchMission mission={mission} {...rest} />;
    case 'bug':
      return <BugMission mission={mission} {...rest} />;
    case 'code':
      return <CodeMission mission={mission} {...rest} />;
    case 'tune':
      return <TuneMission mission={mission} {...rest} />;
    case 'blocks':
      return <BlocksMission mission={mission} {...rest} />;
    case 'fill':
      return <FillMission mission={mission} {...rest} />;
    case 'quiz':
      return <QuizMission mission={mission} {...rest} />;
    case 'prune':
      return <PruneMission mission={mission} {...rest} />;
    case 'defuse':
      return <DefuseMission mission={mission} {...rest} />;
    case 'portal':
      return <PortalMission mission={mission} {...rest} />;
  }
}
