import { ListFilter, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const DATE_FILTERS = {
  BEFORE: 'before',
  AFTER: 'after',
  BOTH: 'both',
}

const TYPE_FILTERS = {
  ALL: 'all',
  INCOME: 'income',
  OUTCOME: 'outcome',
}

const DATE_FILTER_LABELS = {
  [DATE_FILTERS.BEFORE]: 'De hoje para trás',
  [DATE_FILTERS.AFTER]: 'De hoje para frente',
  [DATE_FILTERS.BOTH]: 'Todo o período',
}

const TYPE_FILTER_LABELS = {
  [TYPE_FILTERS.ALL]: 'Todos',
  [TYPE_FILTERS.INCOME]: 'Entrada',
  [TYPE_FILTERS.OUTCOME]: 'Saída',
}

interface FilterProps {
  onFilterChange: (filter: 'before' | 'after' | 'both', type: 'income' | 'outcome' | 'all') => void
  currentFilter: 'before' | 'after' | 'both'
  currentType: 'income' | 'outcome' | 'all'
}

export const Filter = ({ onFilterChange, currentFilter, currentType }: FilterProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingFilter, setPendingFilter] = useState<'before' | 'after' | 'both'>(currentFilter)
  const [pendingType, setPendingType] = useState<'income' | 'outcome' | 'all'>(currentType)
  const modalRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isModalOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isModalOpen])

  const handleRadioChange = (filterType: 'before' | 'after' | 'both', transactionType: 'income' | 'outcome' | 'all') => {
    setPendingFilter(filterType)
    setPendingType(transactionType)
  }

  const handleApplyFilters = () => {
    if (pendingFilter !== currentFilter || pendingType !== currentType) {
      onFilterChange(pendingFilter, pendingType)
    }
    setIsModalOpen(false)
  }

  const handleOpenModal = () => {
    setPendingFilter(currentFilter)
    setPendingType(currentType)
    setIsModalOpen(true)
  }

  return (
    <div className="flex justify-center items-center mr-2 gap-2">
      {/* Badges de filtros selecionados */}
      <div className="flex gap-2">
        <div className="bg-orange-500 text-white rounded-full px-4 py-1 text-xs font-semibold flex items-center">
          Dia - {DATE_FILTER_LABELS[currentFilter]}
        </div>
        <div className="bg-orange-500 text-white rounded-full px-4 py-1 text-xs font-semibold flex items-center">
          Tipo - {TYPE_FILTER_LABELS[currentType]}
        </div>
      </div>
      <div className="relative">
        <div className="absolute -top-2 -right-2 z-10">
          {/* Removido o contador de filtros */}
        </div>
        <button ref={buttonRef} onClick={handleOpenModal}>
          <ListFilter size={24} className="text-zinc-500 hover:opacity-60" />
        </button>
        {isModalOpen && (
          <div ref={modalRef} className="absolute right-0 top-full mt-2 z-30">
            <div className="relative w-96 bg-white rounded-lg shadow-xl border border-zinc-300 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-medium text-gray-900">
                  Filtros colunas
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Dia</h4>
                  {[
                    [DATE_FILTERS.BOTH, DATE_FILTER_LABELS[DATE_FILTERS.BOTH]],
                    [DATE_FILTERS.BEFORE, DATE_FILTER_LABELS[DATE_FILTERS.BEFORE]],
                    [DATE_FILTERS.AFTER, DATE_FILTER_LABELS[DATE_FILTERS.AFTER]],
                  ].map(([filterType, label]) => (
                    <label
                      key={filterType}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <input
                        type="radio"
                        name="dateFilter"
                        className="w-4 h-4 appearance-none border border-gray-300 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:before:content-[''] checked:before:w-2 checked:before:h-2 checked:before:bg-white checked:before:rounded-full checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 focus:ring-2 focus:ring-orange-500 relative"
                        checked={pendingFilter === filterType}
                        onChange={() => handleRadioChange(filterType as 'before' | 'after' | 'both', pendingType)}
                      />
                      <span className="text-sm text-gray-700 select-none">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex-1">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Tipo</h4>
                  {Object.entries(TYPE_FILTER_LABELS).map(([filterType, label]) => (
                    <label
                      key={filterType}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <input
                        type="radio"
                        name="typeFilter"
                        className="w-4 h-4 appearance-none border border-gray-300 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:before:content-[''] checked:before:w-2 checked:before:h-2 checked:before:bg-white checked:before:rounded-full checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 focus:ring-2 focus:ring-orange-500 relative"
                        checked={pendingType === filterType}
                        onChange={() => handleRadioChange(pendingFilter, filterType as 'income' | 'outcome' | 'all')}
                      />
                      <span className="text-sm text-gray-700 select-none">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-6 gap-2">
                <button
                  className="px-3 py-1 text-xs border border-orange-500 text-orange-500 bg-white rounded hover:bg-orange-50 transition"
                  onClick={handleApplyFilters}
                  type="button"
                  // Sempre habilitado
                >
                  Filtrar
                </button>
                <button
                  className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:bg-orange-300 disabled:cursor-not-allowed"
                  onClick={() => {
                    setPendingFilter('both');
                    setPendingType('all');
                  }}
                  type="button"
                  disabled={pendingFilter === 'both' && pendingType === 'all'}
                >
                  Resetar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const FilterTag = ({
  filterType,
  label,
}: {
  filterType: string
  label: string
}) => (
  <div className="flex items-center text-xs text-white bg-orange-500 px-3 py-1 rounded-full mr-2 transition-all hover:bg-orange-600">
    <span>{label}</span>
  </div>
)
