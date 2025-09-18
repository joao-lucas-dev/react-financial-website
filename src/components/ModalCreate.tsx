import { zodResolver } from '@hookform/resolvers/zod'
import { TrendingDown, TrendingUp, X } from 'lucide-react'
import { DateTime } from 'luxon'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ICategory } from '../types/categories.ts'
import { ICreditCard } from '../types/creditCards.ts'
import {
  IHandleCreateCompleteTransaction,
  IOpenModal,
  ISetCurrentMonth,
  ISetOpenModal,
  ITransaction,
  RecurrenceType,
} from '../types/transactions.ts'
import CategoryIcon from './CategoryIcon/index.tsx'
import Input from './Input.tsx'
import InvoiceSelector from './InvoiceSelector.tsx'
import ModernDatePicker from './ModernDatePicker.tsx'
import ModernSelect, { SelectOption } from './ModernSelectRadix.tsx'
import PaymentStatusIcon from './PaymentStatusIcon.tsx'
import RecurrenceOptions, { RecurrenceConfig } from './RecurrenceOptions.tsx'

interface IParams {
  openModal: IOpenModal
  setOpenModal: ISetOpenModal
  handleCreateCompleteTransaction: IHandleCreateCompleteTransaction
  handleCreateInstallmentTransaction: (transaction: ITransaction, currentMonth: number, setCurrentMonth?: any, from?: string) => Promise<void>;
  handleCreateRecurringTransaction: (transaction: ITransaction, currentMonth: number, setCurrentMonth?: any, from?: string) => Promise<void>;
  currentMonth: number
  setCurrentMonth: ISetCurrentMonth
  categories: ICategory[]
  creditCards: ICreditCard[]
  from?: string
  retryCategories?: () => void
}

const modalCreateSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.string().min(1, 'Preço é obrigatório'),
  transaction_day: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data é obrigatória e deve ser uma data válida',
  }),
  category: z.string().min(1, 'Categoria é obrigatória'),
  card_id: z.string().optional(),
  invoice_date: z.string().optional(),
  recurrence_config: z.object({
    mode: z.enum(['single', 'fixed', 'installment']),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual']).optional(),
    installmentCount: z.number().optional(),
    installmentPeriod: z.enum(['months', 'years']).optional(),
  }).optional(),
  is_paid: z.boolean(),
})

type ModalCreateData = z.infer<typeof modalCreateSchema>

