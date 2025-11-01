import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MotiView } from "moti";
import { ThemeContext } from "../context/ThemeContent";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

interface User {
    _id?: string;
    name: string;
    points: number;
}

const HomePage: React.FC = () => {
    const { theme } = useContext(ThemeContext);
    const [leaderboard, setLeaderboard] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch("http://192.168.137.1:5000/api/leaderboard");
                const data = await res.json();
                if (Array.isArray(data)) {
                    const sorted = data.sort((a, b) => b.points - a.points);
                    setLeaderboard(sorted);
                }
            } catch (error) {
                console.error("❌ Failed to fetch leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const isDark = theme === "dark";

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f7fdf8" }]}>
            {/* HERO SECTION */}
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 800 }}
                style={styles.hero}
            >
                <Text style={[styles.heroTitle, { color: isDark ? "#fff" : "#1b5e20" }]}>
                    PLAY, LEARN.{"\n"}
                    <Text style={[styles.heroSubtitle, { color: isDark ? "#81c784" : "#2e7d32" }]}>GO GREEN.</Text>
                </Text>

                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: isDark ? "#4caf50" : "#2e7d32" }]}
                    onPress={() => console.log("Navigate to Login")}
                >
                    <Text style={styles.buttonText}>Start Your Journey</Text>
                </TouchableOpacity>
            </MotiView>

            {/* FEATURES SECTION */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : "#1b5e20" }]}>Why Join EcoQuest?</Text>
                <View style={styles.featureList}>
                    <FeatureCard
                        icon={<FontAwesome5 name="leaf" size={28} color="#43a047" />}
                        title="Track Eco Actions"
                        text="Log your eco-friendly tasks and watch your green points grow!"
                        isDark={isDark}
                    />
                    <FeatureCard
                        icon={<Ionicons name="people" size={28} color="#43a047" />}
                        title="Compete with Friends"
                        text="Join leaderboards and see who contributes most to our planet!"
                        isDark={isDark}
                    />
                    <FeatureCard
                        icon={<FontAwesome5 name="trophy" size={28} color="#43a047" />}
                        title="Unlock Badges"
                        text="Complete challenges and earn unique green badges!"
                        isDark={isDark}
                    />
                </View>
            </View>

            {/* LEADERBOARD SECTION */}
            <View style={[styles.section, { backgroundColor: isDark ? "#1e1e1e" : "#e8f5e9", borderRadius: 12 }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? "#a5d6a7" : "#1b5e20" }]}>Top Green Heroes 🌍</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={isDark ? "#81c784" : "#2e7d32"} />
                ) : (
                    leaderboard.map((user, index) => (
                        <View key={user._id || index} style={styles.leaderboardItem}>
                            <Text style={[styles.rank, { color: isDark ? "#81c784" : "#2e7d32" }]}>{index + 1}.</Text>
                            <Text style={[styles.name, { color: isDark ? "#fff" : "#1b5e20" }]}>{user.name}</Text>
                            <Text style={[styles.points, { color: isDark ? "#c8e6c9" : "#388e3c" }]}>{user.points}</Text>
                        </View>
                    ))
                )}
            </View>

            {/* FOOTER */}
            <Text style={[styles.footer, { color: isDark ? "#9e9e9e" : "#4e4e4e" }]}>
                © 2025 EcoQuest | Built with 💚 by Neural Networks
            </Text>
        </ScrollView>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    text: string;
    isDark: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, text, isDark }) => (
    <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700 }}
        style={[styles.card, { backgroundColor: isDark ? "#2c2c2c" : "#fff" }]}
    >
        {icon}
        <Text style={[styles.cardTitle, { color: isDark ? "#fff" : "#1b5e20" }]}>{title}</Text>
        <Text style={[styles.cardText, { color: isDark ? "#cfcfcf" : "#555" }]}>{text}</Text>
    </MotiView>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
    },
    hero: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 20,
    },
    heroTitle: {
        textAlign: "center",
        fontSize: 32,
        fontWeight: "bold",
    },
    heroSubtitle: {
        fontSize: 36,
        fontWeight: "900",
    },
    startButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    section: {
        padding: 16,
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 16,
    },
    featureList: {
        flexDirection: "column",
        gap: 14,
    },
    card: {
        borderRadius: 12,
        padding: 18,
        marginVertical: 6,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 8,
    },
    cardText: {
        textAlign: "center",
        fontSize: 14,
        marginTop: 4,
    },
    leaderboardItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: "#a5d6a7",
    },
    rank: {
        fontSize: 16,
        fontWeight: "bold",
    },
    name: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
    },
    points: {
        fontSize: 16,
        fontWeight: "600",
    },
    footer: {
        textAlign: "center",
        marginVertical: 20,
        fontSize: 13,
    },
});

export default HomePage;
