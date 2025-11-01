import React from "react";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { DrawerNavigationOptions } from "@react-navigation/drawer";

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

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
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IconSymbol size={size} name="house.fill" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="LoginPage"
        options={{
          title: "Login",
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="log-in-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Signup"
        options={{
          title: "Signup",
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IconSymbol size={size} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Leaderboard"
        options={{
          title: "Leaderboard",
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
