export interface GameTypeTemplate {
  id: string;
  name: string;
  format: string;
  eventFormats: string[];
  minimumCapacity: number;
  maximumCapacity: number;
  minimumPlayersToStart: number;
  defaultCapacity: number;
}

export const GAME_TYPES: GameTypeTemplate[] = [
  {
    id: "magic-the-gathering",
    name: "Magic: The Gathering",
    format: "Trading Card Game",
    eventFormats: ["Commander", "Standard", "Draft"],
    minimumCapacity: 4,
    maximumCapacity: 30,
    minimumPlayersToStart: 4,
    defaultCapacity: 16,
  },
  {
    id: "pokemon-tcg",
    name: "Pokemon TCG",
    format: "Trading Card Game",
    eventFormats: ["Standard", "Expanded", "League Challenge"],
    minimumCapacity: 2,
    maximumCapacity: 30,
    minimumPlayersToStart: 2,
    defaultCapacity: 16,
  },
  {
    id: "disney-lorcana",
    name: "Disney Lorcana",
    format: "Trading Card Game",
    eventFormats: ["Core Constructed", "Draft"],
    minimumCapacity: 2,
    maximumCapacity: 30,
    minimumPlayersToStart: 2,
    defaultCapacity: 16,
  },
  {
    id: "board-game",
    name: "Board Game",
    format: "Board Game",
    eventFormats: ["Open Play", "Learn to Play"],
    minimumCapacity: 2,
    maximumCapacity: 12,
    minimumPlayersToStart: 2,
    defaultCapacity: 8,
  },
];

export function getGameType(id: string): GameTypeTemplate | undefined {
  return GAME_TYPES.find((gameType) => gameType.id === id);
}
