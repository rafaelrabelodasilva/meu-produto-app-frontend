import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  headerWrapper: {
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
  },
  responsiveLayout: {
    flex: 1,
    width: '100%',
  },
  tabletLayout: {
    flexDirection: 'row',
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  galleryWrapper: {
    width: '100%',
  },
  tabletGallery: {
    width: '45%',
    marginTop: 20,
  },
  infoWrapper: {
    width: '100%',
  },
  tabletInfo: {
    width: '55%',
  },
  content: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  footerWrapper: {
    paddingHorizontal: 24,
  },
  dangerZoneWrapper: {
    paddingHorizontal: 24,
    marginTop: 40,
    marginBottom: 20,
  },
  dangerZone: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 16,
  },
  dangerTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    width: '100%',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
