import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Calendar } from 'lucide-react'

interface VerticalCardSkeletonProps {
  count?: number
}

const VerticalCardSkeleton = ({ count = 3 }: VerticalCardSkeletonProps) => {
  return (
    <div className="w-full grid gap-4 auto-rows-min">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 animate-pulse"
        >
          {/* Vertical Layout: Date Left, Financial Data Right */}
          <div className="flex gap-4">
            {/* Date Section - Left */}
            <div className="flex-shrink-0 w-20">
              <div className="text-center">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg mb-1">
                  <Calendar size={20} className="text-zinc-400 dark:text-zinc-500 mx-auto" />
                </div>
                <Skeleton height={20} width={24} className="mb-1" />
                <Skeleton height={12} width={30} className="mb-1" />
                <Skeleton height={12} width={25} />
              </div>
            </div>

            {/* Financial Data Section - Right */}
            <div className="flex-1 space-y-2">
              {/* Income Skeleton */}
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-green-400 dark:bg-green-500 rounded"></div>
                    <Skeleton height={12} width={50} />
                  </div>
                  <Skeleton height={14} width={70} />
                </div>
              </div>

              {/* Outcome Skeleton */}
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-red-400 dark:bg-red-500 rounded"></div>
                    <Skeleton height={12} width={45} />
                  </div>
                  <Skeleton height={14} width={75} />
                </div>
              </div>

              {/* Balance Skeleton */}
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-zinc-400 dark:bg-zinc-500 rounded"></div>
                    <Skeleton height={12} width={40} />
                  </div>
                  <Skeleton height={14} width={65} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default VerticalCardSkeleton