const ModalCreate = ({
  openModal,
  setOpenModal,
  handleCreateCompleteTransaction,
  handleCreateInstallmentTransaction,
  handleCreateRecurringTransaction,
  currentMonth,
  setCurrentMonth,
  categories,
  creditCards,
  from = 'transactions',
  retryCategories,
}: IParams) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaidManuallyOverridden, setIsPaidManuallyOverridden] = useState(false)

  const getType = useCallback(() => {
    if (openModal.button === 'income') return 'Receita'
    if (openModal.button === 'outcome') return 'Despesa'
  }, [openModal.button])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ModalCreateData>({
    resolver: zodResolver(modalCreateSchema),
  })

  const transactionDay = watch('transaction_day')
  const isPaid = watch('is_paid')
  const cardId = watch('card_id')
  const price = watch('price')
  const invoiceDate = watch('invoice_date')

  // Converter preço formatado para número
  const getTotalAmount = () => {
    if (!price) return 0
    return Number(price.replace(/\D/g, '')) / 100
  }

  // Encontrar cartão selecionado
  const selectedCard = creditCards.find(card => card.id === cardId)

  useEffect(() => {
    const transactionDate = openModal.transaction?.transaction_day
      ? new Date(`${openModal.transaction.transaction_day}T00:00:00`)
      : new Date()

    const formattedDate = DateTime.fromJSDate(transactionDate, {
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).toFormat('yyyy-MM-dd')

    setValue('transaction_day', formattedDate)
    setValue('recurrence_config', { mode: 'single' })
    setValue('card_id', "account")
    
    // Definir is_paid inicial baseado na data, mas permitir override manual
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    transactionDate.setHours(0, 0, 0, 0)
    const initialIsPaid = transactionDate <= today
    setValue('is_paid', initialIsPaid)
    setIsPaidManuallyOverridden(false) // Reset manual override flag
  }, [setValue, openModal.transaction?.transaction_day])

  useEffect(() => {
    if (isPaidManuallyOverridden) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(transactionDay)
    selectedDate.setHours(0, 0, 0, 0)

    // Regra:
    // - Se for cartão -> não pago
    // - Se não for cartão e o dia for futuro -> não pago
    // - Caso contrário (hoje ou passado) -> pago
    const isCard = Boolean(cardId && cardId !== 'account')
    const newIsPaid = isCard ? false : selectedDate <= today

    if (newIsPaid !== isPaid) {
      setValue('is_paid', newIsPaid)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }, [transactionDay, cardId, isPaid, setValue, isPaidManuallyOverridden])

  const handleToggleIsPaid = () => {
    setIsPaidManuallyOverridden(true)
    setValue('is_paid', !isPaid)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1000)
  }

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value.replace(/\D/g, '')

      if (inputValue) {
        const originalValue = Number(inputValue) / 100
        const formattedValue = originalValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        setValue('price', formattedValue)
      } else {
        setValue('price', '')
      }
    },
    [setValue],
  )

  // Função para calcular data final baseada no parcelamento
  const calculateEndDate = (startDate: Date, installmentCount: number, installmentPeriod: 'months' | 'years') => {
    const endDate = new Date(startDate)
    
    if (installmentPeriod === 'months') {
      endDate.setMonth(endDate.getMonth() + installmentCount - 1)
    } else if (installmentPeriod === 'years') {
      endDate.setFullYear(endDate.getFullYear() + installmentCount - 1)
    }
    
    return endDate
  }

  const handleCreate = useCallback(
    async (data: ModalCreateData) => {
      try {
        const transactionDate = new Date(`${data.transaction_day}T00:00:00`)

        const recurrenceConfig = data.recurrence_config || { mode: 'single' }

        if (recurrenceConfig.mode === 'installment') {
          const createInstallmentTransaction = {
            type: openModal.button,
            description: data.description,
            price: Number(data.price.replace(/\D/g, '')) / 100,
            category_id: Number(data.category),
            transaction_day: transactionDate,
            shared_id: null,
            installments: recurrenceConfig.installmentCount,
            is_paid: data.is_paid,
            card_id: data.card_id === 'account' ? null : data.card_id,
            fromCreditCard: data.card_id !== 'account',
            invoice_date: data.invoice_date,
          } as unknown as ITransaction


          await handleCreateInstallmentTransaction(
            createInstallmentTransaction,
            currentMonth,
            setCurrentMonth,
            from,
          )
        } else if (recurrenceConfig.mode === 'fixed') {
          let recurrencePattern: RecurrenceType = 'monthly'
          let endDate: Date | undefined = undefined
          let adjustedPrice = Number(data.price.replace(/\D/g, '')) / 100

          recurrencePattern = recurrenceConfig.frequency as RecurrenceType

          const createRecurringTransaction = {
            type: openModal.button,
            description: data.description,
            price: adjustedPrice,
            category_id: Number(data.category),
            start_date: transactionDate,
            transaction_day: transactionDate,
            shared_id: null,
            recurrence_pattern: recurrencePattern,
            recurrence_interval: 1,
            end_date: endDate,
            is_paid: data.is_paid,
            card_id: data.card_id === 'account' ? null : data.card_id,
            fromCreditCard: data.card_id !== 'account',
          } as unknown as ITransaction


          await handleCreateRecurringTransaction(
            createRecurringTransaction,
            currentMonth,
            setCurrentMonth,
            from,
          )
        } else {
          const createTransaction = {
            type: openModal.button,
            description: data.description,
            price: Number(data.price.replace(/\D/g, '')) / 100,
            category_id: Number(data.category),
            transaction_day: transactionDate,
            shared_id: null,
            is_recurring: recurrenceConfig.mode !== 'single',
            is_paid: data.is_paid,
            card_id: data.card_id === 'account' ? null : data.card_id,
            fromCreditCard: data.card_id !== 'account',
            invoice_date: data.invoice_date,
          } as unknown as ITransaction


          await handleCreateCompleteTransaction(
            createTransaction,
            currentMonth,
            setCurrentMonth,
            from,
          )
        }

        setOpenModal({
          isOpen: false,
          transaction: {} as ITransaction,
          type: '',
        })
      } catch (err) {
        console.error(err)
      }
    },
    [
      handleCreateCompleteTransaction,
      handleCreateInstallmentTransaction,
      handleCreateRecurringTransaction,
      openModal.button,
      setOpenModal,
      currentMonth,
      setCurrentMonth,
    ],
  )

  const categoryOptions: SelectOption[] = categories && categories.length > 0 
    ? categories
        .filter((cat) => {
          if (openModal.button === 'income') {
            return cat.type === 'income' || cat.type === 'both'
          }
          return cat.type !== 'income'
        })
        .map((cat) => ({
          value: String(cat.id),
          label: cat.name,
          icon: <CategoryIcon size="small" category={cat} />,
        }))
    : []

  const paymentMethodOptions: SelectOption[] = [
    { value: 'account', label: 'Conta Principal' },
    ...(creditCards || []).map((card) => ({
      value: card.id,
      label: `${card.name} **** ${card.maskedNumber.slice(-4)}`,
    })),
  ]

  return (
    <div
      className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpenModal({
            isOpen: false,
            transaction: {} as ITransaction,
            type: '',
          })
        }
      }}
    >
      <div className="bg-white dark:bg-zinc-800 w-[600px] max-w-[90vw] max-h-[95vh] rounded-2xl shadow-2xl p-8 relative transition-colors overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                openModal.button === 'income'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              {openModal.button === 'income' ? (
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-200">
                Criar {getType()}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Preencha os dados da {getType()?.toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setOpenModal({
                isOpen: false,
                transaction: {} as ITransaction,
                type: '',
              })
            }}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleCreate)}
          className="flex flex-col h-full"
        >
          <div
            className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-2"
            style={{ maxHeight: 'calc(95vh - 200px)' }}
          >
            <div>
              <Input
                label="Descrição"
                placeholder="Ex: Almoço no restaurante, Salário janeiro..."
                required={true}
                compact={true}
                {...register('description')}
              />
              {errors.description && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Valor"
                  placeholder="R$ 0,00"
                  required={true}
                  compact={true}
                  {...register('price')}
                  onChange={handleChange}
                />
                {errors.price && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.price.message}
                  </span>
                )}
              </div>

              <div>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Controller
                      name="transaction_day"
                      control={control}
                      render={({ field }) => (
                        <ModernDatePicker
                          label="Data da Transação"
                          value={field.value}
                          onChange={(date) => {
                            field.onChange(date)
                            // Reset manual override quando data for alterada
                            setIsPaidManuallyOverridden(false)
                          }}
                          required={true}
                          error={errors.transaction_day?.message}
                        />
                      )}
                    />
                  </div>
                  <PaymentStatusIcon
                    isPaid={isPaid}
                    isAnimating={isAnimating}
                    onClick={handleToggleIsPaid}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <ModernSelect
                      label="Categoria"
                      options={categoryOptions}
                      value={field.value}
                      onChange={field.onChange}
                      required={true}
                      error={
                        errors.category?.message === 'Required'
                          ? 'Selecione uma categoria'
                          : errors.category?.message
                      }
                      placeholder={
                        categories.length === 0 
                          ? "Carregando categorias..." 
                          : "Selecione uma categoria..."
                      }
                      disabled={categories.length === 0}
                    />
                  )}
                />
                {categories.length === 0 && retryCategories && (
                  <button
                    type="button"
                    onClick={retryCategories}
                    className="mt-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline"
                  >
                    Tentar carregar categorias novamente
                  </button>
                )}
              </div>
              <div>
                <Controller
                  name="card_id"
                  control={control}
                  render={({ field }) => (
                    <ModernSelect
                      label="Método de Pagamento"
                      options={paymentMethodOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione um método..."
                    />
                  )}
                />
                
                {/* Seletor de fatura para cartões de crédito */}
                {cardId && cardId !== 'account' && (
                  <Controller
                    name="invoice_date"
                    control={control}
                    render={({ field }) => (
                      <InvoiceSelector
                        selectedCard={selectedCard}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                )}
              </div>
            </div>

            <Controller
              name="recurrence_config"
              control={control}
              render={({ field }) => (
                <RecurrenceOptions
                  value={field.value as RecurrenceConfig}
                  onChange={(config) => field.onChange(config)}
                  error={errors.recurrence_config?.message}
                  hideFixedOption={false}
                  totalAmount={getTotalAmount()}
                  selectedCardId={cardId}
                  creditCards={creditCards}
                />
              )}
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-700 mt-6">
            <button
              type="button"
              onClick={() => {
                setOpenModal({
                  isOpen: false,
                  transaction: {} as ITransaction,
                  type: '',
                })
              }}
              className="flex-1 px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                openModal.button === 'income'
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
              }`}
            >
              Criar {getType()}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalCreate
