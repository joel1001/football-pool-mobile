export type DropdownItem = {
  label: string
  icon?: string
}

export type DropdownProps = {
  items: string[] | string | DropdownItem[]
  placeholder?: string
  onChange?: (values: string[]) => void
  singleOption?: boolean
  value?: string
  icon?: string
  selectedValues?: string[]
}