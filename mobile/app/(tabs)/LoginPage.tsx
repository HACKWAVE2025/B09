import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";

const ecoFacts = [
  "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
  "Planting trees helps combat climate change by absorbing CO₂.",
  "Turning off the tap while brushing can save up to 8 gallons of water per day.",
  "Bamboo releases 35% more oxygen than trees of equivalent mass.",
  "LED bulbs use 75% less energy than incandescent lighting.",
  "Composting reduces household waste by up to 30%.",
  "Electric vehicles emit 50% less CO₂ than gas-powered cars.",
  "Switching to reusable bottles can prevent 1,500 plastic bottles per person yearly.",
];

const LoginPage: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ecoFact, setEcoFact] = useState("");
  const [showFact, setShowFact] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        PressStart2P: require("../../assets/fonts/PressStart2P-Regular.ttf"),
      });
      setFontLoaded(true);
    };
    loadFont();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://192.168.137.1:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      const randomFact = ecoFacts[Math.floor(Math.random() * ecoFacts.length)];
      setEcoFact(randomFact);
      setShowFact(true);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeFactAndRedirect = async () => {
    setShowFact(false);

    // Ensure latest user is fetched from AsyncStorage
    const user = await AsyncStorage.getItem("user");

    // 🔁 Reset navigation so Drawer reloads with new user data
    navigation.reset({
      index: 0,
      routes: [{ name: "HomeScreen", params: { user: JSON.parse(user || "{}") } }],
    });
  };


  if (!fontLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="leaf" size={64} color="#2e7d32" />
      <Text style={styles.title}>EcoQuest</Text>
      <Text style={styles.subtitle}>Welcome back, Eco Hero!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>

      {/* 🌿 Eco Fact Modal */}
      <Modal visible={showFact} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🌿 Eco Fact of the Day</Text>
            <Text style={styles.modalText}>{ecoFact}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeFactAndRedirect}>
              <Text style={styles.modalButtonText}>Continue to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fdf8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7fdf8",
  },
  title: {
    fontFamily: "PressStart2P",
    fontSize: 20,
    color: "#1b5e20",
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#388e3c",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    color: "#000",
    fontFamily: "PressStart2P",
    fontSize: 8,
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },
  button: {
    width: "100%",
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#2e7d32",
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "PressStart2P",
    fontSize: 10,
  },
  link: {
    color: "#2e7d32",
    marginTop: 20,
    fontFamily: "PressStart2P",
    fontSize: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    width: "85%",
    alignItems: "center",
    borderColor: "#a5d6a7",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 12,
    fontFamily: "PressStart2P",
    color: "#1b5e20",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    color: "#444",
    fontSize: 8,
    textAlign: "center",
    fontFamily: "PressStart2P",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontFamily: "PressStart2P",
    fontSize: 8,
    textAlign: "center",
  },
});
