import { forwardRef, useState } from 'react'
import { Home, Settings, User, Book, Camera, ChevronDown } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'

const categories = [
  { name: 'Home', icon: <Home className="w-4 h-4 mr-2" /> },
  { name: 'Settings', icon: <Settings className="w-4 h-4 mr-2" /> },
  { name: 'Profile', icon: <User className="w-4 h-4 mr-2" /> },
  { name: 'Library', icon: <Book className="w-4 h-4 mr-2" /> },
  { name: 'Gallery', icon: <Camera className="w-4 h-4 mr-2" /> },
]

const CustomSelect = forwardRef(({ value, onChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedCategory =
    categories.find((cat) => cat.name === value) || categories[0]

  const handleSelect = (category) => {
    onChange(category.name) // Notifica o react-hook-form sobre a mudança
    setIsOpen(false)
  }

  return (
    <div className="relative w-64" ref={ref}>
      {/* Botão do dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
      >
        <div className="flex items-center">
          {selectedCategory.icon}
          {selectedCategory.name}
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Lista de opções */}
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => handleSelect(category)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              {category.icon}
              {category.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

const App = () => {
  const { control, handleSubmit } = useForm()

  const onSubmit = (data) => {
    console.log('Form data:', data)
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Selecione uma categoria:</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="category" // Nome do campo no formulário
          control={control}
          defaultValue="Home" // Valor inicial
          render={({ field }) => (
            <CustomSelect
              {...field} // Passa value e onChange para o CustomSelect
            />
          )}
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}

export default App
