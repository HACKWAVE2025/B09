import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Button,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface EcoTaskPageProps {
    day: number;
    onBack: () => void;
    onCompleteTask: (task: string) => void;
}

const IMAGGA_API_KEY = "acc_cf8bf8db4c1dddb";
const IMAGGA_API_SECRET = "227c5794c787cde07c04d26194b67c85";

export default function EcoTaskPage({ day, onBack, onCompleteTask }: EcoTaskPageProps) {
    const [user, setUser] = useState<any>(null);
    const [fileUri, setFileUri] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const taskList = [
        "Plant a tree",
        "Clean your surroundings",
        "Save electricity",
        "Recycle plastic",
        "Avoid water waste",
    ];
    const todayTask = taskList[(day - 1) % taskList.length];

    // ✅ Load user from AsyncStorage
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                if (userData) setUser(JSON.parse(userData));
            } catch (err) {
                console.error("Failed to load user:", err);
            }
        };
        loadUser();
    }, []);

    // ✅ Get user location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: parseFloat(loc.coords.latitude.toFixed(5)),
                    longitude: parseFloat(loc.coords.longitude.toFixed(5)),
                });
            }
        })();
    }, []);

    // ✅ Pick image from gallery
    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setFileUri(result.assets[0].uri);
        }
    };

    // ✅ Check image tags using Imagga API
    const checkTaskImage = async (imageUri: string, task: string): Promise<boolean> => {
        try {
            const fileBlob = await (await fetch(imageUri)).blob();
            const formData = new FormData();
            formData.append("image", fileBlob as any);

            const response = await fetch("https://api.imagga.com/v2/tags", {
                method: "POST",
                headers: {
                    Authorization: "Basic " + btoa(`${IMAGGA_API_KEY}:${IMAGGA_API_SECRET}`),
                },
                body: formData,
            });

            const data = await response.json();
            if (data.result?.tags) {
                const tags: string[] = data.result.tags.map((t: any) =>
                    String(t.tag?.en || "").toLowerCase()
                );
                const keywords: string[] = task.toLowerCase().split(" ").filter(Boolean);
                return keywords.some((kw) => tags.some((tag: string) => tag.includes(kw)));
            }
        } catch (err) {
            console.error("Imagga verification failed:", err);
        }
        return false;
    };

    // ✅ Complete task handler
    const handleComplete = async () => {
        if (!fileUri) return Alert.alert("Please upload a task image!");
        if (completed) return;

        setLoading(true);
        setMessage("Verifying image...");

        // 🔍 Verify image
        const valid = await checkTaskImage(fileUri, todayTask);
        if (!valid) {
            setLoading(false);
            return setMessage("❌ The uploaded image doesn’t match today’s eco-task!");
        }

        try {
            // 🧾 Update backend progress
            const res = await fetch("http://localhost:5000/api/users/complete-level", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?._id,
                    levelCompleted: day,
                    pointsToAdd: 10,
                }),
            });

            if (!res.ok) throw new Error("Failed to update user progress");

            const { user: updatedUser } = await res.json();
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            setCompleted(true);
            setMessage("✅ Task verified and marked as completed!");
            onCompleteTask(todayTask);
        } catch (err) {
            console.error("Task completion failed:", err);
            setMessage("❌ Could not save progress. Try again!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <Text style={styles.backText}>⬅️ Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>🌍 Day {day} Challenge</Text>
            <Text style={styles.desc}>{todayTask}</Text>

            <Button title="📸 Upload Image" onPress={handlePickImage} />

            {fileUri && <Image source={{ uri: fileUri }} style={styles.image} />}

            {location && (
                <Text style={styles.location}>
                    📍 {location.latitude}, {location.longitude}
                </Text>
            )}

            {loading && <ActivityIndicator size="large" color="#4caf50" style={{ marginTop: 10 }} />}

            <TouchableOpacity
                style={[styles.submitBtn, completed && styles.completedBtn]}
                onPress={handleComplete}
                disabled={loading || completed}
            >
                <Text style={styles.submitText}>
                    {completed ? "✅ Completed" : loading ? "Verifying..." : "Submit & Complete"}
                </Text>
            </TouchableOpacity>

            {message ? <Text style={styles.msg}>{message}</Text> : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, alignItems: "center", backgroundColor: "#f0fdf4" },
    backBtn: { alignSelf: "flex-start", marginBottom: 10 },
    backText: { color: "#388e3c", fontWeight: "bold" },
    title: { fontSize: 22, fontWeight: "bold", color: "#1b5e20", marginBottom: 10 },
    desc: { fontSize: 16, textAlign: "center", marginBottom: 15, color: "#33691e" },
    image: { width: 250, height: 250, borderRadius: 10, marginTop: 15 },
    location: { marginTop: 10, color: "#666" },
    submitBtn: {
        marginTop: 20,
        backgroundColor: "#4caf50",
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    completedBtn: { backgroundColor: "#a5d6a7" },
    submitText: { color: "white", fontWeight: "bold", fontSize: 16 },
    msg: { marginTop: 15, color: "#2e7d32", textAlign: "center", fontWeight: "600" },
});
