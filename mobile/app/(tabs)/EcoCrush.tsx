import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EcoTaskPage from "../grid/EcoTaskPage"; // ✅ Import your task page

export default function EcoCrush() {
    const totalDays: number = 30;
    const [currentDay, setCurrentDay] = useState<number>(1);
    const [showTaskPage, setShowTaskPage] = useState<boolean>(false);

    // ✅ Load saved progress from AsyncStorage
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const savedDay = await AsyncStorage.getItem("ecoCrushDay");
                if (savedDay) setCurrentDay(Number(savedDay));
            } catch (error) {
                console.error("Error loading progress:", error);
            }
        };
        loadProgress();
    }, []);

    // ✅ Save progress whenever currentDay changes
    useEffect(() => {
        const saveProgress = async () => {
            try {
                await AsyncStorage.setItem("ecoCrushDay", currentDay.toString());
            } catch (error) {
                console.error("Error saving progress:", error);
            }
        };
        saveProgress();
    }, [currentDay]);

    const completedDays = currentDay - 1;

    const handleDayClick = (day: number) => {
        if (day === currentDay) {
            setShowTaskPage(true);
        } else if (day < currentDay) {
            Alert.alert(`✅ You've already completed Day ${day}!`);
        } else {
            Alert.alert(`🔒 Day ${day} is locked.`);
        }
    };

    const handleClaim = () => {
        if (currentDay <= totalDays) {
            Alert.alert("❌ Complete all 30 days to claim your gift!");
        } else {
            Alert.alert("🎁 Congratulations! You've earned your reward!");
        }
    };

    const handleBack = () => {
        setShowTaskPage(false);
    };

    const handleCompleteTask = (task: string) => {
        Alert.alert(`🎉 Great job completing: ${task}!`);
        setCurrentDay((prev) => Math.min(prev + 1, totalDays + 1)); // ✅ cap at 31
        setShowTaskPage(false);
    };

    // ✅ Show task page if opened
    if (showTaskPage) {
        return (
            <EcoTaskPage
                day={currentDay}
                onBack={handleBack}
                onCompleteTask={handleCompleteTask}
            />
        );
    }

    // ✅ Otherwise show main EcoCrush page
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>EcoCrush – 30-Day Growth Path</Text>

            <View style={styles.pathContainer}>
                {Array.from({ length: totalDays }, (_, i) => {
                    const day = i + 1;
                    const isDone = day <= completedDays;
                    const isCurrent = day === currentDay;

                    return (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayCircle,
                                isDone && styles.completed,
                                isCurrent && styles.current,
                            ]}
                            onPress={() => handleDayClick(day)}
                        >
                            <Text style={styles.dayText}>{day}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={[
                    styles.claimButton,
                    currentDay > totalDays ? styles.claimActive : styles.claimLocked,
                ]}
                onPress={handleClaim}
                disabled={currentDay <= totalDays}
            >
                <Text style={styles.claimText}>🎁 Claim Gift</Text>
            </TouchableOpacity>

            <Text style={styles.info}>
                {completedDays} / {totalDays} days completed
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f0fdf4",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1b5e20",
        marginBottom: 20,
    },
    pathContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    dayCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#e8f5e9",
        margin: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    completed: { backgroundColor: "#a5d6a7" },
    current: { borderWidth: 2, borderColor: "#4caf50" },
    dayText: { color: "#2e7d32", fontWeight: "600" },
    claimButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    claimActive: { backgroundColor: "#4caf50" },
    claimLocked: { backgroundColor: "#c8e6c9" },
    claimText: { color: "white", fontWeight: "bold" },
    info: { marginTop: 15, color: "#4e342e" },
});
