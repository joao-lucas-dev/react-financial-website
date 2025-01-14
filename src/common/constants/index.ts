import {
  LucideProps,
  Bike,
  House,
  ShoppingCart,
  EllipsisVertical,
  BadgeX,
  Landmark,
  Cross,
  CircleDollarSign,
  NotebookPen,
} from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

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

type ICategoryIcon = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
  name: string
  color: string
}

export const categoryIcons = new Map<number, ICategoryIcon>([
  [
    1,
    {
      icon: Bike,
      name: 'delivery',
      color: 'bg-red-500',
    },
  ],
  [
    2,
    {
      icon: ShoppingCart,
      name: 'compras',
      color: 'bg-purple-500',
    },
  ],
  [
    3,
    {
      icon: House,
      name: 'casa',
      color: 'bg-blue-500',
    },
  ],
  [
    4,
    {
      icon: EllipsisVertical,
      name: 'outros',
      color: 'bg-zinc-500',
    },
  ],
  [
    5,
    {
      icon: BadgeX,
      name: 'imprevistos',
      color: 'bg-red-300',
    },
  ],
  [
    6,
    {
      icon: Landmark,
      name: 'investimentos',
      color: 'bg-purple-300',
    },
  ],
  [
    7,
    {
      icon: Cross,
      name: 'saúde',
      color: 'bg-green-500',
    },
  ],
  [
    8,
    {
      icon: CircleDollarSign,
      name: 'salário',
      color: 'bg-green-700',
    },
  ],
  [
    9,
    {
      icon: NotebookPen,
      name: 'estudos',
      color: 'bg-blue-300',
    },
  ],
])
