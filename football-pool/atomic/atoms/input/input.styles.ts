import { StyleSheet } from "react-native";

export const styles = ({ size, errorColor }: { size: string, errorColor?: string }) => StyleSheet.create({
  container: {
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  inputParent: {
    backgroundColor: "#E2E6E4",
    height: size === "large" ? 50 : size === "medium" ? 40 : 30,
    width: size === "large" ? 290 : size === "medium" ? 270 : 250,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textInput: {
    flex: 1,
  },
  label: {
    marginBottom: 4,
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    color: errorColor || "red",
    marginTop: 2,
    textAlign: "center",
  },
  revertText: {
    marginTop: 4,
    textDecorationLine: "underline",
    color: "#007AFF",
    textAlign: "center",
  },
});