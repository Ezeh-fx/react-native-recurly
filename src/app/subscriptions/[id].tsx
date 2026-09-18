import { View, Text } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router';

const SubscriptionDetailed = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>SubscriptionDetailed</Text>
      <Text>{id}</Text>

      <Link href="/">Go Back</Link>
    </View>
  )
}

export default SubscriptionDetailed