import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  topSection: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 20,
    paddingLeft: 20,
    position: "relative",
    backgroundColor: "#1A4D3A",
    flex: 0.5,
  },

  waveContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 5,
  },

  topLeftImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "120%",
    height: "100%",
    opacity: 0.2,
    zIndex: 2,
  },

  inputWrapper: {
    position: "absolute",
    top: "49%",
    alignSelf: "center",
    zIndex: 10,
  },

  controlsBox: {
    marginTop: 20,
    marginBottom: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: 270,
  },

  ssoBox: {
    marginTop: 30,
    display: "flex",
    flexDirection: "column",
    width: 270,
  },

  socialMedia: {
    marginTop: 20,
    display: "flex",
    flexDirection: "row",
  },

  badge: {
    marginRight: 15,
  },

  backToSignIn: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  backIcon: { color: "#1A4D3A", marginLeft: 10, marginRight: 10},
  forwardIcon: { color: "#1A4D3A", marginRight: 10 }
});