import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { PillProps } from "./pill.types"
import { styles } from "./pill.styles"

export const Pill: React.FC<PillProps> = ({ label, onRemove }) => (
  <View style={styles.pill}>
    <Text style={styles.pillText} numberOfLines={1} ellipsizeMode="tail">
      {label}
    </Text>
    {onRemove && (
      <TouchableOpacity onPress={() => onRemove(label)}>
        <Ionicons name="close" size={16} color="#555" />
      </TouchableOpacity>
    )}
  </View>
)