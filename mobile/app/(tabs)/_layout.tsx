import React, { useEffect, useState } from "react";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/icon-symbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Drawer.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          drawerIcon: ({ color, size }) => (
            <IconSymbol size={size} name="house.fill" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="LoginPage"
        options={{
          title: "Login",
          drawerItemStyle: { display: user ? "none" : "flex" }, // 👈 Hide when logged in
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-in-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Signup"
        options={{
          title: "Signup",
          drawerItemStyle: { display: user ? "none" : "flex" }, // 👈 Hide when logged in
          drawerIcon: ({ color, size }) => (
            <IconSymbol size={size} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Leaderboard"
        options={{
          title: "Leaderboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="EcoCrush"
        options={{
          title: "EcoCrush",
          drawerItemStyle: { display: !user ? "none" : "flex" },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ProfilePage"
        options={{
          title: "Profile",
          drawerItemStyle: { display: !user ? "none" : "flex" },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Activities"
        options={{
          title: "Activities",
          drawerItemStyle: { display: !user ? "none" : "flex" },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      
    </Drawer>
  );
}
