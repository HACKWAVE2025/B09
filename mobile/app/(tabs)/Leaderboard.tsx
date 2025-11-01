import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { MotiView } from "moti";
import { ThemeContext } from "../context/ThemeContent";
import { Ionicons } from "@expo/vector-icons";

interface User {
    _id?: string;
    name: string;
    points: number;
}

const Leaderboard: React.FC = () => {
    const { theme } = useContext(ThemeContext);
    const [leaders, setLeaders] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const isDark = theme === "dark";

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const res = await fetch("http://192.168.137.1:5000/api/leaderboard");
                const data = await res.json();
                if (Array.isArray(data)) {
                    const topTen = data.sort((a, b) => b.points - a.points).slice(0, 10);
                    setLeaders(topTen);
                }
            } catch (error) {
                console.error("❌ Failed to load leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, []);

    const getMedal = (index: number): string => {
        switch (index) {
            case 0:
                return "🥇";
            case 1:
                return "🥈";
            case 2:
                return "🥉";
            default:
                return `${index + 1}.`;
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#e8f5e9" }]}>
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 800 }}
                style={styles.header}
            >
                <Ionicons name="trophy" size={40} color={isDark ? "#81c784" : "#2e7d32"} />
                <Text style={[styles.title, { color: isDark ? "#a5d6a7" : "#1b5e20" }]}>
                    EcoQuest Leaderboard 🌿
                </Text>
                <Text style={[styles.subtitle, { color: isDark ? "#cfcfcf" : "#388e3c" }]}>
                    Top 10 Planet Protectors
                </Text>
            </MotiView>

            {loading ? (
                <ActivityIndicator size="large" color={isDark ? "#81c784" : "#2e7d32"} style={{ marginTop: 40 }} />
            ) : (
                <View style={styles.table}>
                    {leaders.map((user, index) => (
                        <MotiView
                            key={user._id || index}
                            from={{ opacity: 0, translateX: -20 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: "timing", duration: 400, delay: index * 80 }}
                            style={[
                                styles.row,
                                {
                                    backgroundColor: isDark
                                        ? index < 3
                                            ? "#2e7d32"
                                            : "#1e1e1e"
                                        : index < 3
                                            ? "#a5d6a7"
                                            : "#ffffff",
                                },
                            ]}
                        >
                            <Text style={[styles.rank, { color: isDark ? "#fff" : "#1b5e20" }]}>{getMedal(index)}</Text>
                            <Text style={[styles.name, { color: isDark ? "#fff" : "#1b5e20" }]}>{user.name}</Text>
                            <Text style={[styles.points, { color: isDark ? "#c8e6c9" : "#2e7d32" }]}>{user.points}</Text>
                        </MotiView>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    table: {
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderColor: "#a5d6a7",
    },
    rank: {
        fontSize: 18,
        fontWeight: "bold",
        width: 50,
    },
    name: {
        flex: 1,
        fontSize: 16,
        textAlign: "left",
    },
    points: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "right",
    },
});

export default Leaderboard;
