import { useEffect, useState } from 'react'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  step?: number | 'any'
  inputMode?: 'numeric' | 'decimal'
}

/**
 * Keeps the raw text while typing so users can clear the field or type "1."
 * without the value snapping back; only valid numbers are propagated.
 */
export function NumberInput({ value, onChange, min = 0, step = 'any', inputMode = 'decimal' }: NumberInputProps) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    if (Number(text.replace(',', '.')) !== value) setText(String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <input
      type="text"
      inputMode={inputMode}
      value={text}
      min={min}
      step={step}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const raw = e.target.value
        setText(raw)
        const parsed = Number(raw.replace(',', '.'))
        if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= min) onChange(parsed)
      }}
    />
  )
}
