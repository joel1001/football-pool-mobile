import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import { Splash } from "@/atomic";

export default function TabLayout() {
  const [loadSplash, setLoadSplash] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setLoadSplash(false);
    }, 2500);
  }, []);

  return loadSplash ? (
    <Splash showLoading backgroundColor="#00B894" />
  ) : (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "light",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <></>,
        }}
      />
      {/* <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
