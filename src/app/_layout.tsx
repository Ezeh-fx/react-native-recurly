import { posthog } from "@/lib/posthog";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { useEffect } from "react";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env file");
  }

  const content = <RootContent fontsReady={fontsLoaded || !!fontError} />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider
          client={posthog}
          autocapture={{ captureScreens: false }}
        >
          {content}
        </PostHogProvider>
      ) : (
        content
      )}
    </ClerkProvider>
  );
}

function RootContent({ fontsReady }: { fontsReady: boolean }) {
  const { isLoaded: authLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!user || !posthog) return;

    posthog.identify(user.id, {
      $set: {
        ...(user.primaryEmailAddress?.emailAddress
          ? { email: user.primaryEmailAddress.emailAddress }
          : {}),
        ...(user.fullName ? { name: user.fullName } : {}),
      },
    });
  }, [user]);

  useEffect(() => {
    if (fontsReady && authLoaded) {
      SplashScreen.hideAsync();
    }
  }, [authLoaded, fontsReady]);

  if (!fontsReady || !authLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
