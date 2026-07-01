import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Colors } from '../styles/GlobalStyles';

// Screens
import HomeScreen from '../screens/HomeScreen';
import GameHistoryScreen from '../screens/GameHistoryScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlayersScreen from '../screens/PlayersScreen';
import CustomQuestionsScreen from '../screens/CustomQuestionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PremiumScreen from '../screens/PremiumScreen';

// Game flow screens
import GameSetupScreen from '../screens/GameSetupScreen';
import QuestionTransitionScreen from '../screens/QuestionTransitionScreen';
import QuestionScreen from '../screens/QuestionScreen';
import EvaluationScreen from '../screens/EvaluationScreen';
import GameStatusScreen from '../screens/GameStatusScreen';
import GameEndScreen from '../screens/GameEndScreen';

// Onboarding
import OnboardingScreen from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const OnboardingStack = createNativeStackNavigator();

const tabBarStyle = {
  backgroundColor: Colors.surface,
  borderTopColor: Colors.border,
  borderTopWidth: 1,
  paddingBottom: 6,
  paddingTop: 6,
  height: 60,
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GameHistoryMain" component={GameHistoryScreen} />
      <Stack.Screen name="GameDetail" component={GameDetailScreen} />
    </Stack.Navigator>
  );
}

function StatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatsMain" component={StatsScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Players" component={PlayersScreen} />
      <Stack.Screen name="CustomQuestions" component={CustomQuestionsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home',
            Parties: 'history',
            Stats: 'chart-bar',
            Profile: 'account',
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name] || 'circle'}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: t('navigation.home') }}
      />
      <Tab.Screen
        name="Parties"
        component={HistoryStack}
        options={{ tabBarLabel: t('navigation.parties') }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsStack}
        options={{ tabBarLabel: t('navigation.stats') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
}

function GameFlow() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="GameSetup" component={GameSetupScreen} />
      <Stack.Screen name="QuestionTransition" component={QuestionTransitionScreen} />
      <Stack.Screen name="Question" component={QuestionScreen} />
      <Stack.Screen name="Evaluation" component={EvaluationScreen} />
      <Stack.Screen name="GameStatus" component={GameStatusScreen} />
      <Stack.Screen
        name="GameEnd"
        component={GameEndScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

export function OnboardingNavigator({ onDone }) {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen
        name="Onboarding"
      >
        {() => <OnboardingScreen onDone={onDone} />}
      </OnboardingStack.Screen>
    </OnboardingStack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen
        name="GameFlow"
        component={GameFlow}
        options={{ presentation: 'fullScreenModal', unmountOnBlur: true }}
      />
      <RootStack.Screen
        name="PremiumModal"
        component={PremiumScreen}
        options={{ presentation: 'modal' }}
      />
    </RootStack.Navigator>
  );
}

export default function Navigation({ isOnboarding, onOnboardingDone }) {
  return (
    <NavigationContainer>
      {isOnboarding ? (
        <OnboardingNavigator onDone={onOnboardingDone} />
      ) : (
        <AppNavigator />
      )}
    </NavigationContainer>
  );
}
