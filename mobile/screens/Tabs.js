import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { Platform, View, StyleSheet } from "react-native";

import AskScreen from "./AskScreen";
import HomeScreen from "./HomeScreen";
import SettingsScreen from "./SettingsScreen";
import TimelineScreen from "./TimelineScreen";
import { colors, fonts, spacing, radius } from "../theme";

const Tab = createBottomTabNavigator();

export default function Tabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => {
          const iconMap = {
            Home: "grid",
            Ask: "message-circle",
            Timeline: "clock",
            Settings: "settings",
          };
          
          return (
            <View style={focused ? styles.iconContainerFocused : styles.iconContainer}>
              <Feather name={iconMap[route.name]} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Ask" component={AskScreen} />
      <Tab.Screen name="Timeline" component={TimelineScreen} />
      <Tab.Screen name="Settings">
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === "ios" ? 88 : 72,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    paddingTop: 8,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    marginTop: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerFocused: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentPrimary + "20",
  },
});
