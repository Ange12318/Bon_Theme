import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
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

const HomeScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState<'loans' | 'borrows'>('loans');
  const [loans, setLoans] = useState<Transaction[]>([]);
  const [borrows, setBorrows] = useState<Transaction[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    const loadData = async () => {
      const savedLoans = await AsyncStorage.getItem('loans');
      const savedBorrows = await AsyncStorage.getItem('borrows');
      if (savedLoans) {
        const parsedLoans = JSON.parse(savedLoans);
        setLoans(parsedLoans);
        console.log('Données chargées (loans) :', parsedLoans); // Log pour vérifier
      }
      if (savedBorrows) {
        const parsedBorrows = JSON.parse(savedBorrows);
        setBorrows(parsedBorrows);
        console.log('Données chargées (borrows) :', parsedBorrows); // Log pour vérifier
      }
      const allTransactions = [...(savedLoans ? JSON.parse(savedLoans) : []), ...(savedBorrows ? JSON.parse(savedBorrows) : [])];
      allTransactions.forEach(async (transaction) => {
        if (transaction.reminderEnabled && new Date(transaction.date) > new Date()) {
          let triggerDate = new Date(transaction.date);
          switch (transaction.reminderFrequency) {
            case '1dayBefore':
              triggerDate.setDate(triggerDate.getDate() - 1);
              break;
            case '3daysBefore':
              triggerDate.setDate(triggerDate.getDate() - 3);
              break;
            case 'sameDay':
            default:
              break;
          }
          if (triggerDate > new Date()) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Rappel de transaction`,
                body: `Échéance pour ${transaction.name} (${transaction.amount}) le ${new Date(transaction.date).toLocaleDateString('fr-FR')} à ${new Date(transaction.date).toLocaleTimeString('fr-FR')}`,
                data: { transactionId: transaction.id },
              },
              trigger: triggerDate,
            });
          }
        }
      });
    };
    loadData();
  }, []);

  useEffect(() => {
    const { newTransaction, isEdit } = route.params || {};
    if (newTransaction) {
      console.log('Nouvelle transaction reçue dans HomeScreen :', newTransaction); // Log pour vérifier
      const updateList = async () => {
        if (newTransaction.type === 'loan') {
          const updatedLoans = isEdit
            ? loans.map(item => (item.id === newTransaction.id ? newTransaction : item))
            : [...loans, newTransaction];
          setLoans(updatedLoans);
          await AsyncStorage.setItem('loans', JSON.stringify(updatedLoans));
        } else {
          const updatedBorrows = isEdit
            ? borrows.map(item => (item.id === newTransaction.id ? newTransaction : item))
            : [...borrows, newTransaction];
          setBorrows(updatedBorrows);
          await AsyncStorage.setItem('borrows', JSON.stringify(updatedBorrows));
        }
      };
      updateList();
    }
  }, [route.params]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return theme.danger;
      case 'warning': return theme.secondary;
      case 'normal': return theme.primary;
      default: return theme.primary;
    }
  };

  const handleTabChange = (tab: 'loans' | 'borrows') => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleAddPress = () => {
    navigation.navigate('AddTransaction');
  };

  const handleDelete = (id: string, isLoan: boolean) => {
    if (isLoan) {
      const updatedLoans = loans.filter(item => item.id !== id);
      setLoans(updatedLoans);
      AsyncStorage.setItem('loans', JSON.stringify(updatedLoans));
    } else {
      const updatedBorrows = borrows.filter(item => item.id !== id);
      setBorrows(updatedBorrows);
      AsyncStorage.setItem('borrows', JSON.stringify(updatedBorrows));
    }
  };

  const handleDetails = (item: Transaction) => {
    console.log('Détails de l\'item envoyé :', item); // Log pour vérifier
    navigation.navigate('Details', { item });
  };

  const currentData = activeTab === 'loans' ? loans : borrows;
  const tabTitle = activeTab === 'loans' ? 'Prêts' : 'Emprunts';

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim, marginTop: 50 }]}>
        <Text style={styles.welcomeText}>Bienvenue dans Bon !</Text>
        <Text style={styles.subtitle}>Gérez vos prêts et emprunts facilement</Text>
      </Animated.View>
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
          <Animated.View
            key={item.id}
            style={[styles.card, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}
          >
            <TouchableOpacity onPress={() => handleDetails(item)} style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDetails}>
                {item.amount} – {new Date(item.date).toLocaleDateString('fr-FR')} ({item.state})
              </Text>
            </TouchableOpacity>
            <View style={[styles.statusCircle, { backgroundColor: getStatusColor(item.status) }]} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id, activeTab === 'loans')}
            >
              <Text style={styles.deleteText}>X</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddPress}
        activeOpacity={0.7}
      >
        <Animated.Text style={[styles.floatingButtonText, { transform: [{ scale: fadeAnim }] }]}>+</Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(42, 58, 79, 0.8)',
    borderRadius: 15,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.secondary,
    fontFamily: 'Roboto-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: theme.muted,
    fontFamily: 'Roboto-Regular',
  },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, marginTop: 20 },
  tab: {
    ...globalStyles.button,
    backgroundColor: theme.primary,
    width: '45%',
  },
  tabActive: {
    backgroundColor: theme.secondary,
  },
  tabText: {
    ...globalStyles.text,
    fontSize: 18,
    fontWeight: '600',
  },
  infoTitle: {
    ...globalStyles.title,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  list: { flex: 1 },
  listContent: { alignItems: 'center', paddingBottom: 100, marginTop: 20 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.cardBackground,
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: {
    ...globalStyles.text,
    fontSize: 18,
    fontWeight: '600',
  },
  cardDetails: {
    ...globalStyles.text,
    fontSize: 14,
    color: theme.muted,
  },
  statusCircle: { width: 20, height: 20, borderRadius: 10 },
  floatingButton: {
    ...globalStyles.button,
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: theme.secondary,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  floatingButtonText: {
    ...globalStyles.text,
    fontSize: 30,
    fontWeight: 'bold',
    color: theme.text,
  },
  deleteButton: {
    ...globalStyles.button,
    padding: 5,
    backgroundColor: theme.danger,
    borderRadius: 5,
  },
  deleteText: {
    ...globalStyles.text,
    fontSize: 14,
  },
});

export default HomeScreen;