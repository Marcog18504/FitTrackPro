import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { sanitizeInput } from "../input-sanitizers";
import { styles } from "../styles";

type SectionTitleProps = {
  title: string;
  actionLabel: string;
  onAction: () => void;
};

export function SectionTitle({ title, actionLabel, onAction }: SectionTitleProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable style={styles.primaryButton} onPress={onAction}>
        <Text style={styles.primaryButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

type SearchAndFilterProps = {
  query: string;
  setQuery: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  sections?: { title: string; options: string[] }[];
};

export function SearchAndFilter({ query, setQuery, filter, setFilter, sections = [] }: SearchAndFilterProps) {
  const [visible, setVisible] = useState(false);
  const hasFilters = sections.some((section) => section.options.length > 0);
  const activeFilter = filter === "Tutti" ? "Tutti" : filter;

  return (
    <View style={styles.card}>
      <View style={styles.searchRow}>
        <View style={styles.flex}>
          <TextInput
            style={styles.input}
            placeholder="Cerca"
            value={query}
            onChangeText={(text) => setQuery(sanitizeInput(text, "search"))}
            maxLength={60}
            autoCapitalize="none"
          />
        </View>
        {hasFilters ? (
          <Pressable style={styles.secondaryButton} onPress={() => setVisible(true)}>
            <Text style={styles.secondaryButtonText}>Filtra</Text>
          </Pressable>
        ) : null}
      </View>

      {hasFilters && activeFilter !== "Tutti" ? (
        <Text style={styles.muted}>
          Filtro attivo: <Text style={styles.detailLabel}>{activeFilter}</Text>
        </Text>
      ) : null}

      <Modal visible={visible} animationType="fade" onRequestClose={() => setVisible(false)} transparent>
        <View style={styles.overlay}>
          <View style={styles.filterBox}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Filtri</Text>
              <Pressable style={styles.ghostButton} onPress={() => setVisible(false)}>
                <Text style={styles.ghostButtonText}>Chiudi</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.stack}>
              <View style={styles.field}>
                <Text style={styles.label}>Generale</Text>
                <View style={styles.chips}>
                  <Pressable
                    style={[styles.chip, filter === "Tutti" && styles.activeChip]}
                    onPress={() => {
                      setFilter("Tutti");
                      setVisible(false);
                    }}
                  >
                    <Text style={[styles.chipText, filter === "Tutti" && styles.activeChipText]}>Tutti</Text>
                  </Pressable>
                </View>
              </View>

              {sections.map((section) => (
                <View key={section.title} style={styles.field}>
                  <Text style={styles.label}>{section.title}</Text>
                  <View style={styles.chips}>
                    {Array.from(new Set(section.options)).map((option) => (
                      <Pressable
                        key={`${section.title}-${option}`}
                        style={[styles.chip, filter === option && styles.activeChip]}
                        onPress={() => {
                          setFilter(option);
                          setVisible(false);
                        }}
                      >
                        <Text style={[styles.chipText, filter === option && styles.activeChipText]}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type EntityCardProps = {
  title: string;
  subtitle: string;
  meta: string;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
};

export function EntityCard({ title, subtitle, meta, onOpen, onEdit, onDelete, onDuplicate }: EntityCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.muted}>{subtitle}</Text>
        </View>
        <Text style={styles.badge}>{meta}</Text>
      </View>
      <CardActions onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
    </View>
  );
}

type CardActionsProps = {
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
};

export function CardActions({ onOpen, onEdit, onDelete, onDuplicate }: CardActionsProps) {
  return (
    <View style={styles.actions}>
      <Pressable style={styles.secondaryButton} onPress={onOpen}>
        <Text style={styles.secondaryButtonText}>Dettaglio</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onEdit}>
        <Text style={styles.secondaryButtonText}>Modifica</Text>
      </Pressable>
      {onDuplicate && (
        <Pressable style={styles.secondaryButton} onPress={onDuplicate}>
          <Text style={styles.secondaryButtonText}>Duplica</Text>
        </Pressable>
      )}
      <Pressable style={styles.dangerButton} onPress={onDelete}>
        <Text style={styles.dangerButtonText}>Elimina</Text>
      </Pressable>
    </View>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardTop}>
        <Text style={styles.statValue}>{value}</Text>
        {icon ? (
          <View style={styles.statIconBox}>
            <Ionicons name={icon} size={18} color="#123C2D" />
          </View>
        ) : null}
      </View>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}
