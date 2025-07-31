import React, { forwardRef } from 'react'
import { DatePicker, ConfigProvider } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'
import locale from 'antd/locale/pt_BR'

interface ModernDatePickerProps {
  label: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

// Configuração do tema personalizado
const customTheme = {
  token: {
    colorPrimary: '#009688', // Teal do design system
    borderRadius: 8,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
  },
  components: {
    DatePicker: {
      colorBorder: '#d4d4d8', // zinc-300
      colorBorderHover: '#009688',
      colorPrimaryHover: '#00695C',
      controlHeight: 40, // h-10 equivalent
      paddingInline: 12, // px-3 equivalent
    }
  }
}

const ModernDatePicker = forwardRef<any, ModernDatePickerProps>(
  ({ label, value, onChange, placeholder = 'Selecione uma data', required = false, error, disabled = false }, ref) => {
    // Converter string para dayjs object
    const dayjsValue = value ? dayjs(value, 'YYYY-MM-DD') : null

    const handleChange = (date: Dayjs | null) => {
      if (onChange) {
        onChange(date ? date.format('YYYY-MM-DD') : '')
      }
    }

    return (
      <ConfigProvider theme={customTheme} locale={locale}>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
          
          <DatePicker
            ref={ref}
            value={dayjsValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            format="DD/MM/YYYY"
            suffixIcon={<CalendarOutlined className="text-zinc-600 dark:text-zinc-400" />}
            className={`
              w-full
              dark:bg-zinc-800 
              dark:border-zinc-700 
              dark:text-softGray
              ${error ? 'border-red-500' : ''}
            `}
            style={{
              height: '40px',
            }}
            popupStyle={{
              zIndex: 1050,
            }}
          />
          
          {error && (
            <span className="text-red-500 mt-2 text-sm">{error}</span>
          )}
        </div>
      </ConfigProvider>
    )
  }
)

ModernDatePicker.displayName = 'ModernDatePicker'

export default ModernDatePicker