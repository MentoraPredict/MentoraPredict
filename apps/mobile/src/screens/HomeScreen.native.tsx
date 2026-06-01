import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "../../../ui/src/components/atoms/Button";

export const HomeScreen: React.FC = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Home (Mobile)</Text>
      {/* Example: for native you may prefer your own Button, but reuse tokens */}
      <TouchableOpacity onPress={() => {}}>
        <Text>Touchable example</Text>
      </TouchableOpacity>
      <Button onClick={() => {}}>Shared Button (web fallback)</Button>
    </View>
  );
};

export default HomeScreen;
