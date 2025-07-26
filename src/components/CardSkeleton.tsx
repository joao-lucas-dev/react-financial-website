import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Calendar } from 'lucide-react'

interface CardSkeletonProps {
  count?: number
}

const CardSkeleton = ({ count = 3 }: CardSkeletonProps) => {
  return (
    <div className="w-full grid gap-4 auto-rows-min">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 animate-pulse"
        >
          {/* Date Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                <Calendar size={16} className="text-zinc-400 dark:text-zinc-500" />
              </div>
              <div>
                <Skeleton height={20} width={120} className="mb-1" />
                <Skeleton height={12} width={80} />
              </div>
            </div>
            
            {/* Action buttons skeleton */}
            <div className="flex gap-1 opacity-0">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded-lg"></div>
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded-lg"></div>
            </div>
          </div>

          {/* Financial Data Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Income Skeleton */}
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3.5 h-3.5 bg-green-400 dark:bg-green-500 rounded"></div>
                <Skeleton height={12} width={50} />
              </div>
              <Skeleton height={16} width={70} />
            </div>

            {/* Outcome Skeleton */}
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3.5 h-3.5 bg-red-400 dark:bg-red-500 rounded"></div>
                <Skeleton height={12} width={45} />
              </div>
              <Skeleton height={16} width={75} />
            </div>

            {/* Balance Skeleton */}
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3.5 h-3.5 bg-zinc-400 dark:bg-zinc-500 rounded"></div>
                <Skeleton height={12} width={40} />
              </div>
              <Skeleton height={16} width={65} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CardSkeleton