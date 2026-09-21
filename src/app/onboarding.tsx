import images from "@/constants/images";
import { Link, router } from "expo-router";
import { styled } from "nativewind";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Onboarding() {
  return (
    <SafeAreaView className="flex-1 bg-accent">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image View Container */}
        <View className="mt-10 h-[45vh] min-h-[240px] max-h-[480px] w-full items-center justify-center">
          <Image
            accessibilityIgnoresInvertColors
            source={images.splashPattern}
            resizeMode="contain"
            className="w-fit h-full"
          />
        </View>

        {/* Text View Container */}
        <View className="mt-10 flex-1 gap-y-[6px] items-center">
          <Text className="text-center text-[38px] font-sans-extrabold text-white">
            Gain Financial Clarity
          </Text>
          <Text className="text-center text-xl font-sans-bold text-white">
            Track, analyze and cancel with ease
          </Text>

          <Pressable
            accessibilityRole="button"
            className="h-14 w-[90%] items-center justify-center bg-white active:opacity-80 rounded-full mt-3"
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text className="text-[16px] font-sans-bold text-primary">
              Get Started
            </Text>
          </Pressable>
          <View className="mt-4 flex-row items-center gap-1">
            <Text className="text-sm font-sans-medium text-white">
              Already have an account?
            </Text>
            <Link
              href="/(auth)/sign-in"
              className="text-sm font-sans-bold text-white"
            >
              Sign in
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
