import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { ICreditCard } from '../types/creditCards'
import { getInvoiceInfoForTransaction } from '../utils/invoiceCalculations'
import { DateTime } from 'luxon'

interface InvoiceSelectorProps {
  selectedCard?: ICreditCard | null
  value?: string
  onChange: (invoiceDate: string) => void
  disabled?: boolean
}

const InvoiceSelector = ({ selectedCard, value, onChange, disabled }: InvoiceSelectorProps) => {
  const [showModal, setShowModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(DateTime.now())
  
  // Inicializar com data padrão se não houver valor
  const initializeDefaultValue = () => {
    if (!value && selectedCard && onChange) {
      const today = DateTime.now()
      const transactionDate = today.toISO()
      
      if (transactionDate) {
        onChange(transactionDate)
      }
    }
  }

  // Calcular data selecionada baseada no value
  const getSelectedDate = () => {
    if (!value || !selectedCard) {
      return DateTime.now()
    }
    
    // Se value é uma data ISO, converter para DateTime
    try {
      const date = DateTime.fromISO(value)
      if (date.isValid) {
        return date
      }
      // Se não for ISO válido, tentar como data simples
      const fallback = DateTime.fromJSDate(new Date(value))
      return fallback.isValid ? fallback : DateTime.now()
    } catch {
      return DateTime.now()
    }
  }

  const selectedDate = getSelectedDate()
  const selectedMonthName = selectedDate.isValid 
    ? selectedDate.setLocale('pt-BR').toFormat('MMMM')
    : 'setembro'
  const selectedYear = selectedDate.isValid 
    ? selectedDate.year 
    : DateTime.now().year
  
  // Debug log removido

  // Inicializar valor padrão quando o cartão muda
  useEffect(() => {
    initializeDefaultValue()
  }, [selectedCard])

  const handleMonthYearSelect = (month: number, year: number) => {
    try {
      // Criar data no primeiro dia do mês selecionado
      const selectedDateTime = DateTime.fromObject({ year, month, day: 1 })
      
      if (!selectedDateTime.isValid) {
        console.error('Data inválida criada:', { year, month })
        return
      }
      
      const transactionDate = selectedDateTime.toISO()
      
      if (transactionDate) {
        // Usar diretamente a data selecionada em vez de calcular fatura
        onChange(transactionDate)
      }
      
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao selecionar mês/ano:', error)
      setShowModal(false)
    }
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const generateYears = () => {
    const currentYear = DateTime.now().year
    const years = []
    for (let i = 0; i < 3; i++) {
      years.push(currentYear + i)
    }
    return years
  }

  if (!selectedCard || disabled) {
    return null
  }

  return (
    <>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          Fatura de{' '}
          <span className="text-green-600 dark:text-green-400 font-medium cursor-pointer">
            {selectedMonthName}
          </span>
          {' '}de{' '}
          <span className="text-green-600 dark:text-green-400 font-medium cursor-pointer">
            {selectedYear}
          </span>
        </button>
      </div>

      {/* Modal de seleção de mês/ano */}
      {showModal && (
        <div 
          className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-[9999]"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowModal(false)
          }}
        >
          <div 
            className="bg-white dark:bg-zinc-800 w-[400px] max-w-[90vw] rounded-2xl shadow-2xl p-6 relative transition-colors"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                Selecionar Fatura
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowModal(false)
                }}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            {/* Seletor de ano */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentDate(currentDate.minus({ years: 1 }))
                }}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </button>
              <h4 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                {currentDate.year}
              </h4>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentDate(currentDate.plus({ years: 1 }))
                }}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            {/* Grid de meses */}
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => {
                const monthNumber = index + 1
                const isSelected = selectedDate.month === monthNumber && selectedDate.year === currentDate.year
                
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleMonthYearSelect(monthNumber, currentDate.year)
                    }}
                    className={`px-4 py-3 text-sm rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-green-500 text-white'
                        : 'bg-zinc-50 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {month}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InvoiceSelector
