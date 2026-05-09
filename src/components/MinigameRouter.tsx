import type { MinigameId } from '../data/minigameMeta';
import type { MinigameResultInput } from '../store/gameStore';
import { ArcadeScoreboardsGame } from './minigames/ArcadeScoreboardsGame';
import { BatteryDeliveryGame } from './minigames/BatteryDeliveryGame';
import { BlockBreakerGame } from './minigames/BlockBreakerGame';
import { FallingPartsGame } from './minigames/FallingPartsGame';
import { GarageKartGame } from './minigames/GarageKartGame';
import { HoverBoardGame } from './minigames/HoverBoardGame';
import { MagnetTruckGame } from './minigames/MagnetTruckGame';
import { MazeBotGame } from './minigames/MazeBotGame';
import { MemoryLightsGame } from './minigames/MemoryLightsGame';
import { ObstacleAlleyGame } from './minigames/ObstacleAlleyGame';
import { PipeConnectorGame } from './minigames/PipeConnectorGame';
import { RhythmRepairGame } from './minigames/RhythmRepairGame';
import { ScrapRacerGame } from './minigames/ScrapRacerGame';
import { TargetBlasterGame } from './minigames/TargetBlasterGame';
import { TimeTrialGame } from './minigames/TimeTrialGame';
import { TrainingBattleGame } from './minigames/TrainingBattleGame';
import { VehicleUpgradeGame } from './minigames/VehicleUpgradeGame';

export interface MinigameRouterProps {
  gameId: MinigameId;
  onFinish: (result: MinigameResultInput) => void;
}

export function MinigameRouter({ gameId, onFinish }: MinigameRouterProps) {
  switch (gameId) {
    case 'wire-repair':
      return <GarageKartGame onFinish={onFinish} />;
    case 'junkyard':
      return <ScrapRacerGame onFinish={onFinish} />;
    case 'speed-test':
      return <BatteryDeliveryGame onFinish={onFinish} />;
    case 'core-charge':
      return <HoverBoardGame onFinish={onFinish} />;
    case 'balance-test':
      return <MagnetTruckGame onFinish={onFinish} />;
    case 'obstacle-alley':
      return <ObstacleAlleyGame onFinish={onFinish} />;
    case 'training-battle':
      return <TrainingBattleGame onFinish={onFinish} />;
    case 'memory-circuit':
      return <TimeTrialGame onFinish={onFinish} />;
    case 'part-assembly':
      return <VehicleUpgradeGame onFinish={onFinish} />;
    case 'block-breaker':
      return <BlockBreakerGame onFinish={onFinish} />;
    case 'memory-lights':
      return <MemoryLightsGame onFinish={onFinish} />;
    case 'maze-bot':
      return <MazeBotGame onFinish={onFinish} />;
    case 'falling-parts':
      return <FallingPartsGame onFinish={onFinish} />;
    case 'target-blaster':
      return <TargetBlasterGame onFinish={onFinish} />;
    case 'pipe-connector':
      return <PipeConnectorGame onFinish={onFinish} />;
    case 'rhythm-repair':
      return <RhythmRepairGame onFinish={onFinish} />;
    case 'arcade-scoreboards':
      return <ArcadeScoreboardsGame onFinish={onFinish} />;
    default: {
      const _exhaustive: never = gameId;
      return _exhaustive;
    }
  }
}
