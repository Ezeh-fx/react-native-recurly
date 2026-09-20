import {
    AuthBrand,
    AuthButton,
    AuthField,
    AuthFormError,
    AuthShell,
    PasswordToggle,
} from "@/components/auth";
import {
    getAuthError,
    validateCode,
    validateConfirmation,
    validateEmail,
    validatePassword,
} from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { useClerk, useSignUp } from "@clerk/expo";
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

type SignUpStep = "account" | "profile" | "verification";

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<SignUpStep>("account");
  const [profileImageUri, setProfileImageUri] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  async function handleAccountContinue() {
    const nextErrors = {
      firstName: firstName.trim() ? undefined : "Enter your name",
      email: validateEmail(email),
      password: validatePassword(password),
      confirmation: validateConfirmation(password, confirmation),
    };
    setErrors(nextErrors);
    setFormError(undefined);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const result = await signUp.password({
        firstName: firstName.trim(),
        emailAddress: email.trim(),
        password,
      });
      if (result.error) {
        setFormError(getAuthError(result.error));
        return;
      }
      const verification = await signUp.verifications.sendEmailCode();
      if (verification.error) setFormError(getAuthError(verification.error));
      else setStep("profile");
    } catch (error) {
      setFormError(getAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePickImage() {
    setFormError(undefined);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFormError("Allow photo access to choose a profile image");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setProfileImageUri(result.assets[0].uri);
  }

  function handleProfileContinue() {
    setFormError(undefined);
    setStep("verification");
  }

  async function handleVerify() {
    const codeError = validateCode(code);
    setErrors({ code: codeError });
    setFormError(undefined);
    if (codeError) return;

    setIsSubmitting(true);
    try {
      const result = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });
      if (result.error) {
        setFormError(getAuthError(result.error));
        return;
      }
      const finalized = await signUp.finalize();
      if (finalized.error) {
        setFormError(getAuthError(finalized.error));
        return;
      }
      posthog?.capture("account_registered");

      if (profileImageUri) {
        const user = clerk.session?.user ?? clerk.user;
        if (!user) {
          throw new Error(
            "Your account was created, but the profile image could not be uploaded.",
          );
        }
        await user.setProfileImage({ file: profileImageUri });
      }
    } catch (error) {
      setFormError(getAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (isResending) return;

    setFormError(undefined);
    setIsResending(true);
    try {
      const result = await signUp.verifications.sendEmailCode();
      if (result.error) setFormError(getAuthError(result.error));
    } catch (error) {
      setFormError(getAuthError(error));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell>
      <AuthBrand />
      <View className="items-center">
        <Text className="auth-title">Create your account</Text>
        <Text className="auth-subtitle">
          Keep every subscription and renewal in one calm place
        </Text>
      </View>

      <View className="auth-card">
        {step === "verification" ? (
          <View className="auth-form">
            <Text className="text-center text-base font-sans-semibold text-primary">
              Check your inbox
            </Text>
            <Text className="auth-helper text-center">
              Enter the 6-digit code we sent to {email.trim()}.
            </Text>
            <AuthField
              autoCapitalize="none"
              error={errors.code}
              keyboardType="number-pad"
              label="Verification code"
              maxLength={6}
              onChangeText={setCode}
              placeholder="000000"
              value={code}
            />
            <AuthFormError message={formError} />
            <AuthButton
              loading={isSubmitting}
              onPress={handleVerify}
              title="Verify email"
            />
            <Pressable
              accessibilityState={{ busy: isResending, disabled: isResending }}
              className="items-center py-2"
              disabled={isResending}
              onPress={handleResend}
            >
              <Text className="auth-link">
                {isResending ? "Sending..." : "Resend code"}
              </Text>
            </Pressable>
            <Pressable
              className="items-center py-2"
              onPress={() => setStep("profile")}
            >
              <Text className="auth-helper">Back to profile</Text>
            </Pressable>
          </View>
        ) : step === "profile" ? (
          <View className="auth-form items-center">
            <Text className="text-center text-base font-sans-semibold text-primary">
              Add a profile photo
            </Text>
            <Text className="auth-helper text-center">
              Choose an image so your account feels like yours.
            </Text>
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                className="size-28 rounded-full"
              />
            ) : (
              <View className="size-28 items-center justify-center rounded-full bg-muted">
                <Text className="text-3xl font-sans-bold text-accent">
                  {firstName.trim().charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              className="auth-secondary-button w-full items-center"
              onPress={handlePickImage}
            >
              <Text className="auth-secondary-button-text">
                {profileImageUri ? "Change photo" : "Choose photo"}
              </Text>
            </Pressable>
            <AuthFormError message={formError} />
            <AuthButton onPress={handleProfileContinue} title="Next" />
            <Pressable
              className="items-center py-2"
              onPress={() => setStep("verification")}
            >
              <Text className="auth-helper">Skip for now</Text>
            </Pressable>
          </View>
        ) : (
          <View className="auth-form">
            <AuthField
              autoCapitalize="words"
              autoComplete="name"
              error={errors.firstName}
              label="Name"
              onChangeText={setFirstName}
              placeholder="Enter your name"
              textContentType="name"
              value={firstName}
            />
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
              autoComplete="new-password"
              error={errors.password}
              label="Password"
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              trailing={
                <PasswordToggle
                  onPress={() => setShowPassword((visible) => !visible)}
                  visible={showPassword}
                />
              }
              value={password}
            />
            <AuthField
              autoCapitalize="none"
              error={errors.confirmation}
              label="Confirm password"
              onChangeText={setConfirmation}
              placeholder="Re-enter your password"
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              value={confirmation}
            />
            <AuthFormError message={formError} />
            <AuthButton
              loading={isSubmitting}
              onPress={handleAccountContinue}
              title="Next"
            />
          </View>
        )}
        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link className="auth-link" href="/(auth)/sign-in">
            Sign in
          </Link>
        </View>
      </View>
    </AuthShell>
  );
}
