import React, { useState, useEffect } from 'react'
import { Calculator, Calendar, DollarSign } from 'lucide-react'
import ModernSelect, { SelectOption } from './ModernSelect'
import { InstallmentConfig, InstallmentPeriod } from '../types/transactions'

interface InstallmentConfigProps {
  totalValue: number
  transactionDate: string
  onConfigChange: (config: InstallmentConfig) => void
  disabled?: boolean
}

const InstallmentConfigComponent: React.FC<InstallmentConfigProps> = ({
  totalValue,
  transactionDate,
  onConfigChange,
  disabled = false
}) => {
  const [installmentCount, setInstallmentCount] = useState<number>(2)
  const [installmentPeriod, setInstallmentPeriod] = useState<InstallmentPeriod>('monthly')
  const [config, setConfig] = useState<InstallmentConfig>({
    count: 2,
    period: 'monthly',
    installmentValue: 0,
    dates: []
  })

  // Opções de período para parcelas
  const periodOptions: SelectOption[] = [
    {
      value: 'weekly',
      label: 'Semanal',
      icon: <Calendar className="w-4 h-4 text-blue-500" />
    },
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

  // Calcular datas das parcelas
  const calculateInstallmentDates = (
    startDate: string,
    count: number,
    period: InstallmentPeriod
  ): string[] => {
    const dates: string[] = []
    const baseDate = new Date(startDate)
    
    for (let i = 0; i < count; i++) {
      const installmentDate = new Date(baseDate)
      
      switch (period) {
        case 'weekly':
          installmentDate.setDate(baseDate.getDate() + (i * 7))
          break
        case 'monthly':
          installmentDate.setMonth(baseDate.getMonth() + i)
          break
        case 'quarterly':
          installmentDate.setMonth(baseDate.getMonth() + (i * 3))
          break
        case 'biannually':
          installmentDate.setMonth(baseDate.getMonth() + (i * 6))
          break
        case 'yearly':
          installmentDate.setFullYear(baseDate.getFullYear() + i)
          break
      }
      
      dates.push(installmentDate.toLocaleDateString('pt-BR'))
    }
    
    return dates
  }

  // Atualizar configuração quando mudarem os valores
  useEffect(() => {
    if (totalValue > 0 && transactionDate) {
      const installmentValue = totalValue / installmentCount
      const dates = calculateInstallmentDates(transactionDate, installmentCount, installmentPeriod)
      
      const newConfig: InstallmentConfig = {
        count: installmentCount,
        period: installmentPeriod,
        installmentValue,
        dates
      }
      
      setConfig(newConfig)
      onConfigChange(newConfig)
    }
  }, [totalValue, transactionDate, installmentCount, installmentPeriod, onConfigChange])

  const handleCountChange = (value: number) => {
    if (value >= 2 && value <= 60) {
      setInstallmentCount(value)
    }
  }

  const handlePeriodChange = (value: string) => {
    setInstallmentPeriod(value as InstallmentPeriod)
  }

  const getPeriodLabel = (period: InstallmentPeriod): string => {
    switch (period) {
      case 'weekly': return 'semanas'
      case 'monthly': return 'meses'
      case 'quarterly': return 'trimestres'
      case 'biannually': return 'semestres'
      case 'yearly': return 'anos'
      default: return 'períodos'
    }
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        <h4 className="font-medium text-teal-700 dark:text-teal-300">
          Configuração de Parcelas
        </h4>
      </div>

      {/* Configuradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Número de parcelas */}
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
            Dividir em quantas parcelas?
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="2"
              max="60"
              value={installmentCount}
              onChange={(e) => handleCountChange(Number(e.target.value))}
              disabled={disabled}
              className="w-20 h-10 text-center border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              parcelas (2-60)
            </span>
          </div>
        </div>

        {/* Período entre parcelas */}
        <div>
          <ModernSelect
            label="Período entre parcelas"
            options={periodOptions}
            value={installmentPeriod}
            onChange={handlePeriodChange}
            disabled={disabled}
            isSearchable={false}
            placeholder="Selecione o período..."
          />
        </div>
      </div>

      {/* Resumo do cálculo */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Valor Total
              </span>
            </div>
            <div className="text-lg font-bold text-zinc-700 dark:text-zinc-200">
              {totalValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Cada Parcela
              </span>
            </div>
            <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
              {config.installmentValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Frequência
              </span>
            </div>
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {installmentCount}x {getPeriodLabel(installmentPeriod)}
            </div>
          </div>
        </div>
      </div>

      {/* Preview das datas */}
      {config.dates.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
          <h5 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Cronograma de Parcelas:
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {config.dates.map((date, index) => (
              <div
                key={index}
                className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-2 text-center"
              >
                <div className="font-medium text-zinc-600 dark:text-zinc-400">
                  {index + 1}ª parcela
                </div>
                <div className="text-zinc-800 dark:text-zinc-200 mt-1">
                  {date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default InstallmentConfigComponent