export const monthRemap = new Map<number, string>([
  [1, 'Janeiro'],
  [2, 'Feveiro'],
  [3, 'Março'],
  [4, 'Abril'],
  [5, 'Maio'],
  [6, 'Junho'],
  [7, 'Julho'],
  [8, 'Agosto'],
  [9, 'Setembro'],
  [10, 'Outubro'],
  [11, 'Novembro'],
  [12, 'Dezembro'],
])

type IColorMap = {
  color: string
  hover: string
}

export const colorsMap = new Map<string, IColorMap>([
  [
    'bg-gray',
    {
      color: '#71717a',
      hover: '#9b9ba8',
    },
  ],
  [
    'bg-red',
    {
      color: '#ef4444',
      hover: '#ea5b5b',
    },
  ],
  [
    'bg-red-soft',
    {
      color: '#fca5a5',
      hover: '#ef4444',
    },
  ],
  [
    'bg-purple',
    {
      color: '#a855f7',
      hover: '#b16ff1',
    },
  ],
  [
    'bg-purple-soft',
    {
      color: '#d8b4fe',
      hover: '#b16ff1',
    },
  ],
  [
    'bg-blue',
    {
      color: '#3b82f6',
      hover: '#5d92ec',
    },
  ],
  [
    'bg-blue-soft',
    {
      color: '#93c5fd',
      hover: '#5d92ec',
    },
  ],
  [
    'bg-green',
    {
      color: '#22c55e',
      hover: '#41c773',
    },
  ],
  [
    'bg-green-strong',
    {
      color: '#15803d',
      hover: '#3f9f64',
    },
  ],
])
