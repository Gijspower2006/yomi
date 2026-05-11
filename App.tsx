import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts,
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_600SemiBold,
  NotoSansJP_700Bold,
  NotoSansJP_800ExtraBold,
  NotoSansJP_900Black,
} from '@expo-google-fonts/noto-sans-jp';

import { useSettings } from './src/hooks/useStorage';
import { useAuth } from './src/hooks/useAuth';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AuthUser } from './src/types';
import { darkColors } from './src/constants/colors';

import HomeScreen from './src/screens/HomeScreen';
import VocabNavigator from './src/screens/vocab/VocabNavigator';
import StudyNavigator from './src/screens/study/StudyNavigator';
import GrammarNavigator from './src/screens/grammar/GrammarNavigator';
import SettingsScreen from './src/screens/SettingsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import AuthNavigator from './src/screens/auth/AuthNavigator';
import PaywallScreen from './src/screens/PaywallScreen';
import { ProProvider } from './src/contexts/ProContext';
import AdBanner from './src/components/AdBanner';

type Tab = 'Home' | 'Vocabulary' | 'Study' | 'Grammar' | 'Rank' | 'Settings';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'Home',       icon: '家',  label: 'Home' },
  { id: 'Vocabulary', icon: '語',  label: 'Words' },
  { id: 'Study',      icon: '学',  label: 'Study' },
  { id: 'Grammar',    icon: '文',  label: 'Grammar' },
  { id: 'Rank',       icon: '位',  label: 'Rank' },
  { id: 'Settings',   icon: '設',  label: 'Settings' },
];

export default function App() {
  const { settings, saveSettings, loaded } = useSettings();
  const { user: authUser, loading: authLoading, saveUser, logout } = useAuth();
  const [fontsLoaded] = useFonts({
    NotoSansJP_400Regular,
    NotoSansJP_500Medium,
    NotoSansJP_600SemiBold,
    NotoSansJP_700Bold,
    NotoSansJP_800ExtraBold,
    NotoSansJP_900Black,
  });

  if (!loaded || !fontsLoaded || authLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: darkColors.background }]}>
        <View style={styles.splashIconWrap}>
          <Text style={styles.splashKanji}>読</Text>
        </View>
        <Text style={styles.splashText}>Yomi</Text>
        <Text style={styles.splashSub}>Japanese · N5 to N1</Text>
      </View>
    );
  }

  const handleAuth = async (user: AuthUser) => {
    await saveUser(user);
    if (user.displayName?.trim()) {
      await saveSettings({ username: user.displayName.trim() });
    }
  };

  if (!authUser) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <AuthNavigator onAuth={handleAuth} />
      </GestureHandlerRootView>
    );
  }

  if (!settings.onboarded) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={saveSettings} />
      </GestureHandlerRootView>
    );
  }

  return (
    <ThemeProvider theme={settings.theme ?? 'dark'} fontSize={settings.fontSize ?? 'medium'}>
      <ProProvider paywallComponent={(visible, onClose) => (
        <PaywallScreen visible={visible} onClose={onClose} />
      )}>
        <GestureHandlerRootView style={styles.root}>
          <AppShell
            settings={settings}
            saveSettings={saveSettings}
            authUser={authUser}
            logout={logout}
          />
        </GestureHandlerRootView>
      </ProProvider>
    </ThemeProvider>
  );
}

function AppShell({ settings, saveSettings, authUser, logout }: {
  settings: any; saveSettings: any; authUser: AuthUser; logout: () => void;
}) {
  const { colors, theme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('Home');

  function renderScreen() {
    switch (activeTab) {
      case 'Home':       return <HomeScreen settings={settings} onNavigate={(t) => setActiveTab(t as Tab)} />;
      case 'Vocabulary': return <VocabNavigator settings={settings} />;
      case 'Study':      return <StudyNavigator settings={settings} />;
      case 'Grammar':    return <GrammarNavigator />;
      case 'Rank':       return <LeaderboardScreen settings={settings} />;
      case 'Settings':   return <SettingsScreen settings={settings} onSave={saveSettings} onLogout={logout} authUser={authUser} />;
    }
  }

  return (
    <>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <View style={[styles.container, { backgroundColor: colors.navBar }]}>
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
          {renderScreen()}
        </View>

        <AdBanner />
        <SafeAreaView style={[styles.tabBar, { backgroundColor: colors.navBar, borderTopColor: colors.border }]}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconWrap, active && { backgroundColor: colors.primary + '30' }]}>
                  <Text style={[styles.tabIcon, { color: active ? colors.primary : colors.navInactive }]}>
                    {tab.icon}
                  </Text>
                </View>
                <Text style={[styles.tabLabel, { color: active ? colors.primary : colors.navInactive }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  screen: { flex: 1 },

  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 10 : 4,
    paddingHorizontal: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  tabIconWrap: { width: 40, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  tabIcon: { fontSize: 17, fontFamily: 'NotoSansJP_700Bold', letterSpacing: -0.5 },
  tabLabel: { fontSize: 9, fontFamily: 'NotoSansJP_600SemiBold', letterSpacing: 0.3 },

  splash: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  splashIconWrap: {
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: '#4361EE',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  splashKanji: { fontSize: 52, fontFamily: 'NotoSansJP_900Black', color: '#fff' },
  splashText:  { fontSize: 32, fontFamily: 'NotoSansJP_900Black', color: '#E8EEFF', letterSpacing: 2 },
  splashSub:   { fontSize: 13, fontFamily: 'NotoSansJP_500Medium', color: '#7B87B8', letterSpacing: 0.5 },
});
