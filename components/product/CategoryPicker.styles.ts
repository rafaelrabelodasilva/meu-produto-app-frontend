import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
  },
  icon: {
    marginRight: 12,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  createContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  createInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    marginBottom: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 12,
  },
  editInlineRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  editInlineInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  loader: {
    marginVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 40,
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
