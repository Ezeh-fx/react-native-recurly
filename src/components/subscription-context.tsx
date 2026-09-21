import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { createContext, useContext, useState } from "react";

type SubscriptionContextValue = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  function addSubscription(subscription: Subscription) {
    setSubscriptions((currentSubscriptions) => [
      subscription,
      ...currentSubscriptions,
    ]);
  }

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptions must be used within SubscriptionProvider",
    );
  }
  return context;
}
