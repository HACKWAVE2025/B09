import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";

interface GameGridProps {
    onOpenChallenge: (day: number) => void;
}

export default function GameGrid({ onOpenChallenge }: GameGridProps) {
    const daysInMonth = 30;
    const today = new Date().getDate();
    const monthName = new Date().toLocaleString("default", { month: "long" });

    const [user, setUser] = useState<any>(null);

    // ✅ Fetch user data from AsyncStorage
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const stored = await AsyncStorage.getItem("user");
                if (stored) setUser(JSON.parse(stored));
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUser();
    }, []);

    const highestCompletedLevel = user ? user.highestCompletedLevel || 0 : 0;

    const handleDayClick = (day: number) => {
        if (day > today || day > highestCompletedLevel + 1) return;
        onOpenChallenge(day);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🍃 {monthName} Eco Adventure</Text>
            <ScrollView contentContainerStyle={styles.scroll}>
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const isLocked = day > today;
                    const isComplete = day <= highestCompletedLevel;
                    const isClickable = day <= today && day === highestCompletedLevel + 1;

                    return (
                        <TouchableOpacity
                            key={day}
                            disabled={isLocked}
                            onPress={() => handleDayClick(day)}
                            style={[
                                styles.dayCircle,
                                isLocked && styles.locked,
                                isComplete && styles.completed,
                            ]}
                        >
                            <FontAwesome5
                                name={
                                    isLocked
                                        ? "lock"
                                        : isComplete
                                            ? "check-circle"
                                            : "leaf"
                                }
                                size={20}
                                color={isLocked ? "#ccc" : isComplete ? "#4caf50" : "#81c784"}
                            />
                            <Text style={styles.dayNum}>{day}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 30, alignItems: "center" },
    title: { fontSize: 22, fontWeight: "bold", color: "#2e7d32", marginBottom: 20 },
    scroll: { alignItems: "center" },
    dayCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#e8f5e9",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 8,
    },
    locked: { opacity: 0.4 },
    completed: { backgroundColor: "#a5d6a7" },
    dayNum: { marginTop: 5, fontWeight: "600" },
});
