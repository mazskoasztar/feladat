import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';

export default function App() {
  const [adatTomb, setAdatTomb] = useState([]);
  const [szoveg, setSzoveg] = useState("");
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [datum, setDatum] = useState("");
  const [isChecked, setChecked] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
    setDatum(`${currentDate.getFullYear()}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}`);
  };

  const showDatepicker = () => setShow(true);

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('feladatok', jsonValue);
    } catch (e) {
      console.error('Error saving data:', e);
    }
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('feladatok');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading value:', e);
    }
  };

  useEffect(() => {
    getData().then(adat => {
      setAdatTomb(adat);
    });
  }, []);

  const felvitel = () => {
    const uj = [...adatTomb, { id: Date.now(), feladat: szoveg, datum, kesz: 0 }];
    setAdatTomb(uj);
    storeData(uj);
    setSzoveg("");
    setDatum("");
  };

  const torles = () => {
    setAdatTomb([]);
    storeData([]);
  };

  const toggleTaskStatus = (id) => {
    const uj = adatTomb.map(item => {
      if (item.id === id) item.kesz = item.kesz ? 0 : 1;
      return item;
    });
    setAdatTomb(uj);
    storeData(uj);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Feladat:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Írj be egy feladatot..."
          onChangeText={setSzoveg}
          value={szoveg}
        />
        <TouchableOpacity onPress={() => setSzoveg("")} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>x</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={showDatepicker} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>DÁTUM</Text>
      </TouchableOpacity>
      {datum ? <Text style={styles.dateDisplay}>{datum}</Text> : null}
      
      <TouchableOpacity onPress={felvitel} style={styles.addButton}>
        <Text style={styles.addButtonText}>ÚJ FELADAT</Text>
      </TouchableOpacity>

      <View style={styles.checkboxContainer}>
        <Checkbox value={isChecked} onValueChange={setChecked} />
        <Text style={styles.checkboxLabel}>korábbiak</Text>
      </View>

      <TouchableOpacity onPress={torles} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Mind törlése</Text>
      </TouchableOpacity>

      <FlatList
        data={adatTomb}
        renderItem={({ item }) => (isChecked || item.kesz === 0) && (
          <View style={[styles.taskContainer, item.kesz && styles.completedTask]}>
            <Text style={styles.taskDate}>{item.datum}</Text>
            <Text style={styles.taskText}>{item.feladat}</Text>
            <TouchableOpacity
              style={item.kesz ? styles.backButton : styles.finishButton}
              onPress={() => toggleTaskStatus(item.id)}
            >
              <Text style={styles.buttonText}>{item.kesz ? 'Vissza' : 'Kész'}</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  label: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  clearButton: {
    marginLeft: 5,
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  dateButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  dateDisplay: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
    backgroundColor: 'yellow',
    padding: 5,
    marginVertical: 5,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  deleteButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  taskContainer: {
    borderWidth: 1,
    borderColor: 'purple',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  completedTask: {
    backgroundColor: '#d3d3d3',
  },
  taskDate: {
    fontSize: 12,
    color: 'blue',
  },
  taskText: {
    fontSize: 18,
    marginBottom: 5,
  },
  finishButton: {
    backgroundColor: 'orange',
    padding: 5,
    borderRadius: 5,
  },
  backButton: {
    backgroundColor: 'gray',
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

