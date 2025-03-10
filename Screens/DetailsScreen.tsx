import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

const DetailsScreen = ({ navigation, route }) => {
  const { item } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Détails de la Transaction</Text>
      <Text style={styles.detailText}>Type: {item.type === 'loan' ? 'Prêt' : 'Emprunt'}</Text>
      <Text style={styles.detailText}>Nom: {item.name}</Text>
      <Text style={styles.detailText}>Montant/Objet: {item.amount}</Text>
      <Text style={styles.detailText}>Date: {item.date}</Text>
      <Text style={styles.detailText}>État: {item.state}</Text>
      <Text style={styles.detailText}>Priorité: {item.status === 'urgent' ? 'Urgent' : 'Normal'}</Text>
      {item.notes && <Text style={styles.detailText}>Notes: {item.notes}</Text>}
      {item.photo && <Image source={{ uri: item.photo }} style={styles.photo} />}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 10,
    width: '90%',
  },
  photo: {
    width: '90%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFA500',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  backText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DetailsScreen;