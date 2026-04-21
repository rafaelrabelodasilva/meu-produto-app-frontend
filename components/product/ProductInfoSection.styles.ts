import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 20,
  },
  card: {
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 24,
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  inputGroup: {
    marginBottom: 20,
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  divider: {
    display: 'none', // Removido para uniformizar
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '800',
  },
  measureInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    textAlign: 'center',
    marginTop: 4,
  },
  measureValue: {
    fontSize: 16,
    fontWeight: '800',
    padding: 10,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    marginTop: 4,
  },
});
