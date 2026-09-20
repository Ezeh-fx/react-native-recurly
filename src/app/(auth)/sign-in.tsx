import {
  AuthBrand,
  AuthButton,
  AuthField,
  AuthFormError,
  AuthShell,
  PasswordToggle,
} from "@/components/auth";
import { getAuthError, validateEmail, validatePassword } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { useSignIn } from "@clerk/expo";
import { Link, type Href } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setFormError(undefined);
    if (nextErrors.email || nextErrors.password || !signIn) return;

    setIsSubmitting(true);
    try {
      const result = await signIn.password({
        identifier: email.trim(),
        password,
      });
      if (result.error) setFormError(getAuthError(result.error));
      else {
        await signIn.finalize();
        posthog?.capture("sign_in_completed");
      }
    } catch (error) {
      setFormError(getAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <AuthBrand />
      <View className="items-center">
        <Text className="auth-title">Welcome back</Text>
        <Text className="auth-subtitle">
          Sign in to continue managing your subscriptions
        </Text>
      </View>

      <View className="auth-card">
        <View className="auth-form">
          <AuthField
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="Enter your email"
            textContentType="emailAddress"
            value={email}
          />
          <AuthField
            autoCapitalize="none"
            autoComplete="password"
            error={errors.password}
            label="Password"
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            textContentType="password"
            trailing={
              <PasswordToggle
                onPress={() => setShowPassword((visible) => !visible)}
                visible={showPassword}
              />
            }
            value={password}
          />
          <Link
            className="auth-link self-end"
            href={"/(auth)/forgot-password" as Href}
          >
            Forgot password?
          </Link>
          <AuthFormError message={formError} />
          <AuthButton
            loading={isSubmitting}
            onPress={handleSubmit}
            title="Sign in"
          />
        </View>
        <View className="auth-link-row">
          <Text className="auth-link-copy">New to Recurly?</Text>
          <Link className="auth-link" href="/(auth)/sign-up">
            Create an account
          </Link>
        </View>
      </View>
    </AuthShell>
  );
}
