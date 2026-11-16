import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

interface DashboardContactProps {
  userData?: any;
  onLogout: () => void;
}

export function DashboardContactScreen({ userData, onLogout }: DashboardContactProps) {
  const nomeContato = userData?.nome || "Familiar (Rede de Apoio)";
  const nomePcd = userData?.pcdVinculado || "Vanessa";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🤝 Rede de Apoio</Text>
          <Text style={styles.subtitle}>Olá, {nomeContato}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Card do Usuário Acompanhado */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>♿ Acompanhando: {nomePcd}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>● ATENÇÃO</Text>
          </View>
        </View>

        <Text style={styles.infoLine}>📍 Localização: Av. Paulista, 1578 (São Paulo)</Text>
        <Text style={styles.infoLine}>🧭 Rota Ativa: Retorno à Residência (Sem escadas)</Text>
        <Text style={styles.infoLine}>🔋 Bateria: 78% • Último sinal: Agora mesmo</Text>

        <TouchableOpacity
          style={styles.checkinBtn}
          onPress={() => Alert.alert("Check-in", "Solicitação de confirmação enviada para " + nomePcd)}
        >
          <Text style={styles.checkinText}>✅ Solicitar Check-in de Segurança</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sosBtn}
          onPress={() => Alert.alert("🚨 SOCORRO 193", "Defesa Civil e Bombeiros acionados com o GPS de " + nomePcd)}
        >
          <Text style={styles.sosText}>🚒 Acionar Resgate / Bombeiros (193)</Text>
        </TouchableOpacity>
      </View>

      {/* Feed de Notificações */}
      <Text style={styles.sectionTitle}>Alertas Recebidos</Text>
      <View style={styles.alertCard}>
        <Text style={styles.alertTag}>ALERTA AUTOMÁTICO • AGORA</Text>
        <Text style={styles.alertTitle}>Desvio de Rota Ativado</Text>
        <Text style={styles.alertDesc}>
          Alagamento identificado a 300m de {nomePcd}. O sistema recalculou um trajeto seguro.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0B0B0E",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
    marginBottom: 20,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    color: "#888899",
    fontSize: 13,
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: "#1C1C26",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FF0055",
    fontWeight: "bold",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#141419",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#22222E",
    marginBottom: 24,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statusBadge: {
    backgroundColor: "#2A1F12",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  statusText: {
    color: "#FBBF24",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoLine: {
    color: "#CCCCDD",
    fontSize: 13,
    marginBottom: 8,
  },
  checkinBtn: {
    backgroundColor: "#00FF66",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  checkinText: {
    color: "#0B0B0E",
    fontWeight: "bold",
    fontSize: 13,
  },
  sosBtn: {
    backgroundColor: "#FF0055",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  sosText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: "#141419",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF0055",
  },
  alertTag: {
    color: "#FF0055",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
  },
  alertTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  alertDesc: {
    color: "#888899",
    fontSize: 12,
    lineHeight: 18,
  },
});