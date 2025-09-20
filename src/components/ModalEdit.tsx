import { zodResolver } from '@hookform/resolvers/zod'
import { Edit3, X } from 'lucide-react'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ICategory } from '../types/categories.ts'
import { ICreditCard } from '../types/creditCards.ts'
import {
  EditMode,
  IHandleDeleteInstallmentTransaction,
  IHandleUpdateInstallmentTransaction,
  IHandleUpdateTransaction,
  InstallmentEditMode,
  IOpenModal,
  ISetCurrentMonth,
  ISetOpenModal,
  ITransaction,
  RecurrenceType,
} from '../types/transactions.ts'
import CategoryIcon from './CategoryIcon/index.tsx'
import Input from './Input.tsx'
import InstallmentTransactionOptions from './InstallmentTransactionOptions.tsx'
import ModernDatePicker from './ModernDatePicker.tsx'
import ModernSelect, { SelectOption } from './ModernSelectRadix.tsx'
import PaymentStatusIcon from './PaymentStatusIcon.tsx'
import RecurrenceOptions, { RecurrenceConfig } from './RecurrenceOptions.tsx'
import RecurringTransactionOptions from './RecurringTransactionOptions.tsx'
import InvoiceSelector from './InvoiceSelector.tsx'
import { calculateInvoicePeriod } from '../utils/invoiceCalculations.ts'

interface IParams {
  openModal: IOpenModal
  setOpenModal: ISetOpenModal
  handleUpdateTransaction: IHandleUpdateTransaction
  handleUpdateRecurringTransaction?: (
    updateTransaction: ITransaction,
    editMode: EditMode,
    currentMonth: number,
    setCurrentMonth: ISetCurrentMonth,
    from: string,
  ) => Promise<void>
  handleUpdateInstallmentTransaction?: IHandleUpdateInstallmentTransaction
  handleDeleteInstallmentTransaction?: IHandleDeleteInstallmentTransaction
  currentMonth: number
  setCurrentMonth: ISetCurrentMonth
  categories: ICategory[]
  creditCards: ICreditCard[]
  from: string
  retryCategories?: () => void
}

const modalEditSchema = z.object({
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
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual']).nullable().optional(),
    installmentCount: z.number().optional(),
    installmentPeriod: z.enum(['months', 'years']).optional(),
  }).optional(),
  is_paid: z.boolean(),
  edit_mode: z.enum(['instance_only', 'instance_and_future', 'all_instances']).optional(),
  installment_edit_mode: z.enum(['installment_only', 'installment_and_future', 'all_installments']).optional(),
  installments: z.number().optional(),
})

type ModalEditData = z.infer<typeof modalEditSchema>

