import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AddTransactionScreen = ({ navigation, route }) => {
  const { itemToEdit } = route.params || {};
  const [transactionType, setTransactionType] = useState<'loan' | 'borrow'>(itemToEdit?.type || 'loan');
  const [toFrom, setToFrom] = useState(itemToEdit?.name || '');
  const [amountOrItem, setAmountOrItem] = useState(itemToEdit?.amount || '');
  const [date, setDate] = useState(itemToEdit?.date ? new Date(itemToEdit.date) : new Date());
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'warning'>(itemToEdit?.status || 'normal');
  const [notes, setNotes] = useState(itemToEdit?.notes || '');
  const [photo, setPhoto] = useState(itemToEdit?.photo || null);
  const [reminderEnabled, setReminderEnabled] = useState(itemToEdit?.reminderEnabled || false);
  const [reminderFrequency, setReminderFrequency] = useState<'sameDay' | '1dayBefore' | '3daysBefore'>(
    itemToEdit?.reminderFrequency || 'sameDay'
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    requestPermission();
    registerForPushNotificationsAsync();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Désolé, nous avons besoin des permissions pour accéder à vos photos !');
        return false;
      }
      return true;
    }
    return true;
  };

  const registerForPushNotificationsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Échec de la demande de permissions de notification !');
    }
  };

  const scheduleNotification = async (transactionDate: Date) => {
    if (reminderEnabled) {
      let triggerDate = new Date(transactionDate);
      switch (reminderFrequency) {
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
            body: `Échéance pour ${toFrom} (${amountOrItem}) le ${transactionDate.toLocaleDateString('fr-FR')}`,
            data: { transactionId: itemToEdit?.id || Date.now().toString() },
          },
          trigger: triggerDate,
        });
      }
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de la photo :', error);
      alert('Une erreur est survenue lors de la sélection de la photo.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleSave = async () => {
    const newTransaction: Transaction = {
      id: itemToEdit?.id || Date.now().toString(),
      type: transactionType,
      name: toFrom,
      amount: amountOrItem,
      date: date.toISOString(),
      status: priority,
      notes,
      photo,
      reminderEnabled,
      reminderFrequency,
      state: itemToEdit?.state || 'en cours',
    };
    await scheduleNotification(date);
    navigation.navigate('Home', { newTransaction, isEdit: !!itemToEdit });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nouvelle Transaction</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, transactionType === 'loan' ? styles.typeActive : null]}
            onPress={() => setTransactionType('loan')}
          >
            <Text style={styles.typeText}>Prêt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, transactionType === 'borrow' ? styles.typeActive : null]}
            onPress={() => setTransactionType('borrow')}
          >
            <Text style={styles.typeText}>Emprunt</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder={transactionType === 'loan' ? 'À qui ?' : 'De qui ?'}
          value={toFrom}
          onChangeText={setToFrom}
          placeholderTextColor={theme.muted}
          autoFocus={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Montant ou objet (ex: 20€, Livre)"
          value={amountOrItem}
          onChangeText={setAmountOrItem}
          placeholderTextColor={theme.muted}
        />
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>
            Date échéance: {date.toLocaleDateString('fr-FR')}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            onChange={onDateChange}
            style={styles.datePicker}
          />
        )}
        <View style={styles.priorityContainer}>
          <Text style={styles.label}>Priorité:</Text>
          <TouchableOpacity
            style={[styles.priorityButton, priority === 'normal' ? styles.priorityActive : null]}
            onPress={() => setPriority('normal')}
          >
            <Text style={styles.priorityText}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.priorityButton, priority === 'urgent' ? styles.priorityActive : null]}
            onPress={() => setPriority('urgent')}
          >
            <View style={styles.urgentDot} />
            <Text style={styles.priorityText}>Urgent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.priorityButton, priority === 'warning' ? styles.priorityActive : null]}
            onPress={() => setPriority('warning')}
          >
            <Text style={styles.priorityText}>Avertissement</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Notes supplémentaires"
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor={theme.muted}
          multiline
        />
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoText}>
            {photo ? 'Photo ajoutée' : 'Ajouter une photo'}
          </Text>
        </TouchableOpacity>
        {photo && <Text style={styles.photoHint}>Appuyez pour changer la photo</Text>}

        <View style={styles.reminderContainer}>
          <Text style={styles.label}>Rappels:</Text>
          <TouchableOpacity
            style={styles.reminderToggle}
            onPress={() => setReminderEnabled(!reminderEnabled)}
          >
            <View style={[styles.toggleCircle, reminderEnabled && styles.toggleActive]} />
          </TouchableOpacity>
        </View>
        {reminderEnabled && (
          <View style={styles.frequencyContainer}>
            <Text style={styles.label}>Fréquence:</Text>
            <TouchableOpacity
              style={[styles.frequencyButton, reminderFrequency === 'sameDay' ? styles.frequencyActive : null]}
              onPress={() => setReminderFrequency('sameDay')}
            >
              <Text style={styles.frequencyText}>Même jour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.frequencyButton, reminderFrequency === '1dayBefore' ? styles.frequencyActive : null]}
              onPress={() => setReminderFrequency('1dayBefore')}
            >
              <Text style={styles.frequencyText}>1 jour avant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.frequencyButton, reminderFrequency === '3daysBefore' ? styles.frequencyActive : null]}
              onPress={() => setReminderFrequency('3daysBefore')}
            >
              <Text style={styles.frequencyText}>3 jours avant</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Sauvegarder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    ...globalStyles.title,
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '90%',
  },
  typeButton: {
    ...globalStyles.button,
    backgroundColor: theme.primary,
    width: '45%',
  },
  typeActive: {
    backgroundColor: theme.secondary,
  },
  typeText: {
    ...globalStyles.text,
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: theme.muted,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: theme.text,
    backgroundColor: '#2A3A4F',
    width: '90%',
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    textAlign: 'left',
  },
  dateButton: {
    height: 50,
    borderColor: theme.muted,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    justifyContent: 'center',
    backgroundColor: '#2A3A4F',
    width: '90%',
  },
  dateText: {
    ...globalStyles.text,
    fontSize: 16,
  },
  datePicker: {
    width: '90%',
    backgroundColor: '#2A3A4F',
    borderRadius: 12,
    marginBottom: 15,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '90%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  label: {
    ...globalStyles.text,
    fontSize: 16,
    marginRight: 10,
  },
  priorityButton: {
    ...globalStyles.button,
    backgroundColor: '#2A3A4F',
    marginRight: 10,
    marginBottom: 10,
  },
  priorityActive: {
    backgroundColor: theme.secondary,
  },
  priorityText: {
    ...globalStyles.text,
    fontSize: 14,
  },
  urgentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.danger,
    marginRight: 5,
  },
  photoButton: {
    ...globalStyles.button,
    backgroundColor: '#2A3A4F',
    marginBottom: 10,
    width: '90%',
  },
  photoText: {
    ...globalStyles.text,
    fontSize: 16,
  },
  photoHint: {
    ...globalStyles.text,
    color: theme.muted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
    width: '90%',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '90%',
    justifyContent: 'center',
  },
  reminderToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2A3A4F',
    justifyContent: 'center',
    padding: 2,
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#A3BFFA',
    transform: [{ translateX: 0 }],
  },
  toggleActive: {
    backgroundColor: theme.secondary,
    transform: [{ translateX: 20 }],
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '90%',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  frequencyButton: {
    ...globalStyles.button,
    backgroundColor: '#2A3A4F',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  frequencyActive: {
    backgroundColor: theme.secondary,
  },
  frequencyText: {
    ...globalStyles.text,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
  },
  cancelButton: {
    ...globalStyles.button,
    backgroundColor: theme.danger,
    width: '45%',
  },
  saveButton: {
    ...globalStyles.button,
    backgroundColor: theme.primary,
    width: '45%',
  },
  buttonText: {
    ...globalStyles.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddTransactionScreen;