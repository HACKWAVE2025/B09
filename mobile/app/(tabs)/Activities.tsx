import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


const IMAGGA_API_KEY = "acc_b3cb141d1acc743";
const IMAGGA_API_SECRET = "261dc374bb10ca9c6c5af7d8d7485dc5";

const activityPoints: Record<string, any> = {
    "Recycled Trash": { points: 10, co2: 0.5, keywords: ["trash", "garbage", "recycle"] },
    "Planted Tree": { points: 50, co2: 20, keywords: ["tree", "plant", "nature"] },
    "Boarded Public Transport": { points: 15, co2: 1, keywords: ["bus", "train", "metro", "tram"] },
    "Saved Electricity": { points: 5, co2: 0.2, keywords: ["light", "electricity", "lamp"] },
    "Used Bicycle": { points: 20, co2: 2, keywords: ["bicycle", "bike", "cycling"] },
};

export default function ActivitiesScreen() {
    const [activity, setActivity] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
        latitude: null,
        longitude: null,
    });
    const [uploadTimestamp, setUploadTimestamp] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Get location on mount
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Location permission is required to log your eco activity.");
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: parseFloat(loc.coords.latitude.toFixed(5)),
                longitude: parseFloat(loc.coords.longitude.toFixed(5)),
            });
        })();
    }, []);

    // ✅ Pick Image (camera/gallery)
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            const now = new Date();
            setUploadTimestamp(now.toLocaleString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
            }));
        }
    };

    // ✅ Verify image using Imagga
    const checkActivityImage = async (uri: string, activity: string) => {
        const formData = new FormData();
        const fileName = uri.split("/").pop() || "photo.jpg";
        const fileType = fileName.split(".").pop();

        formData.append("image", {
            uri,
            name: fileName,
            type: `image/${fileType}`,
        } as any);

        const response = await fetch("https://api.imagga.com/v2/tags", {
            method: "POST",
            headers: {
                Authorization: "Basic " + btoa(`${IMAGGA_API_KEY}:${IMAGGA_API_SECRET}`),
            },
            body: formData,
        });

        const data = await response.json();
        if (data.result && data.result.tags) {
            const tags = data.result.tags.map((t: any) => t.tag.en.toLowerCase());
            const keywords = activityPoints[activity].keywords.map((k: string) => k.toLowerCase());
            return keywords.some((keyword: string) => tags.some((tag: string) => tag.includes(keyword) || keyword.includes(tag)));
        }

        return false;
    };

    // ✅ Submit Activity
    const handleSubmit = async () => {
        if (!activity) return Alert.alert("Error", "Please select an activity.");
        if (!image) return Alert.alert("Error", "Please upload an image.");

        setLoading(true);
        const valid = await checkActivityImage(image, activity);
        if (!valid) {
            setLoading(false);
            return Alert.alert("❌ Invalid Image", "The uploaded image doesn’t match the selected activity.");
        }

        const user = JSON.parse(await AsyncStorage.getItem("user") || "{}");

        const formData = new FormData();
        formData.append("name", user.name || "Unknown");
        formData.append("type", activity);
        formData.append("points", activityPoints[activity].points);
        formData.append("co2Saved", activityPoints[activity].co2);
        formData.append("latitude", String(location.latitude));
        formData.append("longitude", String(location.longitude));
        formData.append("timestamp", uploadTimestamp);

        const filename = image.split("/").pop() || "image.jpg";
        const type = filename.split(".").pop();

        formData.append("image", {
            uri: image,
            name: filename,
            type: `image/${type}`,
        } as any);

        try {
            const res = await fetch("https://b09-backend.onrender.com/api/activities", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to submit activity.");

            Alert.alert("✅ Success", "Activity submitted successfully!");
            setActivity("");
            setImage(null);
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Submit Your Eco Activity 🌱</Text>
            <Text style={styles.subtitle}>Earn points by logging your eco-friendly actions!</Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                    <>
                        <Ionicons name="camera-outline" size={40} color="#2e7d32" />
                        <Text style={{ color: "#2e7d32" }}>Tap to upload image</Text>
                    </>
                )}
            </TouchableOpacity>

            {uploadTimestamp ? (
                <Text style={styles.timestamp}>📅 {uploadTimestamp}</Text>
            ) : null}

            <Text style={styles.label}>Select Activity</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={activity}
                    onValueChange={(value: string) => setActivity(value)}
                >

                    <Picker.Item label="-- Choose an activity --" value="" />
                    {Object.keys(activityPoints).map((key) => (
                        <Picker.Item key={key} label={key} value={key} />
                    ))}
                </Picker>
            </View>

            {location.latitude && (
                <Text style={styles.location}>
                    📍 Lat: {location.latitude}, Lon: {location.longitude}
                </Text>
            )}

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitText}>Submit Activity</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        flexGrow: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2e7d32",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
    },
    imagePicker: {
        width: "90%",
        height: 200,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#2e7d32",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e8f5e9",
        marginBottom: 15,
    },
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    pickerContainer: {
        width: "90%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: "white",
    },
    label: {
        alignSelf: "flex-start",
        marginLeft: 20,
        color: "#2e7d32",
        fontWeight: "bold",
    },
    location: {
        marginVertical: 10,
        color: "#333",
    },
    timestamp: {
        color: "#777",
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: "#2e7d32",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 15,
    },
    submitText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});
