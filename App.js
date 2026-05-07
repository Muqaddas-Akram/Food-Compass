import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DatabaseProvider } from './src/context/DatabaseContext';
import { Colors } from './src/theme/colors';
import { blurActiveElementOnWeb } from './src/utils/accessibility';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import CookingModeScreen from './src/screens/CookingModeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SearchScreen from './src/screens/SearchScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700', color: Colors.textPrimary },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={({ route }) => ({
          title: route.params.category,
        })}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: '', headerTransparent: true, headerTintColor: Colors.white }}
      />
      <Stack.Screen
        name="CookingMode"
        component={CookingModeScreen}
        options={{
          title: '',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.primary,
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  HomeTab: { active: 'home', inactive: 'home-outline' },
  SearchTab: { active: 'search', inactive: 'search-outline' },
  FavoritesTab: { active: 'heart', inactive: 'heart-outline' },
};

export default function App() {
  return (
    <DatabaseProvider>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <NavigationContainer>
        <Tab.Navigator
          screenListeners={{
            tabPress: () => {
              blurActiveElementOnWeb();
            },
          }}
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              const icons = TAB_ICONS[route.name];
              return (
                <Ionicons
                  name={focused ? icons.active : icons.inactive}
                  size={24}
                  color={color}
                />
              );
            },
            tabBarActiveTintColor: Colors.tabActive,
            tabBarInactiveTintColor: Colors.tabInactive,
            tabBarStyle: {
              backgroundColor: Colors.tabBarBg,
              borderTopColor: Colors.borderLight,
              height: 60,
              paddingBottom: 8,
              paddingTop: 4,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerShown: false,
          })}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            options={{ tabBarLabel: 'Home' }}
          />
          <Tab.Screen
            name="SearchTab"
            component={SearchScreen}
            options={{ tabBarLabel: 'Search' }}
          />
          <Tab.Screen
            name="FavoritesTab"
            component={FavoritesScreen}
            options={{ tabBarLabel: 'Favorites' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </DatabaseProvider>
  );
}
