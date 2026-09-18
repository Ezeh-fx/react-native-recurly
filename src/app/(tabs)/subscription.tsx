import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const subscription = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>subscription</Text>
    </SafeAreaView>
  );
};

export default subscription;
