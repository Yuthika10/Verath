import React, { useState, useEffect, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import Tabs from "./screens/Tabs";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors, fonts } from "./theme";

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("verath_token");
        setIsAuthenticated(!!token);
      } catch (e) {
        console.error("Auth check error:", e);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // Hide splash screen when ready
  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && authChecked) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authChecked]);

  // Loading state
  if ((!fontsLoaded && !fontError) || !authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>V</Text>
        </View>
        <ActivityIndicator size="small" color={colors.accentPrimary} style={styles.spinner} />
      </View>
    );
  }

  // Auth screens
  if (!isAuthenticated) {
    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
        {isRegistering ? (
          <RegisterScreen
            onRegisterSuccess={() => setIsRegistering(false)}
            onSwitchToLogin={() => setIsRegistering(false)}
          />
        ) : (
          <LoginScreen
            onLoginSuccess={() => setIsAuthenticated(true)}
            onSwitchToRegister={() => setIsRegistering(true)}
          />
        )}
      </View>
    );
  }

  // Main app
  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Tabs onLogout={() => setIsAuthenticated(false)} />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 28,
    color: "#fff",
  },
  spinner: {
    marginTop: 8,
  },
});
