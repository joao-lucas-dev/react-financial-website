import React, { useState, useEffect } from 'react'
import { Calculator, Calendar } from 'lucide-react'
import ModernSelect, { SelectOption } from './ModernSelect'
import { InstallmentPeriod } from '../types/transactions'

interface SimpleInstallmentConfig {
  count: number
  period: InstallmentPeriod
  installmentValue: number
  endDate: string
}

interface SimpleInstallmentConfigProps {
  totalValue: number
  startDate: string
  onConfigChange: (config: SimpleInstallmentConfig) => void
  disabled?: boolean
}

const SimpleInstallmentConfigComponent: React.FC<SimpleInstallmentConfigProps> = ({
  totalValue,
  startDate,
  onConfigChange,
  disabled = false
}) => {
  const [installmentCount, setInstallmentCount] = useState<number>(2)
  const [installmentPeriod, setInstallmentPeriod] = useState<InstallmentPeriod>('monthly')

  // Opções de período simplificadas
  const periodOptions: SelectOption[] = [
    {
      value: 'monthly',
      label: 'Mensal',
      icon: <Calendar className="w-4 h-4 text-teal-500" />
    },
    {
      value: 'quarterly',
      label: 'Trimestral',
      icon: <Calendar className="w-4 h-4 text-orange-500" />
    },
    {
      value: 'biannually',
      label: 'Semestral',
      icon: <Calendar className="w-4 h-4 text-purple-500" />
    },
    {
      value: 'yearly',
      label: 'Anual',
      icon: <Calendar className="w-4 h-4 text-red-500" />
    }
  ]

  // Calcular data de fim das parcelas
  const calculateEndDate = (
    start: string,
    count: number,
    period: InstallmentPeriod
  ): string => {
    const startDateObj = new Date(start)
    const endDateObj = new Date(startDateObj)
    
    switch (period) {
      case 'monthly':
        endDateObj.setMonth(startDateObj.getMonth() + (count - 1))
        break
      case 'quarterly':
        endDateObj.setMonth(startDateObj.getMonth() + ((count - 1) * 3))
        break
      case 'biannually':
        endDateObj.setMonth(startDateObj.getMonth() + ((count - 1) * 6))
        break
      case 'yearly':
        endDateObj.setFullYear(startDateObj.getFullYear() + (count - 1))
        break
    }
    
    return endDateObj.toLocaleDateString('pt-BR', { 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  // Atualizar configuração quando mudarem os valores
  useEffect(() => {
    if (totalValue > 0 && startDate) {
      const installmentValue = totalValue / installmentCount
      const endDate = calculateEndDate(startDate, installmentCount, installmentPeriod)
      
      const config: SimpleInstallmentConfig = {
        count: installmentCount,
        period: installmentPeriod,
        installmentValue,
        endDate
      }
      
      onConfigChange(config)
    }
  }, [totalValue, startDate, installmentCount, installmentPeriod, onConfigChange])

  const handleCountChange = (value: number) => {
    if (value >= 2 && value <= 60) {
      setInstallmentCount(value)
    }
  }

  const handlePeriodChange = (value: string) => {
    setInstallmentPeriod(value as InstallmentPeriod)
  }

  const installmentValue = totalValue / installmentCount
  const endDate = calculateEndDate(startDate, installmentCount, installmentPeriod)

  return (
    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          Configuração de Parcelas
        </span>
      </div>

      {/* Configuração em linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Número de parcelas */}
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">
            Dividir em
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="2"
              max="60"
              value={installmentCount}
              onChange={(e) => handleCountChange(Number(e.target.value))}
              disabled={disabled}
              className="w-16 h-8 text-center text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              parcelas
            </span>
          </div>
        </div>

        {/* Período */}
        <div>
          <ModernSelect
            label="Período"
            options={periodOptions}
            value={installmentPeriod}
            onChange={handlePeriodChange}
            disabled={disabled}
            isSearchable={false}
          />
        </div>
      </div>

      {/* Resumo compacto */}
      <div className="flex justify-between items-center text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md p-2">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Cada parcela:</span>
            <div className="font-semibold text-indigo-600 dark:text-indigo-400">
              {installmentValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
          </div>
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Término:</span>
            <div className="font-medium text-zinc-700 dark:text-zinc-300">
              {endDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleInstallmentConfigComponent