import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('loans');
  const [loans, setLoans] = useState([
    { id: '1', name: 'Paul', amount: '10€', date: '10/03/25', status: 'urgent' },
    { id: '2', name: 'Dalée', amount: '20€', date: '15/03/25', status: 'warning' },
    { id: '3', name: 'Polette', amount: 'Veste', date: '15/03/25', status: 'safe' },
  ]);
  const [borrows, setBorrows] = useState([
    { id: '4', name: 'Marie', amount: 'Harry Potter', date: '20/03/25', status: 'safe' },
    { id: '5', name: 'Larice', amount: '20€', date: '15/03/25', status: 'safe' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return '#FF4040';
      case 'warning': return '#FFA500';
      case 'safe': return '#32CD32';
      default: return '#32CD32';
    }
  };

  const handleTabChange = (tab: React.SetStateAction<string>) => {
    setActiveTab(tab);
  };

  const handleAddPress = () => {
    console.log('Bouton + pressé !'); // Ajouté pour déboguer
    navigation.navigate('AddTransaction');
  };

  const currentData = activeTab === 'loans' ? loans : borrows;
  const tabTitle = activeTab === 'loans' ? 'Prêts' : 'Emprunts';

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'loans' ? styles.tabActive : null]}
          onPress={() => handleTabChange('loans')}
        >
          <Text style={styles.tabText}>J’ai prêté</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'borrows' ? styles.tabActive : null]}
          onPress={() => handleTabChange('borrows')}
        >
          <Text style={styles.tabText}>J’ai emprunté</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.infoTitle}>{tabTitle}</Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {currentData.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDetails}>
                {item.amount} – {item.date}
              </Text>
            </View>
            <View
              style={[styles.statusCircle, { backgroundColor: getStatusColor(item.status) }]}
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={handleAddPress}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 200, marginBottom: 20 },
  tab: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFA500',
    borderRadius: 15,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tabActive: { backgroundColor: '#32CD32' },
  tabText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  infoTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 20, marginBottom: 20 },
  list: { flex: 1 },
  listContent: { alignItems: 'center', paddingBottom: 80, marginTop: 10 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cardDetails: { color: '#CCC', fontSize: 16 },
  statusCircle: { width: 20, height: 20, borderRadius: 10 },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FFA500',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingButtonText: { color: '#FFF', fontSize: 30, fontWeight: 'bold' },
});

export default HomeScreen;