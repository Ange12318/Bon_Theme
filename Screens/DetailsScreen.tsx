import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { theme, globalStyles } from '../utils/theme';

interface Transaction {
  id: string;
  type: 'loan' | 'borrow';
  name: string;
  amount: string;
  date: string;
  status: 'normal' | 'urgent' | 'warning';
  notes?: string;
  photo?: string | null;
  reminderEnabled: boolean;
  reminderFrequency: 'sameDay' | '1dayBefore' | '3daysBefore';
  state: 'en cours' | 'remboursé' | 'annulé';
}

const DetailsScreen = ({ navigation, route }) => {
  const { item }: { item: Transaction } = route.params;
  console.log('Détails reçus dans DetailsScreen :', item); // Log pour vérifier
  console.log('Photo dans DetailsScreen :', item.photo); // Log spécifique pour la photo
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim, marginTop: 50 }}>
        <Text style={styles.title}>Détails de la Transaction</Text>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailText}>{item.type === 'loan' ? 'Prêt' : 'Emprunt'}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>Nom:</Text>
          <Text style={styles.detailText}>{item.name}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>Montant/Objet:</Text>
          <Text style={styles.detailText}>{item.amount}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailText}>
            {new Date(item.date).toLocaleDateString('fr-FR')} à {new Date(item.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>État:</Text>
          <Text style={styles.detailText}>{item.state}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>Priorité:</Text>
          <Text style={styles.detailText}>
            {item.status === 'urgent' ? 'Urgent' : item.status === 'warning' ? 'Avertissement' : 'Normal'}
          </Text>
        </View>
        {item.notes && (
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailText}>{item.notes}</Text>
          </View>
        )}
        {item.photo ? (
          <Image
            source={{ uri: item.photo }}
            style={styles.photo}
            onError={(e) => console.log('Erreur de chargement de l\'image :', e.nativeEvent.error)}
          />
        ) : (
          <Text style={styles.noPhotoText}>Aucune photo disponible</Text>
        )}
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>Rappel:</Text>
          <Text style={styles.detailText}>
            {item.reminderEnabled
              ? `Activé (${item.reminderFrequency === 'sameDay' ? 'Même jour' : item.reminderFrequency === '1dayBefore' ? '1 jour avant' : '3 jours avant'})`
              : 'Désactivé'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    ...globalStyles.title,
    marginBottom: 20,
  },
  detailContainer: {
    flexDirection: 'row',
    width: '90%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#2A3A4F',
    borderRadius: 10,
  },
  detailLabel: {
    ...globalStyles.text,
    fontWeight: '600',
    width: '40%',
    color: theme.secondary,
  },
  detailText: {
    ...globalStyles.text,
    width: '60%',
  },
  photo: {
    width: '90%',
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
  },
  noPhotoText: {
    ...globalStyles.text,
    color: theme.muted,
    fontSize: 14,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#2A3A4F',
    borderRadius: 10,
  },
  backButton: {
    ...globalStyles.button,
    backgroundColor: theme.primary,
    marginTop: 20,
  },
  backText: {
    ...globalStyles.text,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DetailsScreen;