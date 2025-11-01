import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MotiView } from "moti";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as Font from "expo-font";

interface User {
  _id?: string;
  name: string;
  points: number;
}

const HomePage: React.FC = () => {
    const navigation=useNavigation<any>();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
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

  if (!fontLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HERO SECTION */}
      <ImageBackground
        source={require("../../assets/images/morning.gif")}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 800 }}
          >
            <Text style={styles.heroTitle}>
              PLAY, LEARN.{"\n"}
              <Text style={styles.goGreenText}>GO GREEN.</Text>
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.buttonText}>Start Your Journey</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </ImageBackground>

      {/* FEATURES SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Join EcoQuest?</Text>
        <View style={styles.featureList}>
          <FeatureCard
            icon={<FontAwesome5 name="leaf" size={28} color="#43a047" />}
            title="Track Eco Actions"
            text="Log your eco-friendly tasks and watch your green points grow!"
          />
          <FeatureCard
            icon={<Ionicons name="people" size={28} color="#43a047" />}
            title="Compete with Friends"
            text="Join leaderboards and see who contributes most to our planet!"
          />
          <FeatureCard
            icon={<FontAwesome5 name="trophy" size={28} color="#43a047" />}
            title="Unlock Badges"
            text="Complete challenges and earn unique green badges!"
          />
        </View>
      </View>

      {/* LEADERBOARD SECTION */}
      <View style={styles.leaderboardSection}>
        <Text style={styles.sectionTitle}>Top Green Heroes 🌍</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2e7d32" />
        ) : (
          leaderboard.map((user, index) => (
            <View key={user._id || index} style={styles.leaderboardItem}>
              <Text style={styles.rank}>{index + 1}.</Text>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.points}>{user.points}</Text>
            </View>
          ))
        )}
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        © 2025 EcoQuest | Built with 💚 by Neural Networks
      </Text>
    </ScrollView>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, text }) => (
  <MotiView
    from={{ opacity: 0, translateY: 10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: "timing", duration: 700 }}
    style={styles.card}
  >
    {icon}
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardText}>{text}</Text>
  </MotiView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fdf8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7fdf8",
  },
  hero: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: "PressStart2P",
    color: "#000",
    textShadowColor: "#FFD700",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 20,
  },
  goGreenText: {
    fontSize: 20,
    color: "#FFD700",
    fontFamily: "PressStart2P",
  },
  startButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#2e7d32",
    shadowColor: "#2e7d32",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  buttonText: {
    color: "white",
    fontFamily: "PressStart2P",
    fontSize: 10,
    textAlign: "center",
  },
  section: {
    padding: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "PressStart2P",
    textAlign: "center",
    color: "#1b5e20",
    marginBottom: 16,
  },
  featureList: {
    flexDirection: "column",
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderColor: "#c8e6c9",
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    marginVertical: 6,
    alignItems: "center",
    shadowColor: "#2e7d32",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: "PressStart2P",
    marginTop: 8,
    textAlign: "center",
    color: "#1b5e20",
  },
  cardText: {
    textAlign: "center",
    fontSize: 8,
    fontFamily: "PressStart2P",
    marginTop: 4,
    lineHeight: 14,
    color: "#555",
  },
  leaderboardSection: {
    padding: 16,
    marginVertical: 16,
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },
  leaderboardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#228B22",
  },
  rank: {
    fontSize: 10,
    fontFamily: "PressStart2P",
    color: "#2e7d32",
  },
  name: {
    flex: 1,
    textAlign: "center",
    fontSize: 9,
    fontFamily: "PressStart2P",
    color: "#1b5e20",
  },
  points: {
    fontSize: 10,
    fontFamily: "PressStart2P",
    color: "#388e3c",
  },
  footer: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 8,
    fontFamily: "PressStart2P",
    color: "#4e4e4e",
  },
});

export default HomePage;
