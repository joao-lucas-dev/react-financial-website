import React, { useState, useEffect } from 'react'
import { Calendar, Calculator } from 'lucide-react'
import ModernSelect, { SelectOption } from './ModernSelectRadix'

export type RecurrenceMode = 'single' | 'fixed' | 'installment'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
export type InstallmentPeriod = 'months' | 'years'

export interface RecurrenceConfig {
  mode: RecurrenceMode
  frequency?: RecurrenceFrequency
  installmentCount?: number
  installmentPeriod?: InstallmentPeriod
}

interface RecurrenceOptionsProps {
  label?: string
  value?: RecurrenceConfig
  onChange?: (config: RecurrenceConfig) => void
  disabled?: boolean
  required?: boolean
  error?: string
  hideFixedOption?: boolean
  totalAmount?: number
  selectedCardId?: string
  creditCards?: Array<{id: string, name: string, closingDay: number, dueDay: number}>
}

const RecurrenceOptions: React.FC<RecurrenceOptionsProps> = ({
  label = 'Tipo de Transação',
  value = { mode: 'single' },
  onChange,
  disabled = false,
  required = false,
  error,
  hideFixedOption = false,
  totalAmount = 0,
  selectedCardId,
  creditCards = []
}) => {
  const [selectedMode, setSelectedMode] = useState<RecurrenceMode>(value.mode)
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(value.frequency || 'monthly')
  const [installmentCount, setInstallmentCount] = useState<string>(
    value.installmentCount !== undefined && value.installmentCount !== null
      ? String(value.installmentCount)
      : '2'
  )
  const [installmentPeriod, setInstallmentPeriod] = useState<InstallmentPeriod>(value.installmentPeriod || 'months')

  // Sincronizar com o valor externo quando ele mudar
  useEffect(() => {
    setSelectedMode(value.mode)
    if (value.frequency) setFrequency(value.frequency)
    if (value.installmentCount !== undefined && value.installmentCount !== null) {
      setInstallmentCount(String(value.installmentCount))
    }
    if (value.installmentPeriod) setInstallmentPeriod(value.installmentPeriod)
  }, [value])

  // Reset to 'single' if 'fixed' is selected but hidden
  useEffect(() => {
    if (hideFixedOption && selectedMode === 'fixed') {
      setSelectedMode('single')
      onChange?.({ mode: 'single' })
    }
  }, [hideFixedOption, selectedMode, onChange])

  // Função para calcular prévia do parcelamento
  const calculateInstallmentPreview = () => {
    if (!totalAmount || selectedMode !== 'installment' || !selectedCardId || selectedCardId === 'account') {
      return null
    }

    const selectedCard = creditCards.find(card => card.id === selectedCardId)
    if (!selectedCard) return null

    const countNum = parseInt(installmentCount, 10)
    if (!countNum || Number.isNaN(countNum) || countNum <= 0) return null
    const monthlyAmount = totalAmount / countNum
    
    return {
      monthlyAmount,
      selectedCard
    }
  }

  const installmentPreview = calculateInstallmentPreview()

  // Opções de frequência para transação fixa
  const frequencyOptions: SelectOption[] = [
    {
      value: 'daily',
      label: 'Diário',
      icon: <Calendar className="w-4 h-4 text-blue-500" />
    },
    {
      value: 'weekly',
      label: 'Semanal',
      icon: <Calendar className="w-4 h-4 text-green-500" />
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
      value: 'semiannual',
      label: 'Semestral',
      icon: <Calendar className="w-4 h-4 text-indigo-500" />
    },
    {
      value: 'annual',
      label: 'Anual',
      icon: <Calendar className="w-4 h-4 text-purple-500" />
    }
  ]

  // Opções de período para parcelamento
  const periodOptions: SelectOption[] = [
    {
      value: 'months',
      label: 'Meses',
      icon: <Calculator className="w-4 h-4 text-teal-500" />
    },
    {
      value: 'years',
      label: 'Anos',
      icon: <Calculator className="w-4 h-4 text-purple-500" />
    }
  ]

  const handleModeChange = (mode: RecurrenceMode) => {
    setSelectedMode(mode)
    
    const config: RecurrenceConfig = { mode }
    
    if (mode === 'fixed') {
      config.frequency = frequency
    } else if (mode === 'installment') {
      const parsed = parseInt(installmentCount, 10)
      config.installmentCount = Number.isNaN(parsed) ? undefined : parsed
      config.installmentPeriod = installmentPeriod
    }
    
    onChange?.(config)
  }

  const handleFrequencyChange = (newFrequency: string) => {
    const freq = newFrequency as RecurrenceFrequency
    setFrequency(freq)
    
    if (selectedMode === 'fixed') {
      onChange?.({
        mode: 'fixed',
        frequency: freq
      })
    }
  }

  const handleInstallmentCountChange = (raw: string) => {
    if (raw === '') {
      setInstallmentCount('')
      if (selectedMode === 'installment') {
        onChange?.({
          mode: 'installment',
          installmentCount: undefined,
          installmentPeriod,
        })
      }
      return
    }

    const digits = raw.replace(/\D/g, '')
    setInstallmentCount(digits)

    if (selectedMode === 'installment') {
      const parsed = parseInt(digits, 10)
      onChange?.({
        mode: 'installment',
        installmentCount: Number.isNaN(parsed) ? undefined : parsed,
        installmentPeriod,
      })
    }
  }

  const clampInstallmentCountOnBlur = () => {
    if (installmentCount === '') return
    let parsed = parseInt(installmentCount, 10)
    if (Number.isNaN(parsed)) {
      setInstallmentCount('')
      return
    }
    if (parsed < 2) parsed = 2
    if (parsed > 240) parsed = 240
    setInstallmentCount(String(parsed))
    if (selectedMode === 'installment') {
      onChange?.({
        mode: 'installment',
        installmentCount: parsed,
        installmentPeriod,
      })
    }
  }

  const handleInstallmentPeriodChange = (period: string) => {
    const installmentPer = period as InstallmentPeriod
    setInstallmentPeriod(installmentPer)
    
    if (selectedMode === 'installment') {
      const parsed = parseInt(installmentCount, 10)
      onChange?.({
        mode: 'installment',
        installmentCount: Number.isNaN(parsed) ? undefined : parsed,
        installmentPeriod: installmentPer
      })
    }
  }

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      
      {/* Radio buttons para seleção do modo */}
      <div className="space-y-2 mb-4">
        {/* Caso único */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="recurrence-mode"
            value="single"
            checked={selectedMode === 'single'}
            onChange={() => handleModeChange('single')}
            className="w-4 h-4 text-teal-600 border-zinc-300 dark:border-zinc-600 focus:ring-teal-500 focus:ring-2"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Caso único
          </span>
        </label>

        {/* Transação fixa - apenas quando não é cartão */}
        {!hideFixedOption && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="recurrence-mode"
              value="fixed"
              checked={selectedMode === 'fixed'}
              onChange={() => handleModeChange('fixed')}
              className="w-4 h-4 text-teal-600 border-zinc-300 dark:border-zinc-600 focus:ring-teal-500 focus:ring-2"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Transação fixa
            </span>
          </label>
        )}

        {/* Parcelado */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="recurrence-mode"
            value="installment"
            checked={selectedMode === 'installment'}
            onChange={() => handleModeChange('installment')}
            className="w-4 h-4 text-teal-600 border-zinc-300 dark:border-zinc-600 focus:ring-teal-500 focus:ring-2"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Parcelado
          </span>
        </label>
      </div>

      {/* Select de frequência quando "Despesa fixa" está selecionado */}
      {selectedMode === 'fixed' && (
        <div className="mt-3">
          <ModernSelect
            label="Frequência"
            options={frequencyOptions}
            value={frequency}
            onChange={handleFrequencyChange}
            placeholder="Selecione a frequência"
            disabled={disabled}
          />
        </div>
      )}

      {/* Inputs de parcelamento quando "Parcelado" está selecionado */}
      {selectedMode === 'installment' && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Número de Parcelas
              </label>
              <input
                type="number"
                min="2"
                max="240"
                value={installmentCount}
                onChange={(e) => handleInstallmentCountChange(e.target.value)}
                onBlur={clampInstallmentCountOnBlur}
                disabled={disabled}
                className="
                  w-full h-10 px-3 py-2 rounded-lg border transition-colors
                  border-zinc-300 dark:border-zinc-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                  bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                "
              />
            </div>
            
            <div>
              <ModernSelect
                label="Período"
                options={periodOptions}
                value={installmentPeriod}
                onChange={handleInstallmentPeriodChange}
                placeholder="Selecione o período"
                disabled={disabled}
              />
            </div>
          </div>
          
          {/* Preview do parcelamento */}
          {installmentPreview ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calculator size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Prévia do Parcelamento
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Valor total:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Valor por parcela:</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {installmentPreview.monthlyAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Cartão:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {installmentPreview.selectedCard.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Parcelas:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {installmentCount || '—'}x {installmentPeriod === 'months' ? 'mensais' : 'anuais'}
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Fechamento: dia {installmentPreview.selectedCard.closingDay} | Vencimento: dia {installmentPreview.selectedCard.dueDay}
                  </div>
                </div>
              </div>
            </div>
          ) : totalAmount > 0 && selectedMode === 'installment' && (selectedCardId === 'account' || !selectedCardId) ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="text-sm text-amber-700 dark:text-amber-300">
                Selecione um cartão de crédito para ver a prévia do parcelamento
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Dividir em {installmentCount || '—'} parcelas {installmentPeriod === 'months' ? 'mensais' : 'anuais'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <span className="text-red-500 mt-2 text-sm">{error}</span>
      )}
    </div>
  )
}

export default RecurrenceOptions
