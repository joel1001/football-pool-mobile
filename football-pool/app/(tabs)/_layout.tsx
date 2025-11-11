import { Stack } from "expo-router";
import React, { useState, useEffect } from "react";
import { Splash } from "@/atomic";
import { useAppContext } from "@/context/app-context";
import { Login } from "@/atomic/templates/login/login";

export default function TabLayout() {
  const [loadSplash, setLoadSplash] = useState<boolean>(true);
  const { localData } = useAppContext();

  useEffect(() => {
    setTimeout(() => {
      setLoadSplash(false);
    }, 3500);
  }, []);

  const whatToDisplayDependingAuth = () => {
    return(
      localData.isAuthenticated ? (
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Home",
            }}
          />
        </Stack>)
      :
      (
        <Login />
      )
    )
  }

  return loadSplash ? (
    <Splash showLoading backgroundColor="#00B894" />
  ) : (
    whatToDisplayDependingAuth()
  );
}
