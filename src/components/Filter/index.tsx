import { ListFilter, X } from 'lucide-react'
import { useCallback, useState } from 'react'

const FILTERS = {
  OLD: 'Old',
  FUTURE: 'Future',
}

const FILTER_LABELS = {
  [FILTERS.OLD]: 'Passadas',
  [FILTERS.FUTURE]: 'Futuras',
}

export const Filter = () => {
  const [activeFilters, setActiveFilters] = useState([
    FILTERS.OLD,
    FILTERS.FUTURE,
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isFilterActive = useCallback(
    (filterType: string) => {
      return activeFilters.includes(filterType)
    },
    [activeFilters],
  )

  const handleFilterRemove = useCallback((filterType: string) => {
    setActiveFilters((prev) => prev.filter((item) => item !== filterType))
  }, [])

  const handleFilterToggle = useCallback((filterType: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterType)
        ? prev.filter((item) => item !== filterType)
        : [...prev, filterType],
    )
  }, [])

  const FilterTag = ({
    filterType,
    label,
  }: {
    filterType: string
    label: string
  }) => (
    <div className="flex items-center text-xs text-white bg-orange-500 px-3 py-1 rounded-full mr-2 transition-all hover:bg-orange-600">
      <span>{label}</span>
      <button
        onClick={() => handleFilterRemove(filterType)}
        className="ml-2 p-0.5 hover:bg-orange-700 rounded-full transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={10} className="text-white" />
      </button>
    </div>
  )

  return (
    <div className="flex justify-center items-center mr-2">
      <div className="flex items-center">
        {isFilterActive(FILTERS.OLD) && (
          <FilterTag
            filterType={FILTERS.OLD}
            label={FILTER_LABELS[FILTERS.OLD]}
          />
        )}
        {isFilterActive(FILTERS.FUTURE) && (
          <FilterTag
            filterType={FILTERS.FUTURE}
            label={FILTER_LABELS[FILTERS.FUTURE]}
          />
        )}
      </div>

      <div className="relative">
        <button onClick={() => setIsModalOpen(!isModalOpen)}>
          <ListFilter size={24} className="text-zinc-500 hover:opacity-60" />
        </button>
        {isModalOpen && (
          <div className="absolute -right-14 top-8 z-30 flex items-center justify-center">
            <div className="relative w-44 bg-white rounded-lg shadow-xl border border-zinc-300 p-4 z-40">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-medium text-gray-900">
                  Filtros
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  onClick={() => setIsModalOpen(!isModalOpen)}
                >
                  <X size={16} />
                </button>
              </div>

              {Object.entries(FILTER_LABELS).map(([filterType, label]) => (
                <label
                  key={filterType}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 appearance-none border border-gray-300 rounded-sm checked:bg-orange-500 checked:border-orange-500 checked:before:content-['✔'] checked:before:text-white checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center focus:ring-2 focus:ring-orange-500"
                    checked={isFilterActive(filterType)}
                    onChange={() => handleFilterToggle(filterType)}
                  />
                  <span className="text-sm text-gray-700 select-none">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
