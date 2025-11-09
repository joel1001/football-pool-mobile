import React, { useState, useEffect } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Pill } from "../pill/pill"
import { DropdownProps } from "./dropdown.types"
import { styles } from "./dropdown.styles"

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  placeholder = "Escribe o selecciona...",
  onChange,
  singleOption = false,
  value,
  icon,
  selectedValues,
}) => {
  const [inputValue, setInputValue] = useState("")
  const [selected, setSelected] = useState<string[]>(selectedValues || [])
  const [singleValue, setSingleValue] = useState<string>(value || "")
  const [showDropdown, setShowDropdown] = useState(false)
  
  // Sync external value changes
  useEffect(() => {
    if (singleOption && value !== undefined) {
      setSingleValue(value);
      setInputValue(''); // Clear search when value changes externally
    }
  }, [value, singleOption]);
  
  // Sync selected values from props for multiple selection
  useEffect(() => {
    if (!singleOption && selectedValues !== undefined) {
      setSelected(selectedValues);
    }
  }, [selectedValues, singleOption]);

  const handleAdd = (value: string) => {
    if (!value) return
    
    if (singleOption) {
      // Single selection mode
      setSingleValue(value)
      onChange?.([value])
      setInputValue("") // Clear search input
      setShowDropdown(false)
    } else {
      // Multiple selection mode
      if (selected.includes(value)) return
      const updated = [...selected, value]
      setSelected(updated)
      onChange?.(updated)
      setInputValue("")
      setShowDropdown(false)
    }
  }

  const handleRemove = (label: string) => {
    const updated = selected.filter((item) => item !== label)
    setSelected(updated)
    onChange?.(updated)
  }

  const allItems = Array.isArray(items) ? items : [items]
  
  // Check if items are objects with label/icon or just strings
  const isObjectItems = allItems.length > 0 && typeof allItems[0] === 'object' && allItems[0] !== null && 'label' in allItems[0];
  
  const filtered = inputValue.trim() === ""
    ? allItems // Show all items when not filtering
    : allItems
        .filter((i) => {
          if (isObjectItems) {
            const item = i as { label: string; icon?: string };
            return item.label.toLowerCase().includes(inputValue.toLowerCase());
          }
          return typeof i === "string" && i.toLowerCase().includes(inputValue.toLowerCase());
        })

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapperOuter}>
        <View style={styles.inputWrapper}>
          {/* Pills and input in the same line, wrapping */}
          {!singleOption && selected.map((label, index) => (
            <Pill key={index} label={label} onRemove={handleRemove} />
          ))}
          
          {/* Show icon for single option when value is selected */}
          {singleOption && singleValue && !inputValue && icon && (
            <Text style={{ fontSize: 20, marginRight: 6 }}>{icon}</Text>
          )}
          
          <TextInput
            style={[
              styles.input, 
              { flex: 1 },
              singleOption && singleValue && !inputValue ? { color: '#333' } : {},
              !singleOption && selected.length > 0 ? { minWidth: 100 } : {}
            ]}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={singleOption && singleValue && !inputValue ? singleValue : inputValue}
            onChangeText={(text) => {
              setInputValue(text)
              setShowDropdown(true)
            }}
            onFocus={() => {
              if (singleOption && singleValue) {
                setInputValue('');
              }
              setShowDropdown(true);
            }}
            onBlur={() => {
              if (singleOption && !inputValue) {
                setShowDropdown(false);
              }
            }}
            onSubmitEditing={() => handleAdd(inputValue)}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.chevronButton}
          onPress={() => {
            if (showDropdown && singleOption && inputValue) {
              setInputValue('');
            }
            setShowDropdown(!showDropdown);
          }}
        >
          <Ionicons 
            name={showDropdown ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#555" 
          />
        </TouchableOpacity>
      </View>

      {showDropdown && filtered.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={filtered}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item }) => {
              const itemLabel = isObjectItems ? (item as { label: string }).label : (item as string);
              const itemIcon = isObjectItems && (item as { label: string; icon?: string }).icon;
              
              return (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleAdd(itemLabel)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {itemIcon && (
                      <Text style={{ fontSize: 20, marginRight: 8 }}>{itemIcon}</Text>
                    )}
                    <Text style={styles.dropdownText}>{itemLabel}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </View>
      )}
    </View>
  )
}