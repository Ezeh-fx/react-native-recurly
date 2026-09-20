import ListHeading from "@/components/listHeading";
import SubscriptionCard from "@/components/subscriptionCard";
import UpcomingSubCard from "@/components/upcomingSubCard";
import {
    HOME_BALANCE,
    HOME_SUBSCRIPTIONS,
    UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { posthog } from "@/lib/posthog";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const [expandedCardId, setExpandedCardId] = React.useState<string | null>(
    null,
  );
  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Image source={icons.add} className="home-add-icon" />
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-data">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MMM DD, YYYY")}
                </Text>
              </View>
            </View>

            <View className="mt-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming subscriptions Yet
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedCardId === item.id}
            onPress={() => {
              if (expandedCardId !== item.id) {
                posthog?.capture("subscription_card_expanded");
              }
              setExpandedCardId((currentId) =>
                currentId === item.id ? null : item.id,
              );
            }}
          />
        )}
        extraData={expandedCardId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet</Text>
        }
        contentContainerClassName="pb-20"
      />
    </SafeAreaView>
  );
}
