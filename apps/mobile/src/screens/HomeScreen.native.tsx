import React from "react";
import { View, Text } from "react-native";
import { Button } from "../components/atoms/Button";

export const HomeScreen: React.FC = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Home (Mobile)</Text>
      {/* Example: for native you may prefer your own Button, but reuse tokens */}
      <Button onPress={() => {}}>Shared Button</Button>
    </View>
  );
};

export default HomeScreen;
