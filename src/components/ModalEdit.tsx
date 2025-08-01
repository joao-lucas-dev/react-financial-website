import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import {
  IHandleUpdateTransaction,
  IOpenModal,
  ISetCurrentMonth,
  ISetOpenModal,
  ITransaction,
  RecurrenceType,
} from '../types/transactions.ts'
import Input from './Input.tsx'
import ModernDatePicker from './ModernDatePicker.tsx'
import ModernSelect, { SelectOption } from './ModernSelectRadix.tsx'
import RecurrenceOptions, { RecurrenceConfig } from './RecurrenceOptions.tsx'
import PaymentStatusIcon from './PaymentStatusIcon.tsx'
import CategoryIcon from './CategoryIcon/index.tsx'
import { X, Edit3, TrendingUp, TrendingDown } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ICategory } from '../types/categories.ts'
import { DateTime } from 'luxon'

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
  recurrence_config: z.object({
    mode: z.enum(['single', 'fixed']),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  }).optional(),
  is_paid: z.boolean(),
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
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaidManuallyOverridden, setIsPaidManuallyOverridden] = useState(false)

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
    setValue('is_paid', openModal.transaction.is_paid || false)

    const recurrenceConfig: RecurrenceConfig = {
      mode: openModal.transaction.is_recurring ? 'fixed' : 'single',
      frequency: openModal.transaction.recurrence_type,
    }
    setValue('recurrence_config', recurrenceConfig)

  }, [openModal.transaction, setValue])

  useEffect(() => {
    if (!isPaidManuallyOverridden) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(transactionDay)
      selectedDate.setHours(0, 0, 0, 0)

      const newIsPaid = selectedDate <= today
      if (newIsPaid !== isPaid) {
        setValue('is_paid', newIsPaid)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 1000)
      }
    }
  }, [transactionDay, isPaid, setValue, isPaidManuallyOverridden])

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
        const recurrenceConfig = data.recurrence_config || { mode: 'single' }
        let recurrenceType: RecurrenceType = 'none'

        if (recurrenceConfig.mode === 'fixed' && recurrenceConfig.frequency) {
          recurrenceType = recurrenceConfig.frequency as RecurrenceType
        }

        const updatedTransaction = {
          ...openModal.transaction,
          description: data.description,
          price: Number(data.price.replace(/\D/g, '')) / 100,
          category_id: Number(data.category),
          transaction_day: new Date(`${data.transaction_day}T00:00:00`),
          is_recurring: recurrenceConfig.mode !== 'single',
          recurrence_type: recurrenceType,
          is_paid: data.is_paid,
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

        <form
          onSubmit={handleSubmit(handleUpdate)}
          className="flex flex-col h-full"
        >
          <div
            className="flex-1 overflow-y-auto space-y-4 pr-2"
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
                    error={
                      errors.category?.message === 'Required'
                        ? 'Selecione uma categoria'
                        : errors.category?.message
                    }
                    placeholder="Selecione uma categoria..."
                  />
                )}
              />
            )}

            <Controller
              name="recurrence_config"
              control={control}
              render={({ field }) => (
                <RecurrenceOptions
                  value={field.value as RecurrenceConfig}
                  onChange={(config) => field.onChange(config)}
                  error={errors.recurrence_config?.message}
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
