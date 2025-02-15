import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { IRow, ITransaction } from '../types/transactions.ts'
import Input from './Input.tsx'
import Button from './Button.tsx'
import { X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SelectInput from './SelectInput.tsx'
import api from '../api/axiosInstance.ts'

interface IParams {
  openModal: {
    isOpen: boolean
    transaction: ITransaction
    type: string
    button?: string
  }
  setOpenModal: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean
      transaction: ITransaction
      type: string
      button?: string
    }>
  >
  handleCreateCompleteTransaction: (
    createTransaction: any,
    currentMonth: number,
    setCurrentMonth: Dispatch<SetStateAction<number>>,
  ) => Promise<void>
  currentMonth: number
  setCurrentMonth: React.Dispatch<number>
}

const modalEditSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.string().min(1, 'Preço é obrigatorio'),
  transaction_day: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data é obrigatória e deve ser uma data válida',
  }),
  category: z.string(),
})

type ModalCreateData = z.infer<typeof modalEditSchema>

const ModalCreate = ({
  openModal,
  setOpenModal,
  handleCreateCompleteTransaction,
  currentMonth,
  setCurrentMonth,
}: IParams) => {
  const [categories, setCategories] = useState([])

  const getType = useCallback(() => {
    if (openModal.button === 'income') return 'entrada'

    if (openModal.button === 'outcome') return 'saída'

    return 'diário'
  }, [openModal.button])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<ModalCreateData>({
    resolver: zodResolver(modalEditSchema),
  })

  const getCategories = useCallback(async () => {
    const { data } = await api.get('/categories')
    setCategories(data)
  }, [setCategories])

  useEffect(() => {
    getCategories()
    setValue('transaction_day', new Date().toISOString().split('T')[0])
  }, [setValue, getCategories])

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

  const handleCreate = useCallback(
    async (data: ModalCreateData) => {
      try {
        const createTransaction = {
          type: openModal.button,
          description: data.description,
          price: Number(data.price.replace(/\D/g, '')) / 100,
          category_id: Number(data.category),
          transaction_day: new Date(`${data.transaction_day}T00:00:00`),
          shared_id: null,
        }

        await handleCreateCompleteTransaction(
          createTransaction,
          currentMonth,
          setCurrentMonth,
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
      handleCreateCompleteTransaction,
      openModal.transaction,
      setOpenModal,
      currentMonth,
      setCurrentMonth,
    ],
  )

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-black-bg w-[490px] rounded-lg shadow-lg p-6 relative">
        <div className="flex justify-between  dark:text-softGray">
          <h2 className="text-lg font-semibold">Criar {getType()}</h2>
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
          <form onSubmit={handleSubmit(handleCreate)}>
            <Input
              label="Descrição"
              placeholder="Insira um descrição"
              {...register('description')}
            />
            <span className="text-red-500 my-4 text-sm">
              {errors.description?.message}
            </span>

            <div className="flex justify-between items-center">
              <div className="w-[200px]">
                <Input
                  label="Valor"
                  placeholder="R$ 0,00"
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
                render={(field) => (
                  <SelectInput {...field} categories={categories} />
                )}
                name="category"
                control={control}
              />
            )}

            <span className="text-red-500 my-4 text-sm">
              {errors.category?.message}
            </span>

            <Button title="Criar" type="submit" />
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalCreate
