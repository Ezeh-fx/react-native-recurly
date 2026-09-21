import { useSubscriptions } from "@/components/subscription-context";
import SubscriptionCard from "@/components/subscriptionCard";
import { styled } from "nativewind";
import React from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const Subscription = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedCardId, setExpandedCardId] = React.useState<string | null>(
    null,
  );
  const { subscriptions } = useSubscriptions();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSubscriptions = subscriptions.filter((subscription) =>
    [
      subscription.name,
      subscription.plan,
      subscription.category,
      subscription.status,
    ].some((value) => value?.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedCardId === item.id}
              onPress={() =>
                setExpandedCardId((currentId) =>
                  currentId === item.id ? null : item.id,
                )
              }
            />
          )}
          ListHeaderComponent={
            <View>
              <Text className="subscription-title">Subscriptions</Text>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search subscriptions"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="while-editing"
                className="subscription-search"
              />
              <Text className="subscription-count">
                {filteredSubscriptions.length}{" "}
                {filteredSubscriptions.length === 1
                  ? "subscription"
                  : "subscriptions"}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text className="home-empty-state">
              No subscriptions match your search
            </Text>
          }
          ItemSeparatorComponent={() => <View className="h-4" />}
          extraData={expandedCardId}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="grow px-5 pb-30 pt-5"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscription;
