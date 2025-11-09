import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    maxWidth: 200,
  },
  pillText: {
    color: "#333",
    marginRight: 4,
    fontSize: 12,
    flexShrink: 1,
  },
})