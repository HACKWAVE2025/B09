import React, { useState } from "react";
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

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://192.168.137.1:5000/api/users/login", {
                // use 10.0.2.2 for Android emulator, localhost for web
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Login failed");

            // Save user locally
            await AsyncStorage.setItem("user", JSON.stringify(data.user));

            // Random eco fact
            const randomFact = ecoFacts[Math.floor(Math.random() * ecoFacts.length)];
            setEcoFact(randomFact);
            setShowFact(true);
        } catch (err: any) {
            Alert.alert("Login Failed", err.message);
        } finally {
            setLoading(false);
        }
    };

    const closeFactAndRedirect = () => {
        setShowFact(false);
        navigation.navigate("HomeScreen");
    };

    return (
        <View style={styles.container}>
            <Ionicons name="leaf" size={64} color="#34c759" />
            <Text style={styles.title}>EcoQuest</Text>
            <Text style={styles.subtitle}>Welcome back, Eco Hero!</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
            >
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
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={closeFactAndRedirect}
                        >
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
        backgroundColor: "#121212",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        color: "#fff",
        fontWeight: "bold",
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#bbb",
        marginBottom: 30,
    },
    input: {
        width: "100%",
        backgroundColor: "#1e1e1e",
        borderRadius: 10,
        padding: 14,
        marginBottom: 15,
        color: "#fff",
        fontSize: 16,
    },
    button: {
        width: "100%",
        backgroundColor: "#34c759",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    link: {
        color: "#34c759",
        marginTop: 20,
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        backgroundColor: "#1e1e1e",
        padding: 25,
        borderRadius: 15,
        width: "85%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#34c759",
        marginBottom: 15,
    },
    modalText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: "#34c759",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    modalButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
