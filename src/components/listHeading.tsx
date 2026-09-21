import { Pressable, Text, View } from "react-native";

const ListHeading = ({ title, onPress }: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      <Pressable className="list-action" onPress={onPress} disabled={!onPress}>
        <Text className="list-action-text">View All</Text>
      </Pressable>
    </View>
  );
};

export default ListHeading;
