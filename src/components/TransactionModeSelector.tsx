import React, { useState } from 'react'
import { CreditCard, RotateCcw, Calculator } from 'lucide-react'
import SimpleInstallmentConfigComponent from './SimpleInstallmentConfig'
import ModernSelect, { SelectOption } from './ModernSelect'
import { TransactionMode, RecurrenceType, SimpleInstallmentConfig } from '../types/transactions'

interface TransactionModeSelectorProps {
  value?: TransactionMode
  onChange?: (
    mode: TransactionMode, 
    recurrenceConfig?: { type: RecurrenceType, interval: number },
    installmentConfig?: SimpleInstallmentConfig
  ) => void
  transactionDate?: string
  transactionValue?: number
  disabled?: boolean
}

const TransactionModeSelector: React.FC<TransactionModeSelectorProps> = ({
  value = 'single',
  onChange,
  transactionDate,
  transactionValue = 0,
  disabled = false
}) => {
  const [selectedMode, setSelectedMode] = useState<TransactionMode>(value)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('monthly')
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1)

  const modeOptions = [
    { 
      id: 'single', 
      label: 'Avulso', 
      icon: <CreditCard className="w-4 h-4" />,
      description: 'Transação única'
    },
    { 
      id: 'recurring', 
      label: 'Recorrente', 
      icon: <RotateCcw className="w-4 h-4" />,
      description: 'Repetir indefinidamente'
    },
    { 
      id: 'installments', 
      label: 'Parcelado', 
      icon: <Calculator className="w-4 h-4" />,
      description: 'Dividir com prazo final'
    }
  ]

  const recurrenceOptions: SelectOption[] = [
    { value: 'daily', label: 'Diário', icon: <span>📅</span> },
    { value: 'weekly', label: 'Semanal', icon: <span>📆</span> },
    { value: 'monthly', label: 'Mensal', icon: <span>🗓️</span> },
    { value: 'quarterly', label: 'Trimestral', icon: <span>📊</span> },
    { value: 'biannually', label: 'Semestral', icon: <span>📋</span> },
    { value: 'yearly', label: 'Anual', icon: <span>📄</span> }
  ]

  const handleModeChange = (mode: TransactionMode) => {
    setSelectedMode(mode)
    if (onChange) {
      if (mode === 'single') {
        onChange(mode)
      } else if (mode === 'recurring') {
        onChange(mode, { type: recurrenceType, interval: recurrenceInterval })
      }
      // Para installments, o onChange será chamado pelo SimpleInstallmentConfig
    }
  }

  const handleRecurrenceChange = (type: string, interval: number) => {
    setRecurrenceType(type as RecurrenceType)
    setRecurrenceInterval(interval)
    if (onChange && selectedMode === 'recurring') {
      onChange(selectedMode, { type: type as RecurrenceType, interval })
    }
  }

  const handleInstallmentConfigChange = (config: SimpleInstallmentConfig) => {
    if (onChange && selectedMode === 'installments') {
      onChange(selectedMode, undefined, config)
    }
  }

  return (
    <div className="space-y-4">
      {/* Seletor de Modo */}
      <div>
        <label className="text-md font-semibold text-gray dark:text-softGray mb-3 block">
          Tipo de Transação
        </label>
        <div className="grid grid-cols-3 gap-2">
          {modeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => handleModeChange(option.id as TransactionMode)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-center
                ${selectedMode === option.id
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                  : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800'
                }
                ${!disabled ? 'hover:border-teal-400 cursor-pointer' : 'cursor-not-allowed opacity-60'}
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={selectedMode === option.id ? 'text-teal-600 dark:text-teal-400' : ''}>
                  {option.icon}
                </span>
                <span className="text-xs font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuração para Recorrente */}
      {selectedMode === 'recurring' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Configuração de Recorrência
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <ModernSelect
                label="Frequência"
                options={recurrenceOptions}
                value={recurrenceType}
                onChange={(value) => handleRecurrenceChange(value, recurrenceInterval)}
                disabled={disabled}
                isSearchable={false}
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">
                A cada
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={recurrenceInterval}
                  onChange={(e) => handleRecurrenceChange(recurrenceType, Number(e.target.value))}
                  disabled={disabled}
                  className="w-16 h-8 text-center text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {recurrenceType === 'daily' && (recurrenceInterval === 1 ? 'dia' : 'dias')}
                  {recurrenceType === 'weekly' && (recurrenceInterval === 1 ? 'semana' : 'semanas')}
                  {recurrenceType === 'monthly' && (recurrenceInterval === 1 ? 'mês' : 'meses')}
                  {recurrenceType === 'quarterly' && (recurrenceInterval === 1 ? 'trimestre' : 'trimestres')}
                  {recurrenceType === 'biannually' && (recurrenceInterval === 1 ? 'semestre' : 'semestres')}
                  {recurrenceType === 'yearly' && (recurrenceInterval === 1 ? 'ano' : 'anos')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuração para Parcelado */}
      {selectedMode === 'installments' && transactionValue > 0 && transactionDate && (
        <SimpleInstallmentConfigComponent
          totalValue={transactionValue}
          startDate={transactionDate}
          onConfigChange={handleInstallmentConfigChange}
          disabled={disabled}
        />
      )}
    </div>
  )
}

export default TransactionModeSelector