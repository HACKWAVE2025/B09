import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";

const SignupPage: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://192.168.137.1:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      Alert.alert("Success", "Registration successful! Please login.");
      navigation.navigate("LoginPage");
    } catch (err: any) {
      Alert.alert("Signup Failed", err.message);
    } finally {
      setLoading(false);
    }
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
      <Text style={styles.title}>Join EcoQuest</Text>
      <Text style={styles.subtitle}>Create your eco-friendly account 🌍</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#777"
        value={name}
        onChangeText={setName}
      />

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
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={styles.backLink}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupPage;

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
    fontSize: 18,
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
  backLink: {
    color: "#4e4e4e",
    marginTop: 10,
    fontFamily: "PressStart2P",
    fontSize: 8,
  },
});
