import { styled } from "nativewind";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthBrand() {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">R</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Recurly</Text>
          <Text className="auth-wordmark-sub">Smart billing</Text>
        </View>
      </View>
    </View>
  );
}

type AuthFieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  error?: string;
  trailing?: React.ReactNode;
};

export function AuthField({
  label,
  error,
  trailing,
  ...props
}: AuthFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View className="relative justify-center">
        <TextInput
          {...props}
          className={`auth-input ${error ? "auth-input-error" : ""} ${trailing ? "pr-14" : ""} pl-3`}
          placeholderTextColor="rgba(0, 0, 0, 0.42)"
          textAlignVertical="center"
        />
        {trailing}
      </View>
      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
}

export function AuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = loading || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`auth-button ${isDisabled ? "auth-button-disabled" : ""}`}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#081126" />
      ) : (
        <Text className="auth-button-text">{title}</Text>
      )}
    </Pressable>
  );
}

export function AuthFormError({ message }: { message?: string }) {
  return message ? <Text className="auth-error mt-3">{message}</Text> : null;
}

export function PasswordToggle({
  visible,
  onPress,
}: {
  visible: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={visible ? "Hide password" : "Show password"}
      accessibilityRole="button"
      className="absolute right-4"
      hitSlop={8}
      onPress={onPress}
    >
      <Text className="auth-secondary-button-text">
        {visible ? "Hide" : "Show"}
      </Text>
    </Pressable>
  );
}
