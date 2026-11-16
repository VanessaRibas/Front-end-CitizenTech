import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

interface DashboardAdminProps {
  userData?: any;
  onLogout: () => void;
}

export function DashboardAdminScreen({ userData, onLogout }: DashboardAdminProps) {
  const [sosAtivos, setSosAtivos] = useState([
    { id: 1, nome: "Lucas Almeida", tipo: "Cadeirante", local: "Av. Paulista, 1578", despachado: false },
    { id: 2, nome: "Beatriz Souza", tipo: "Def. Visual", local: "Rua Augusta, 900", despachado: false },
  ]);

  const [ocorrencias, setOcorrencias] = useState([
    { id: 101, titulo: "Rampa obstruída por galhos", local: "Rua Augusta x Oscar Freire", confianca: 40, validado: false },
    { id: 102, titulo: "Chuva forte e granizo", local: "Bela Vista", confianca: 75, validado: false },
  ]);

  function despacharViatura(id: number) {
    setSosAtivos(sosAtivos.map((item) => (item.id === id ? { ...item, despachado: true } : item)));
    Alert.alert("🚒 Despachado", "Viatura adaptada enviada para o resgate!");
  }

  function confirmarOcorrencia(id: number) {
    setOcorrencias(
      ocorrencias.map((oc) => (oc.id === id ? { ...oc, confianca: 100, validado: true } : oc))
    );
    Alert.alert("✅ Validado", "Ocorrência confirmada! Nível de confiança elevado para 100%.");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🛡️ CCO Defesa Civil</Text>
          <Text style={styles.subtitle}>
            Agente {userData?.nome || "Operacional"} • {userData?.orgao || "Defesa Civil"}
          </Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Chamados SOS */}
      <Text style={styles.sectionTitle}>🚨 Chamados Prioritários (SOS PCD)</Text>
      {sosAtivos.map((sos) => (
        <View key={sos.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{sos.nome}</Text>
            <Text style={styles.badgeRed}>{sos.tipo}</Text>
          </View>
          <Text style={styles.infoText}>📍 {sos.local}</Text>
          <TouchableOpacity
            style={[styles.actionBtn, sos.despachado && styles.btnDone]}
            disabled={sos.despachado}
            onPress={() => despacharViatura(sos.id)}
          >
            <Text style={styles.actionBtnText}>
              {sos.despachado ? "✅ Viatura a Caminho" : "🚒 Despachar Viatura Adaptada"}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Validação Comunitária */}
      <Text style={styles.sectionTitle}>📋 Validação de Ocorrências Comunitárias</Text>
      {ocorrencias.map((oc) => (
        <View key={oc.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{oc.titulo}</Text>
            <Text style={styles.badgeCyan}>Confiança: {oc.confianca}%</Text>
          </View>
          <Text style={styles.infoText}>📍 {oc.local}</Text>
          {!oc.validado ? (
            <TouchableOpacity style={styles.approveBtn} onPress={() => confirmarOcorrencia(oc.id)}>
              <Text style={styles.approveBtnText}>✅ Confirmar (Elevar para 100%)</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.confirmedText}>✔ Publicado como Alerta Oficial</Text>
          )}
        </View>
      ))}
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
    fontSize: 12,
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
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#141419",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#22222E",
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  badgeRed: {
    backgroundColor: "#2A121A",
    color: "#FF0055",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeCyan: {
    backgroundColor: "#12242A",
    color: "#00D4FF",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  infoText: {
    color: "#888899",
    fontSize: 12,
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: "#FF0055",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDone: {
    backgroundColor: "#1C1C26",
    borderWidth: 1,
    borderColor: "#00FF66",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  approveBtn: {
    backgroundColor: "#00FF66",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  approveBtnText: {
    color: "#0B0B0E",
    fontWeight: "bold",
    fontSize: 12,
  },
  confirmedText: {
    color: "#00FF66",
    fontSize: 12,
    fontWeight: "bold",
  },
});