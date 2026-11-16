import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { UserRole } from "./LoginScreen";

interface SelectRoleScreenProps {
  onSelectRole: (role: UserRole) => void;
  onBackToLogin: () => void;
}

export function SelectRoleScreen({ onSelectRole, onBackToLogin }: SelectRoleScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Criar Nova Conta</Text>
        <Text style={styles.subtitle}>Selecione como deseja se cadastrar no CitizenTech:</Text>

        {/* Card 1: PCD */}
        <TouchableOpacity style={styles.card} onPress={() => onSelectRole("PCD")}>
          <Text style={styles.icon}>♿</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Usuário PCD</Text>
            <Text style={styles.cardDesc}>
              Cadastre sua deficiência, residência e locais seguros de apoio para rotas adaptadas.
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Card 2: Rede de Apoio */}
        <TouchableOpacity style={styles.card} onPress={() => onSelectRole("CONTATO")}>
          <Text style={styles.icon}>🤝</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Rede de Apoio</Text>
            <Text style={styles.cardDesc}>
              Para familiares e amigos. Receba alertas e acompanhe a segurança do usuário vinculado.
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Card 3: Agente Público */}
        <TouchableOpacity style={styles.card} onPress={() => onSelectRole("ADMIN")}>
          <Text style={styles.icon}>🛡️</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Agente / Defesa Civil</Text>
            <Text style={styles.cardDesc}>
              Para órgãos públicos e bombeiros. Gerencie chamados SOS e valide alertas da região.
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Botão Voltar */}
        <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
          <Text style={styles.backButtonText}>← Já tem uma conta? Voltar para o Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0B0B0E",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  wrapper: {
    width: "100%",
    maxWidth: 480,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#888899",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#141419",
    borderWidth: 1,
    borderColor: "#22222E",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  icon: {
    fontSize: 30,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: "#888899",
    lineHeight: 17,
  },
  arrow: {
    color: "#FF0055",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 16,
    backgroundColor: "#1C1C26",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2E2E3E",
  },
  backButtonText: {
    color: "#CCCCDD",
    fontSize: 13,
    fontWeight: "600",
  },
});