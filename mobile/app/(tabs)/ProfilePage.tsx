import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Share,
    StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import CalendarPicker from "react-native-calendar-picker";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function ProfilePage() {
    const navigation = useNavigation();
    const [user, setUser] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [activitiesForDate, setActivitiesForDate] = useState<any[]>([]);
    const [todaySummary, setTodaySummary] = useState<string>("");
    const [loadingSummary, setLoadingSummary] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            if (!storedUser) {
                navigation.navigate("LoginPage" as never);
            } else {
                setUser(JSON.parse(storedUser));
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem("user");

        // 🔁 Reset navigation so Drawer and other stacks re-render from scratch
        navigation.reset({
            index: 0,
            routes: [{ name: "LoginPage" as never }],
        });
    };


    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        const activities =
            user?.calendar?.filter((entry: any) => {
                const entryDate = new Date(entry.date);
                return (
                    entryDate.getDate() === date.getDate() &&
                    entryDate.getMonth() === date.getMonth() &&
                    entryDate.getFullYear() === date.getFullYear()
                );
            }) || [];
        setActivitiesForDate(activities);
    };

    const handleSummarizeToday = async () => {
        if (!user?.calendar?.length) {
            Alert.alert("No activities", "No activities today to summarize.");
            return;
        }

        const today = new Date();
        const todaysActivities = user.calendar.filter((entry: any) => {
            const entryDate = new Date(entry.date);
            return (
                entryDate.getDate() === today.getDate() &&
                entryDate.getMonth() === today.getMonth() &&
                entryDate.getFullYear() === today.getFullYear()
            );
        });

        if (todaysActivities.length === 0) {
            Alert.alert("No activities", "No activities today to summarize.");
            return;
        }

        setLoadingSummary(true);
        try {
            const res = await fetch("https://b09-backend.onrender.com/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activities: todaysActivities, name: user.name }),
            });
            const data = await res.json();
            setTodaySummary(data.summary || "Failed to generate summary.");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to summarize today's activities.");
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleShareSummary = async () => {
        if (!todaySummary) return;
        try {
            await Share.share({
                message: todaySummary,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleDownloadSummary = async () => {
        if (!todaySummary) return;
        const fileUri = `${(FileSystem as any).cacheDirectory}eco_summary.txt`;
        await FileSystem.writeAsStringAsync(fileUri, todaySummary);
        await Sharing.shareAsync(fileUri);
    };

    if (!user) return null;

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            style={{ backgroundColor: "#f0f0f0" }}
        >
            <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
            <Text style={styles.emailText}>{user.email}</Text>

            {/* Points */}
            <View style={styles.pointsCard}>
                <Text style={styles.pointsTitle}>Total Points</Text>
                <Text style={styles.pointsValue}>{user.points || 0}</Text>
            </View>

            {/* Calendar */}
            <Text style={styles.sectionTitle}>Your Activity Calendar</Text>
            <View style={styles.calendarWrapper}>
                <CalendarPicker
                    onDateChange={(date: Date) => handleDateChange(new Date(date))}
                    selectedStartDate={selectedDate}
                    todayBackgroundColor="#4caf50"
                    selectedDayColor="#81c784"
                    selectedDayTextColor="#fff"
                />
            </View>

            {/* Summarize */}
            <TouchableOpacity
                style={styles.summarizeButton}
                onPress={handleSummarizeToday}
                disabled={loadingSummary}
            >
                <Text style={styles.summarizeText}>
                    {loadingSummary ? "Summarizing..." : "Summarize Today's Actions"}
                </Text>
            </TouchableOpacity>

            {todaySummary ? (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>{todaySummary}</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: "#4caf50" }]}
                            onPress={handleDownloadSummary}
                        >
                            <Text style={styles.buttonText}>Download</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: "#2196f3" }]}
                            onPress={handleShareSummary}
                        >
                            <Text style={styles.buttonText}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ alignItems: "center", marginTop: 20 }}>
                        <Text style={styles.qrTitle}>Today's Activity QR</Text>
                        <QRCode
                            value={todaySummary || "No summary available."}
                            size={180}
                            backgroundColor="#ffffff"
                            color="#000000"
                        />
                    </View>
                </View>
            ) : null}

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f0f0f0",
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2e7d32",
        marginTop: 10,
    },
    emailText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 20,
    },
    pointsCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        marginBottom: 25,
        elevation: 3,
    },
    pointsTitle: { fontSize: 18, color: "#555" },
    pointsValue: { fontSize: 36, fontWeight: "bold", color: "#4caf50" },
    sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
    calendarWrapper: {
        width: "100%",
        borderRadius: 12,
        backgroundColor: "#fff",
        padding: 10,
        marginBottom: 20,
    },
    summarizeButton: {
        backgroundColor: "#ffb300",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    summarizeText: { color: "#fff", fontWeight: "600" },
    summaryCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        width: "100%",
    },
    summaryText: { fontSize: 16, color: "#333", textAlign: "center" },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 15,
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: { color: "#fff", fontWeight: "600" },
    qrTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#d32f2f",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 40,
    },
    logoutText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
});
