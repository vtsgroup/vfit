/**
 * config/equipment.ts
 *
 * Seed de equipamentos organizados por categoria.
 * Cada item tem id, nome PT, emoji, categoria.
 */

export interface Equipment {
  id: string
  name: string
  emoji: string
  category: string
}

export interface EquipmentCategory {
  id: string
  name: string
  emoji: string
  items: Equipment[]
}

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: 'corpo',
    name: 'Corpo Livre',
    emoji: '🏋️',
    items: [
      { id: 'peso-corporal', name: 'Peso Corporal', emoji: '🧍', category: 'corpo' },
      { id: 'colchonete', name: 'Colchonete', emoji: '🧘', category: 'corpo' },
      { id: 'bola-suica', name: 'Bola Suíça', emoji: '⚽', category: 'corpo' },
      { id: 'bosu', name: 'Bosu', emoji: '🔵', category: 'corpo' },
      { id: 'rolo-foam', name: 'Foam Roller', emoji: '🧶', category: 'corpo' },
    ],
  },
  {
    id: 'halteres-kettlebells',
    name: 'Halteres & Kettlebells',
    emoji: '🏋️‍♂️',
    items: [
      { id: 'halter', name: 'Halter (Par)', emoji: '🏋️', category: 'halteres-kettlebells' },
      { id: 'kettlebell', name: 'Kettlebell', emoji: '🔔', category: 'halteres-kettlebells' },
      { id: 'medicine-ball', name: 'Medicine Ball', emoji: '🏐', category: 'halteres-kettlebells' },
      { id: 'anilha', name: 'Anilha (avulsa)', emoji: '⭕', category: 'halteres-kettlebells' },
    ],
  },
  {
    id: 'barras',
    name: 'Barras & Pesos',
    emoji: '🔩',
    items: [
      { id: 'barra-reta', name: 'Barra Reta', emoji: '➖', category: 'barras' },
      { id: 'barra-w', name: 'Barra W', emoji: '〰️', category: 'barras' },
      { id: 'barra-hexagonal', name: 'Barra Hexagonal', emoji: '⬡', category: 'barras' },
      { id: 'barra-romana', name: 'Barra Romana', emoji: '🔧', category: 'barras' },
      { id: 'smith-machine', name: 'Smith Machine', emoji: '🔲', category: 'barras' },
      { id: 'suporte-agachamento', name: 'Rack de Agachamento', emoji: '🏗️', category: 'barras' },
    ],
  },
  {
    id: 'bancos',
    name: 'Bancos & Suportes',
    emoji: '🪑',
    items: [
      { id: 'banco-reto', name: 'Banco Reto', emoji: '🪑', category: 'bancos' },
      { id: 'banco-inclinado', name: 'Banco Inclinado', emoji: '📐', category: 'bancos' },
      { id: 'banco-declinado', name: 'Banco Declinado', emoji: '↘️', category: 'bancos' },
      { id: 'banco-scott', name: 'Banco Scott', emoji: '💪', category: 'bancos' },
      { id: 'banco-romano', name: 'Banco Romano (Lombar)', emoji: '🔄', category: 'bancos' },
      { id: 'barra-fixa', name: 'Barra Fixa (Pull-Up)', emoji: '🔝', category: 'bancos' },
      { id: 'paralela', name: 'Paralela (Dip)', emoji: '⬇️', category: 'bancos' },
    ],
  },
  {
    id: 'cabos',
    name: 'Cabos & Polias',
    emoji: '🔗',
    items: [
      { id: 'cross-over', name: 'Cross Over (Polia Dupla)', emoji: '🔗', category: 'cabos' },
      { id: 'polia-alta', name: 'Polia Alta', emoji: '⬆️', category: 'cabos' },
      { id: 'polia-baixa', name: 'Polia Baixa', emoji: '⬇️', category: 'cabos' },
      { id: 'remada-cabos', name: 'Máquina Remada Cabos', emoji: '🚣', category: 'cabos' },
    ],
  },
  {
    id: 'maquinas',
    name: 'Máquinas',
    emoji: '⚙️',
    items: [
      { id: 'leg-press', name: 'Leg Press', emoji: '🦵', category: 'maquinas' },
      { id: 'hack-squat', name: 'Hack Squat', emoji: '🏋️', category: 'maquinas' },
      { id: 'cadeira-extensora', name: 'Cadeira Extensora', emoji: '🦿', category: 'maquinas' },
      { id: 'mesa-flexora', name: 'Mesa Flexora', emoji: '🔻', category: 'maquinas' },
      { id: 'cadeira-flexora', name: 'Cadeira Flexora', emoji: '🪑', category: 'maquinas' },
      { id: 'cadeira-adutora', name: 'Cadeira Adutora', emoji: '↔️', category: 'maquinas' },
      { id: 'cadeira-abdutora', name: 'Cadeira Abdutora', emoji: '↕️', category: 'maquinas' },
      { id: 'panturrilha-maquina', name: 'Panturrilha Máquina', emoji: '🦶', category: 'maquinas' },
      { id: 'peck-deck', name: 'Peck Deck (Voador)', emoji: '🦅', category: 'maquinas' },
      { id: 'supino-maquina', name: 'Supino Máquina', emoji: '🔳', category: 'maquinas' },
      { id: 'pulldown', name: 'Pulley (Pulldown)', emoji: '⬇️', category: 'maquinas' },
      { id: 'graviton', name: 'Graviton (Assistido)', emoji: '🆙', category: 'maquinas' },
      { id: 'abdominal-maquina', name: 'Abdominal Máquina', emoji: '🔄', category: 'maquinas' },
    ],
  },
  {
    id: 'elasticos-acessorios',
    name: 'Elásticos & Acessórios',
    emoji: '🎗️',
    items: [
      { id: 'elastico-mini-band', name: 'Mini Band', emoji: '⭕', category: 'elasticos-acessorios' },
      { id: 'elastico-super-band', name: 'Super Band', emoji: '🔴', category: 'elasticos-acessorios' },
      { id: 'elastico-tubo', name: 'Elástico Tubo', emoji: '〰️', category: 'elasticos-acessorios' },
      { id: 'trx', name: 'TRX / Fita de Suspensão', emoji: '🎗️', category: 'elasticos-acessorios' },
      { id: 'corda-pular', name: 'Corda de Pular', emoji: '🪢', category: 'elasticos-acessorios' },
      { id: 'roda-abdominal', name: 'Roda Abdominal', emoji: '🛞', category: 'elasticos-acessorios' },
    ],
  },
  {
    id: 'cardio',
    name: 'Cardio',
    emoji: '❤️',
    items: [
      { id: 'esteira', name: 'Esteira', emoji: '🏃', category: 'cardio' },
      { id: 'bicicleta', name: 'Bicicleta Ergométrica', emoji: '🚴', category: 'cardio' },
      { id: 'eliptico', name: 'Elíptico (Transport)', emoji: '🔄', category: 'cardio' },
      { id: 'remo-ergometro', name: 'Remo Ergômetro', emoji: '🚣', category: 'cardio' },
      { id: 'escada', name: 'Escada (StairMaster)', emoji: '🪜', category: 'cardio' },
      { id: 'air-bike', name: 'Air Bike (Assault)', emoji: '🌀', category: 'cardio' },
    ],
  },
]

/** Flatten all equipment */
export const ALL_EQUIPMENT: Equipment[] = EQUIPMENT_CATEGORIES.flatMap((c) => c.items)

/** Get equipment by id */
export function getEquipmentById(id: string): Equipment | undefined {
  return ALL_EQUIPMENT.find((e) => e.id === id)
}
