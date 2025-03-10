import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Ajouté pour le sélecteur de date

const AddTransactionScreen = ({ navigation, route }) => {
  const { itemToEdit } = route.params || {};
  const [transactionType, setTransactionType] = useState(itemToEdit?.type || 'loan');
  const [toFrom, setToFrom] = useState(itemToEdit?.name || '');
  const [amountOrItem, setAmountOrItem] = useState(itemToEdit?.amount || '');
  const [date, setDate] = useState(itemToEdit?.date ? new Date(itemToEdit.date) : new Date());
  const [priority, setPriority] = useState(itemToEdit?.status || 'normal');
  const [notes, setNotes] = useState(itemToEdit?.notes || '');
  const [photo, setPhoto] = useState(itemToEdit?.photo || null);
  const [reminderEnabled, setReminderEnabled] = useState(itemToEdit?.reminderEnabled || false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleSave = () => {
    const newTransaction = {
      id: itemToEdit?.id || Date.now().toString(),
      type: transactionType,
      name: toFrom,
      amount: amountOrItem,
      date: date.toLocaleDateString('fr-FR'),
      status: priority,
      notes,
      photo,
      reminderEnabled,
      state: itemToEdit?.state || 'en cours',
    };
    navigation.navigate('Home', { newTransaction, isEdit: !!itemToEdit });
    navigation.goBack();
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
          placeholderTextColor="#CCC"
          autoFocus={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Montant ou objet (ex: 20€, Livre)"
          value={amountOrItem}
          onChangeText={setAmountOrItem}
          placeholderTextColor="#CCC"
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
            display="default"
            onChange={onDateChange}
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
        </View>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Notes supplémentaires"
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor="#CCC"
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

        <View style={styles.buttonContainer}>
          <Button title="Annuler" onPress={handleCancel} color="#FF4040" />
          <Button title="Sauvegarder" onPress={handleSave} color="#32CD32" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '90%',
  },
  typeButton: {
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
  typeActive: {
    backgroundColor: '#32CD32',
  },
  typeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    color: '#FFF',
    backgroundColor: '#222',
    width: '90%',
    textAlign: 'center',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    textAlign: 'left',
  },
  dateButton: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: '#222',
    width: '90%',
  },
  dateText: {
    color: '#FFF',
    fontSize: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '90%',
    justifyContent: 'center',
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    marginRight: 10,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#444',
    borderRadius: 10,
    marginRight: 10,
  },
  priorityActive: {
    backgroundColor: '#32CD32',
  },
  priorityText: {
    color: '#FFF',
    fontSize: 14,
  },
  urgentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4040',
    marginRight: 5,
  },
  photoButton: {
    paddingVertical: 15,
    backgroundColor: '#444',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '90%',
  },
  photoText: {
    color: '#FFF',
    fontSize: 16,
  },
  photoHint: {
    color: '#CCC',
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
    backgroundColor: '#444',
    justifyContent: 'center',
    padding: 2,
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#999',
    transform: [{ translateX: 0 }],
  },
  toggleActive: {
    backgroundColor: '#32CD32',
    transform: [{ translateX: 20 }],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
  },
});

export default AddTransactionScreen;