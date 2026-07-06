import { Pressable, Text, TextInput, View } from "react-native";
import { InputKind, INPUT_LIMITS, inputRule, sanitizeInput } from "../input-sanitizers";
import { styles } from "../styles";
import { WorkoutPlan } from "../types";

type FieldProps = {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  multiline?: boolean;
  inputKind?: InputKind;
  maxLength?: number;
  helperText?: string;
  required?: boolean;
};

export function Field({
  label,
  value,
  onChange,
  multiline,
  inputKind = multiline ? "longText" : "shortText",
  maxLength,
  helperText,
  required,
}: FieldProps) {
  const effectiveMaxLength = maxLength ?? INPUT_LIMITS[inputKind];
  const integer = inputKind === "integer";
  const decimal = inputKind === "decimal";
  const date = inputKind === "date";

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.requiredMark}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={String(value ?? "")}
        onChangeText={(text) => onChange(sanitizeInput(text, inputKind, effectiveMaxLength))}
        multiline={multiline}
        maxLength={effectiveMaxLength}
        keyboardType={decimal ? "decimal-pad" : integer || date ? "number-pad" : "default"}
        inputMode={decimal ? "decimal" : integer || date ? "numeric" : "text"}
        autoCorrect={!integer && !decimal && !date}
        autoCapitalize={integer || decimal || date ? "none" : multiline ? "sentences" : "words"}
        spellCheck={!integer && !decimal && !date}
      />
      <Text style={styles.helperText}>
        {helperText ?? inputRule(inputKind)} Massimo {effectiveMaxLength} caratteri.
      </Text>
    </View>
  );
}

type PickerChipsProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  getLabel?: (value: string) => string;
};

export function PickerChips({ label, value, options, onChange, getLabel }: PickerChipsProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={[styles.chip, value === option && styles.activeChip]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.chipText, value === option && styles.activeChipText]}>
              {getLabel ? getLabel(option) : option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

type PlanSelectorProps = {
  plans: WorkoutPlan[];
  selected: string;
  onSelect: (planId: string) => void;
};

export function PlanSelector({ plans, selected, onSelect }: PlanSelectorProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Scheda collegata</Text>
      <View style={styles.chips}>
        {plans.map((plan) => (
          <Pressable
            key={plan.id}
            style={[styles.chip, selected === plan.id && styles.activeChip]}
            onPress={() => onSelect(plan.id)}
          >
            <Text style={[styles.chipText, selected === plan.id && styles.activeChipText]}>{plan.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
