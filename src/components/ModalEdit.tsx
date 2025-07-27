import { ChangeEvent, useCallback, useEffect } from 'react'
import {
  IHandleUpdateTransaction,
  IOpenModal,
  ISetCurrentMonth,
  ISetOpenModal,
  ITransaction,
  RecurrenceType,
  PaymentStatus,
} from '../types/transactions.ts'
import Input from './Input.tsx'
import ModernDatePicker from './ModernDatePicker.tsx'
import ModernSelect, { SelectOption } from './ModernSelect.tsx'
import PaymentStatusComponent from './PaymentStatus.tsx'
import RecurrenceSelector from './RecurrenceSelector.tsx'
import CategoryIcon from './CategoryIcon/index.tsx'
import { X, Edit3, TrendingUp, TrendingDown } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ICategory } from '../types/categories.ts'

interface IParams {
  openModal: IOpenModal
  setOpenModal: ISetOpenModal
  handleUpdateTransaction: IHandleUpdateTransaction
  currentMonth: number
  setCurrentMonth: ISetCurrentMonth
  categories: ICategory[]
  from: string
}

const modalEditSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.string().min(1, 'Preço é obrigatório'),
  transaction_day: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data é obrigatória e deve ser uma data válida',
  }),
  category: z.string().min(1, 'Categoria é obrigatória'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  recurrence_type: z.string().optional(),
  payment_status: z.string().optional(),
})

type ModalEditData = z.infer<typeof modalEditSchema>

const ModalEdit = ({
  openModal,
  setOpenModal,
  handleUpdateTransaction,
  currentMonth,
  setCurrentMonth,
  categories,
  from,
}: IParams) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ModalEditData>({
    resolver: zodResolver(modalEditSchema),
  })

  useEffect(() => {
    setValue('description', openModal.transaction.description || '')
    
    // Formatar valor como moeda brasileira
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
    
    setValue(
      'transaction_day',
      openModal.transaction.transaction_day
        ? openModal.transaction.transaction_day.split('T')[0]
        : ''
    )
    setValue('category', openModal.transaction.category?.id ? String(openModal.transaction.category.id) : '')
    setValue('type', openModal.transaction.type || '')
    
    // Novos campos
    setValue('recurrence_type', openModal.transaction.recurrence_type || 'none')
    setValue('payment_status', openModal.transaction.payment_status || 'unpaid')
  }, [openModal.transaction, setValue])

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
        const updatedTransaction = {
          ...openModal.transaction,
          description: data.description,
          price: Number(data.price.replace(/\D/g, '')) / 100,
          category_id: Number(data.category),
          transaction_day: new Date(`${data.transaction_day}T00:00:00`),
          type: data.type,
          is_recurring: data.recurrence_type !== 'none',
          recurrence_type: data.recurrence_type as RecurrenceType,
          payment_status: data.payment_status as PaymentStatus,
          is_paid: data.payment_status === 'paid',
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
    ],
  )

  // Preparar opções de categoria para o ModernSelect
  const categoryOptions: SelectOption[] = categories
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

  // Opções de tipo de transação
  const typeOptions: SelectOption[] = [
    {
      value: 'income',
      label: 'Receita',
      icon: <TrendingUp className="w-4 h-4 text-green-500" />,
    },
    {
      value: 'outcome',
      label: 'Despesa',
      icon: <TrendingDown className="w-4 h-4 text-red-500" />,
    },
  ]

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={e => {
      if (e.target === e.currentTarget) {
        setOpenModal({
          isOpen: false,
          transaction: {} as ITransaction,
          type: '',
        })
      }
    }}>
      <div className="bg-white dark:bg-zinc-800 w-[600px] max-w-[90vw] max-h-[95vh] rounded-2xl shadow-2xl p-8 relative transition-colors overflow-hidden">
        {/* Header moderno */}
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

        {/* Form com layout moderno */}
        <form onSubmit={handleSubmit(handleUpdate)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          {/* Descrição */}
          <Input
            label="Descrição"
            placeholder="Ex: Almoço no restaurante, Salário janeiro..."
            required={true}
            {...register('description')}
          />
          {errors.description && (
            <span className="text-red-500 text-sm">
              {errors.description.message}
            </span>
          )}

          {/* Valor, Data e Tipo - Layout em grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Input
                label="Valor"
                placeholder="R$ 0,00"
                required={true}
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
              <Controller
                name="transaction_day"
                control={control}
                render={({ field }) => (
                  <ModernDatePicker
                    label="Data da Transação"
                    value={field.value}
                    onChange={field.onChange}
                    required={true}
                    error={errors.transaction_day?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <ModernSelect
                    label="Tipo"
                    options={typeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    required={true}
                    error={errors.type?.message}
                    isSearchable={false}
                    placeholder="Selecione o tipo..."
                  />
                )}
              />
            </div>
          </div>

          {/* Categoria */}
          {categoryOptions.length > 0 && (
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
                  error={errors.category?.message}
                  placeholder="Selecione uma categoria..."
                />
              )}
            />
          )}

          {/* Sistema de Recorrência */}
          <Controller
            name="recurrence_type"
            control={control}
            render={({ field }) => (
              <RecurrenceSelector
                value={field.value as RecurrenceType}
                onChange={(recurrenceType) => field.onChange(recurrenceType)}
                transactionDate={watch('transaction_day')}
                showPreview={true}
              />
            )}
          />

          {/* Sistema de Pagamento */}
          <Controller
            name="payment_status"
            control={control}
            render={({ field }) => (
              <PaymentStatusComponent
                value={field.value as PaymentStatus}
                onChange={field.onChange}
                transactionDate={watch('transaction_day')}
                showAutoLogic={true}
              />
            )}
          />
          </div>

          {/* Botões fixos no final */}
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
    </div>
  )
}

export default ModalEdit