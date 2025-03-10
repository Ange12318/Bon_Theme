import { StyleSheet } from 'react-native';

export const theme = {
  primary: '#4A90E2', // Bleu profond
  secondary: '#50E3C2', // Vert clair
  danger: '#FF2D55', // Rouge vif
  background: '#1A252F', // Gris foncé
  cardBackground: 'linear-gradient(135deg, #2A3A4F, #1A252F)', // Dégradé subtil
  text: '#FFFFFF', // Blanc
  muted: '#A3BFFA', // Bleu pâle
  shadow: '#000000',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    fontFamily: 'Roboto-Bold',
  },
  text: {
    fontSize: 16,
    color: theme.text,
    fontFamily: 'Roboto-Regular',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});