const ModalEdit = ({
  openModal,
  setOpenModal,
  handleUpdateTransaction,
  handleUpdateRecurringTransaction,
  handleUpdateInstallmentTransaction,
  handleDeleteInstallmentTransaction,
  currentMonth,
  setCurrentMonth,
  categories,
  creditCards,
  from,
  retryCategories,
}: IParams) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaidManuallyOverridden, setIsPaidManuallyOverridden] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [showInstallmentModal, setShowInstallmentModal] = useState(false)
  const [pendingUpdateData, setPendingUpdateData] = useState<ModalEditData | null>(null)
  const [selectedEditMode, setSelectedEditMode] = useState<EditMode>('instance_only')
  const [selectedInstallmentEditMode, setSelectedInstallmentEditMode] = useState<InstallmentEditMode>('installment_only')

  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useForm<ModalEditData>({
    resolver: zodResolver(modalEditSchema),
  })

  const transactionDay = watch('transaction_day')
  const isPaid = watch('is_paid')
  const editMode = watch('edit_mode')
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

  const isRecurringTransaction = openModal.transaction.is_recurring === true ||
                                (openModal.transaction.recurrence_pattern && 
                                openModal.transaction.recurrence_pattern !== null && 
                                openModal.transaction.recurrence_pattern !== undefined &&
                                openModal.transaction.recurrence_pattern !== '')

  const isInstallmentTransaction = openModal.transaction.isinstallment

  useEffect(() => {
    setValue('description', openModal.transaction.description || '')

    const price = openModal.transaction.price
    let formattedPrice = ''
    if (typeof price === 'number' && !isNaN(price)) {
      formattedPrice = price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    } else if (typeof price === 'string') {
      const num = Number(price)
      if (!isNaN(num)) {
        formattedPrice = num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      } else {
        formattedPrice = price
      }
    }
    setValue('price', formattedPrice)

    const transactionDateStr = openModal.transaction.transaction_day
    const formattedDate = transactionDateStr ? transactionDateStr.split('T')[0] : ''
    setValue('transaction_day', formattedDate)

    setValue('category', openModal.transaction.category?.id ? String(openModal.transaction.category.id) : '')
    const initialCardId = openModal.transaction.card_id || 'account'
    setValue('card_id', initialCardId)
    
    // Carregar invoice_date se existir
    if (openModal.transaction.invoice?.invoice_date) {
      setValue('invoice_date', openModal.transaction.invoice.invoice_date)
    }
    // Definir is_paid: se existe valor na transação, usar ele; senão usar regra (cartão/data)
    const transactionIsPaid = openModal.transaction.is_paid
    if (transactionIsPaid !== undefined && transactionIsPaid !== null) {
      // Existe um valor definido na transação, usar ele
      setValue('is_paid', transactionIsPaid)
      setIsPaidManuallyOverridden(true) // Marcar como manual para não ser sobrescrito
    } else {
      // Não existe valor, usar regra automática
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const transactionDate = new Date(transactionDateStr)
      transactionDate.setHours(0, 0, 0, 0)
      const isCard = Boolean(initialCardId && initialCardId !== 'account')
      const initialIsPaid = isCard ? false : (transactionDate <= today)
      setValue('is_paid', initialIsPaid)
      setIsPaidManuallyOverridden(false) // Permitir mudança automática
    }

    // Preservar como pago quando a transação tiver payment_status='paid' ou paid_date
    // mesmo que não exista campo is_paid explícito (evita regressão para "não pago" ao editar)
    {
      const paymentStatus = (openModal.transaction as any)?.payment_status as string | undefined
      const hasPaidDate = Boolean(openModal.transaction.paid_date)
      const hasExplicitIsPaid = openModal.transaction.is_paid !== undefined && openModal.transaction.is_paid !== null
      if (!hasExplicitIsPaid && (paymentStatus === 'paid' || hasPaidDate)) {
        setValue('is_paid', true)
        setIsPaidManuallyOverridden(true)
      }
    }

    const recurrenceConfig = {
      mode: openModal.transaction.recurrence_pattern ? 'fixed' as const : 'single' as const,
      frequency: openModal.transaction.recurrence_pattern as RecurrenceType || null,
    }
    
    // Para transações parceladas, não definir recurrence_config
    if (!isInstallmentTransaction) {
      setValue('recurrence_config', recurrenceConfig)
    }

    if (isRecurringTransaction) {
      setValue('edit_mode', 'instance_only')
    }

    // Reset recurring modal state when modal opens
    setShowRecurringModal(false)
    setShowInstallmentModal(false)
    setPendingUpdateData(null)
    setSelectedEditMode('instance_only')
    setSelectedInstallmentEditMode('installment_only')

  }, [openModal.transaction, setValue, isRecurringTransaction, setIsPaidManuallyOverridden])

  // Definir fatura automaticamente quando cartão e data existem e não há valor manual
  useEffect(() => {
    const isCard = Boolean(cardId && cardId !== 'account')
    if (!isCard || !transactionDay) return
    
    // Não sobrescrever escolha manual/valor existente
    if (invoiceDate) return

    try {
      const cardAny: any = selectedCard as any
      const bestPurchaseDay: number | undefined = cardAny?.best_purchase_day ?? cardAny?.closingDay
      const paymentDueDay: number | undefined = cardAny?.payment_due_day ?? cardAny?.dueDay

      let computedInvoiceISO: string | null = null
      if (typeof bestPurchaseDay === 'number' && typeof paymentDueDay === 'number') {
        const info = calculateInvoicePeriod(transactionDay, bestPurchaseDay, paymentDueDay)
        computedInvoiceISO = info.invoice_date
      } else {
        console.warn('ModalEdit: faltam campos do ciclo (fechamento/vencimento) no cartão para calcular fatura automaticamente.')
        // Fallback: usar primeiro dia do mês da transação
        const dt = new Date(`${transactionDay}T00:00:00`)
        const firstOfMonth = new Date(dt.getFullYear(), dt.getMonth(), 1)
        computedInvoiceISO = firstOfMonth.toISOString()
      }

      if (computedInvoiceISO) {
        setValue('invoice_date', computedInvoiceISO)
      }
    } catch (e) {
      console.error('Erro ao calcular fatura automaticamente:', e)
    }
  }, [cardId, transactionDay, invoiceDate, selectedCard, setValue])

  useEffect(() => {
    // Não aplicar regra automática quando já há status pago conhecido
    if (isPaidManuallyOverridden) return
    const explicitIsPaid = openModal.transaction.is_paid
    const paymentStatusAuto = (openModal.transaction as any)?.payment_status as string | undefined
    const hasPaidDateAuto = Boolean(openModal.transaction.paid_date)
    if (explicitIsPaid !== undefined && explicitIsPaid !== null) return
    if (paymentStatusAuto === 'paid' || hasPaidDateAuto) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(transactionDay)
    selectedDate.setHours(0, 0, 0, 0)

    // Regra automática: cartão => não pago; caso contrário => pago se hoje/passado, não pago se futuro
    const isCard = Boolean(cardId && cardId !== 'account')
    const newIsPaid = isCard ? false : (selectedDate <= today)

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

  const handleUpdate = useCallback(
    async (data: ModalEditData) => {
      try {
        if (isRecurringTransaction) {
          setPendingUpdateData(data)
          setShowRecurringModal(true)
          return
        }

        if (isInstallmentTransaction) {
          setPendingUpdateData(data)
          setShowInstallmentModal(true)
          return
        }

        const recurrenceConfig = data.recurrence_config || { mode: 'single' }
        let recurrenceType: RecurrenceType | undefined = undefined

        if (recurrenceConfig.mode === 'fixed' && recurrenceConfig.frequency) {
          recurrenceType = recurrenceConfig.frequency as RecurrenceType
        }

        const updatedTransaction = {
          ...openModal.transaction,
          description: data.description,
          price: Number(data.price.replace(/\D/g, '')) / 100,
          category_id: Number(data.category),
          transaction_day: new Date(`${data.transaction_day}T00:00:00`),
          recurrence_pattern: recurrenceType,
          installments: recurrenceConfig.mode === 'installment' ? recurrenceConfig.installmentCount : undefined,
          is_paid: data.is_paid,
          card_id: data.card_id === 'account' ? null : data.card_id,
          invoice_date: data.invoice_date,
        } as unknown as ITransaction

        await handleUpdateTransaction(
          updatedTransaction,
          currentMonth,
          setCurrentMonth,
          from,
        )

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
      handleUpdateTransaction,
      openModal.transaction,
      setOpenModal,
      currentMonth,
      setCurrentMonth,
      from,
      isRecurringTransaction,
      isInstallmentTransaction,
    ],
  )

  const handleRecurringUpdate = useCallback(
    async () => {
      if (!pendingUpdateData || !handleUpdateRecurringTransaction) return

      try {
        const data = pendingUpdateData
        const recurrenceConfig = data.recurrence_config || { mode: 'single' }
        let recurrenceType: RecurrenceType | undefined = undefined

        if (recurrenceConfig.mode === 'fixed' && recurrenceConfig.frequency) {
          recurrenceType = recurrenceConfig.frequency as RecurrenceType
        }

        const updatedTransaction = {
          ...openModal.transaction,
          description: data.description,
          price: Number(data.price.replace(/\D/g, '')) / 100,
          category_id: Number(data.category),
          transaction_day: new Date(`${data.transaction_day}T00:00:00`),
          recurrence_pattern: recurrenceType,
          installments: recurrenceConfig.mode === 'installment' ? recurrenceConfig.installmentCount : undefined,
          is_paid: data.is_paid,
          card_id: data.card_id === 'account' ? null : data.card_id,
          invoice_date: data.invoice_date,
        } as unknown as ITransaction

        await handleUpdateRecurringTransaction(
          updatedTransaction,
          selectedEditMode,
          currentMonth,
          setCurrentMonth,
          from,
        )

        setShowRecurringModal(false)
        setPendingUpdateData(null)
        setSelectedEditMode('instance_only')
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
      pendingUpdateData,
      handleUpdateRecurringTransaction,
      openModal.transaction,
      currentMonth,
      setCurrentMonth,
      from,
      setOpenModal,
      selectedEditMode,
    ],
  )

  const handleInstallmentUpdate = useCallback(
    async () => {
      if (!pendingUpdateData || !handleUpdateInstallmentTransaction) return

      try {
        const data = pendingUpdateData
        const updatedTransaction = {
          ...openModal.transaction,
          description: data.description,
          price: Number(data.price.replace(/\D/g, '')) / 100,
          category_id: Number(data.category),
          transaction_day: new Date(`${data.transaction_day}T00:00:00`),
          is_paid: data.is_paid,
          card_id: data.card_id === 'account' ? null : data.card_id,
          invoice_date: data.invoice_date,
          installments: data.installments,
        } as unknown as ITransaction

        await handleUpdateInstallmentTransaction(
          updatedTransaction,
          selectedInstallmentEditMode,
          currentMonth,
          setCurrentMonth,
          from,
        )

        setShowInstallmentModal(false)
        setPendingUpdateData(null)
        setSelectedInstallmentEditMode('installment_only')
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
      pendingUpdateData,
      handleUpdateInstallmentTransaction,
      openModal.transaction,
      currentMonth,
      setCurrentMonth,
      from,
      setOpenModal,
      selectedInstallmentEditMode,
    ],
  )

  const categoryOptions: SelectOption[] = categories && categories.length > 0 
    ? categories
        .filter((cat) => {
          if (openModal.transaction.type === 'income') {
            return cat.type === 'income' || cat.type === 'both'
          } else if (openModal.transaction.type === 'outcome') {
            return cat.type === 'outcome' || cat.type === 'both'
          }
          return true
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
      <div className="bg-white dark:bg-zinc-800 w-[600px] max-w-[90vw] max-h-[95vh] rounded-2xl shadow-2xl p-8 relative transition-colors flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Edit3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-200">
                Editar Transação
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Altere os dados da transação
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

        {/* Indicador de transação parcelada */}
        {isInstallmentTransaction && openModal.transaction.installment_count && openModal.transaction.installment_all && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-sm">
                Transação Parcelada - Parcela {openModal.transaction.installment_count} de {openModal.transaction.installment_all}
              </span>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Esta é uma transação parcelada. As alterações podem afetar outras parcelas dependendo da opção escolhida.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(handleUpdate, () => {})}
          className="flex flex-col flex-1 min-h-0"
        >
          <div
            className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-4 pr-2"
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
            
            {!openModal.transaction.isinstallment && (
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
            )}

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
              className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Atualizar Transação
            </button>
          </div>
        </form>
      </div>

      {/* Modal separado para opções de transação recorrente */}
      {showRecurringModal && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-[60]">
          <div className="bg-white dark:bg-zinc-800 w-[600px] max-w-[90vw] rounded-2xl shadow-2xl p-8 relative transition-colors">
            <h2 className="text-xl font-bold mb-6 text-center text-zinc-700 dark:text-zinc-200">
              Como deseja editar esta transação recorrente?
            </h2>
            
            <RecurringTransactionOptions
              value={selectedEditMode}
              onChange={setSelectedEditMode}
              action="edit"
            />

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  setShowRecurringModal(false)
                  setPendingUpdateData(null)
                  setSelectedEditMode('instance_only')
                }}
                className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleRecurringUpdate}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
              >
                Confirmar Atualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal separado para opções de transação parcelada */}
      {showInstallmentModal && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-[60]">
          <div className="bg-white dark:bg-zinc-800 w-[600px] max-w-[90vw] rounded-2xl shadow-2xl p-8 relative transition-colors">
            <h2 className="text-xl font-bold mb-6 text-center text-zinc-700 dark:text-zinc-200">
              Como deseja editar esta transação parcelada?
            </h2>
            
            {/* Mostrar informações da parcela */}
            {openModal.transaction.installment_count && openModal.transaction.installment_all && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-center text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">
                    Parcela {openModal.transaction.installment_count} de {openModal.transaction.installment_all}
                  </span>
                </div>
              </div>
            )}
            
            <InstallmentTransactionOptions
              value={selectedInstallmentEditMode}
              onChange={setSelectedInstallmentEditMode}
              action="edit"
              currentInstallment={openModal.transaction.installment_count}
              totalInstallments={openModal.transaction.installment_all}
            />

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  setShowInstallmentModal(false)
                  setPendingUpdateData(null)
                  setSelectedInstallmentEditMode('installment_only')
                }}
                className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleInstallmentUpdate}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
              >
                Confirmar Atualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModalEdit
