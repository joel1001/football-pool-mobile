import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    zIndex: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#11181C',
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingRight: 4,
  },
});

