import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { ReactNode } from "react";
import { styles } from "../../../styles";

type DetailShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function DetailShell({ title, onClose, children }: DetailShellProps) {
  return (
    <Modal visible animationType="fade" onRequestClose={onClose} transparent>
      <View style={styles.overlay}>
        <View style={styles.detailBox}>
          <ScrollView contentContainerStyle={styles.stack}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
          </ScrollView>
          <Pressable style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>Ok</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
