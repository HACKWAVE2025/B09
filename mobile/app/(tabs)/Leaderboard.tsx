import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";

interface User {
  _id?: string;
  name: string;
  points: number;
}

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (!fontLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 800 }}
        style={styles.header}
      >
        <Ionicons name="trophy" size={50} color="#2e7d32" />
        <Text style={styles.title}>EcoQuest Leaderboard 🌿</Text>
        <Text style={styles.subtitle}>Top 10 Planet Protectors</Text>
      </MotiView>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
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
                index < 3
                  ? { backgroundColor: "#a5d6a7" }
                  : { backgroundColor: "#ffffff" },
              ]}
            >
              <Text style={styles.rank}>{getMedal(index)}</Text>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.points}>{user.points}</Text>
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
    backgroundColor: "#f7fdf8",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7fdf8",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontFamily: "PressStart2P",
    fontSize: 12,
    color: "#1b5e20",
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#388e3c",
    marginTop: 8,
    textAlign: "center",
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
    fontFamily: "PressStart2P",
    fontSize: 10,
    color: "#1b5e20",
    width: 50,
  },
  name: {
    flex: 1,
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#1b5e20",
    textAlign: "left",
  },
  points: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#2e7d32",
    textAlign: "right",
  },
});

export default Leaderboard;
