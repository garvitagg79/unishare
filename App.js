import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Modal,
  PermissionsAndroid,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import QRCode from "react-native-qrcode-svg";
import * as Contacts from "expo-contacts";
import * as Permissions from "expo-permissions";

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button
        title="Scan QR Code"
        onPress={() => navigation.navigate("ScanQRCode")}
      />
      <Button
        title="Create QR Code"
        onPress={() => navigation.navigate("CreateQRCode")}
      />
    </View>
  );
}

function ScanQRCodeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      setHasPermission(status === "granted");
    };

    requestCameraPermission();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setScannedData(data);
    const [name, phoneNumber] = data.split(", ");
    saveContactToPhone({ name, phoneNumber });
  };

  const navigation = useNavigation();

  const saveContactToPhone = async (contactData) => {
    const { name, phoneNumber } = contactData;

    const { status } = await Permissions.askAsync(Permissions.CONTACTS);

    if (status === "granted") {
      const contact = {
        [Contacts.Fields.FirstName]: name,
        phoneNumbers: [
          {
            label: "mobile",
            number: phoneNumber,
          },
        ],
      };
      try {
        const contactId = await Contacts.addContactAsync(contact);
        console.log("Contact saved successfully! Contact ID:", contactId);
        alert(`${name} is now connected!`);
      } catch (error) {
        console.log(error);
        alert("An error occurred while saving the contact.");
      }
    } else {
      alert("Permission to save contacts denied.");
    }
  };

  return (
    <View style={styles.container}>
      {hasPermission === null ? (
        <Text>Requesting camera permission...</Text>
      ) : hasPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      )}

      <Modal
        visible={scanned}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScanned(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>QR Code Scanned!</Text>
            {scannedData && (
              <>
                <Text style={styles.modalText}>
                  Scanned Data: {scannedData}
                </Text>
              </>
            )}
            <Button title="Scan Again" onPress={() => setScanned(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CreateQRCodeScreen() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSaveContact = () => {
    if (name && phoneNumber) {
      const contactData = { name, phoneNumber };
      saveContactToPhone(contactData);
    }
  };

  const navigation = useNavigation();

  const handleNameChange = (value) => {
    setName(value);
  };

  const saveContactToPhone = async (contactData) => {
    const { name, phoneNumber } = contactData;
    const newPerson = {
      [Contacts.Fields.FirstName]: name,
      phoneNumbers: [
        {
          label: "mobile",
          number: phoneNumber,
        },
      ],
    };

    try {
      await Contacts.addContactAsync(newPerson);
      navigation.goBack();
      alert(`${name} is now connected!`);
    } catch (error) {
      console.log(error);
      alert("An error occurred while saving the contact.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Name:</Text>
      <TextInput
        style={styles.input}
        onChangeText={handleNameChange}
        value={name}
      />
      <Text style={styles.label}>Enter Phone Number:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPhoneNumber}
        value={phoneNumber}
        keyboardType="phone-pad"
      />
      {name && phoneNumber ? (
        <QRCode
          value={`Name: ${name}, Phone Number: ${phoneNumber}`}
          size={200}
          color="black"
          backgroundColor="white"
        />
      ) : null}
      <Button
        title="Save Contact"
        onPress={handleSaveContact}
        disabled={!name || !phoneNumber}
      />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ScanQRCode" component={ScanQRCodeScreen} />
        <Stack.Screen name="CreateQRCode" component={CreateQRCodeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});
