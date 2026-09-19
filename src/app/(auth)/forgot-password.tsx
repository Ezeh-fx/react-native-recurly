import {
  AuthBrand,
  AuthButton,
  AuthField,
  AuthFormError,
  AuthShell,
} from "@/components/auth";
import {
  getAuthError,
  validateCode,
  validateEmail,
  validatePassword,
} from "@/lib/auth";
import { useSignIn } from "@clerk/expo";
import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  async function requestCode() {
    const emailError = validateEmail(email);
    setErrors({ email: emailError });
    setFormError(undefined);
    if (emailError) return;
    setIsSubmitting(true);
    try {
      const created = await signIn.create({ identifier: email.trim() });
      if (created.error) {
        setFormError(getAuthError(created.error));
        return;
      }
      const result = await signIn.resetPasswordEmailCode.sendCode();
      if (result.error) setFormError(getAuthError(result.error));
      else setIsCodeSent(true);
    } catch (error) {
      setFormError(getAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resetPassword() {
    const nextErrors = {
      code: validateCode(code),
      password: validatePassword(password),
      confirmation:
        password !== confirmation ? "Passwords do not match" : undefined,
    };
    setErrors(nextErrors);
    setFormError(undefined);
    if (Object.values(nextErrors).some(Boolean)) return;
    setIsSubmitting(true);
    try {
      const verification = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });
      if (verification.error) {
        setFormError(getAuthError(verification.error));
        return;
      }
      const result = await signIn.resetPasswordEmailCode.submitPassword({
        password,
      });
      if (result.error) setFormError(getAuthError(result.error));
      else await signIn.finalize();
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
        <Text className="auth-title">Reset your password</Text>
        <Text className="auth-subtitle">
          {isCodeSent
            ? "Choose a new password for your account"
            : "We will send a secure reset code to your email"}
        </Text>
      </View>
      <View className="auth-card">
        <View className="auth-form">
          {!isCodeSent ? (
            <AuthField
              autoCapitalize="none"
              error={errors.email}
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="Enter your email"
              value={email}
            />
          ) : (
            <>
              <AuthField
                autoCapitalize="none"
                error={errors.code}
                keyboardType="number-pad"
                label="Reset code"
                maxLength={6}
                onChangeText={setCode}
                placeholder="000000"
                value={code}
              />
              <AuthField
                autoCapitalize="none"
                error={errors.password}
                label="New password"
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry
                value={password}
              />
              <AuthField
                autoCapitalize="none"
                error={errors.confirmation}
                label="Confirm password"
                onChangeText={setConfirmation}
                placeholder="Re-enter your password"
                secureTextEntry
                value={confirmation}
              />
            </>
          )}
          <AuthFormError message={formError} />
          <AuthButton
            loading={isSubmitting}
            onPress={isCodeSent ? resetPassword : requestCode}
            title={isCodeSent ? "Update password" : "Send reset code"}
          />
        </View>
        <View className="auth-link-row">
          <Link className="auth-link" href="/(auth)/sign-in">
            Back to sign in
          </Link>
        </View>
      </View>
    </AuthShell>
  );
}
