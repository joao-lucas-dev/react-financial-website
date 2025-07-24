import { ChangeEvent, useCallback, useEffect } from 'react'
import {
  IHandleUpdateTransaction,
  IOpenModal,
  ISetCurrentMonth,
  ISetOpenModal,
  ITransaction,
} from '../types/transactions.ts'
import Input from './Input.tsx'
import Button from './Button.tsx'
import { X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SelectInput from './SelectInput.tsx'
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
  price: z.string().min(1, 'Preço é obrigatorio'),
  transaction_day: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data é obrigatória e deve ser uma data válida',
  }),
  category: z.string(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  recurrence: z.string().min(1, 'Recorrência é obrigatória'),
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
      // Se já vier string, tenta formatar
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
    setValue('recurrence', openModal.transaction.is_recurring ? 'true' : 'false')
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
          shared_id: null,
          type: data.type,
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
    ],
  )

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
      <div className="bg-white dark:bg-black-bg w-[490px] rounded-lg shadow-lg p-6 relative">
        <div className="flex justify-between  dark:text-softGray">
          <h2 className="text-lg font-semibold">Editar item</h2>
          <button
            onClick={() => {
              setOpenModal({
                isOpen: false,
                transaction: {} as ITransaction,
                type: '',
              })
            }}
          >
            <X />
          </button>
        </div>
        <div>
          <form onSubmit={handleSubmit(handleUpdate)}>
            <Input label="Descrição" {...register('description')} />
            <span className="text-red-500 my-4 text-sm">
              {errors.description?.message}
            </span>

            <div className="flex justify-between items-center">
              <div className="w-[200px]">
                <Input
                  label="Valor"
                  {...register('price')}
                  onChange={handleChange}
                />
                <span className="text-red-500 my-4 text-sm">
                  {errors.price?.message}
                </span>
              </div>

              <div className="w-[200px]">
                <Input
                  label="Data"
                  type="date"
                  {...register('transaction_day')}
                />
                <span className="text-red-500 my-4 text-sm">
                  {errors.transaction_day?.message}
                </span>
              </div>
            </div>

            {categories.length > 0 && (
              <Controller
                render={(field) => {
                  let filteredCategories = categories;
                  if (openModal.transaction.type === 'income') {
                    filteredCategories = categories.filter(
                      (cat) => cat.type === 'income' || cat.type === 'both',
                    );
                  } else if (openModal.transaction.type === 'outcome') {
                    filteredCategories = categories.filter(
                      (cat) => cat.type === 'outcome' || cat.type === 'both',
                    );
                  }
                  // Se o filtro retornar vazio, mostra todas
                  if (!filteredCategories.length) {
                    filteredCategories = categories;
                  }
                  return (
                    <SelectInput
                      {...field}
                      // @ts-expect-error TS2322
                      categories={filteredCategories}
                    />
                  );
                }}
                name="category"
                control={control}
              />
            )}

            <span className="text-red-500 my-4 text-sm">
              {errors.category?.message}
            </span>

            <div className="flex flex-col mt-4">
              <label className="text-md font-semibold text-gray dark:text-softGray">
                Tipo de transação
                <span className="text-red-600">*</span>
              </label>
              <select
                {...register('type')}
                className="focus:outline-primary border border-softGray dark:bg-zinc-800 dark:border-zinc-700 dark:text-softGray h-12 rounded-lg mt-2 px-5"
              >
                <option value="income">Entrada</option>
                <option value="outcome">Saída</option>
              </select>
              <span className="text-red-500 my-4 text-sm">
                {errors.type?.message}
              </span>
            </div>

            <div className="flex flex-col">
              <label className="text-md font-semibold text-gray dark:text-softGray">
                Recorrência mensal?
              </label>
              <select
                className="focus:outline-primary border border-softGray dark:bg-zinc-800 dark:border-zinc-700 dark:text-softGray h-12 rounded-lg mt-2 px-5"
                {...register('recurrence')}
              >
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </div>

            <Button title="Atualizar" type="submit" />
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalEdit
