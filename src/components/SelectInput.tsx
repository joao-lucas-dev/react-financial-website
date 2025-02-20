import { forwardRef, useEffect, useState, useRef } from 'react'
import CategoryIcon from './CategoryIcon'
import { ChevronDown } from 'lucide-react'

const SelectInput = forwardRef(({ field, categories }, ref) => {
  const { onChange } = field
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState({})
  const [dropdownDirection, setDropdownDirection] = useState('down')
  const dropdownRef = useRef(null)

  useEffect(() => {
    setSelectedCategory(
      categories.find((cat) => String(cat.id) === field.value),
    )
  }, [field.value, categories])

  const checkDropdownPosition = () => {
    if (dropdownRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      if (dropdownRect.bottom > windowHeight) {
        setDropdownDirection('up')
      } else {
        setDropdownDirection('down')
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkDropdownPosition()
    }
  }, [isOpen])

  const handleSelect = (category) => {
    onChange(String(category.id))
    setSelectedCategory(category)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full mt-4" ref={ref}>
      <span className="text-md font-semibold text-gray dark:text-softGray">
        Categorias<span className="text-red-600">*</span>
      </span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex h-12 mt-2 rounded-lg p-4 border border-softGray items-center justify-between bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
      >
        <div className="flex items-center">
          {selectedCategory ? (
            <>
              <CategoryIcon category={selectedCategory} />
              <span className="ml-2">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="font-sm text-zinc-400">Selecionar opção...</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute ${
            dropdownDirection === 'down' ? 'mt-1' : 'bottom-full mb-1'
          } w-full h-48 overflow-y-scroll bg-white border border-zinc-300 dark:border-zinc-700 rounded-md shadow-lg z-10`}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleSelect(category)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer hover:bg-zinc-100 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <CategoryIcon category={category} />
              <span className="ml-2">{category.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

SelectInput.displayName = 'SelectInput'

export default SelectInput
