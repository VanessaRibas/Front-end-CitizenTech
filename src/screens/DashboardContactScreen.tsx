import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import Svg, { Path, Circle, Line, Rect } from "react-native-svg";

interface DashboardContactProps {
  userData?: any;
  onLogout: () => void;
}

type AbaContato = "MONITORAR" | "ALERTAS" | "PERFIL";

export function DashboardContactScreen({ userData, onLogout }: DashboardContactProps) {
  const [aba, setAba] = useState<AbaContato>("MONITORAR");
  const [alertaSonoroCritico, setAlertaSonoroCritico] = useState(true);

  const nomeContato = userData?.nome || "Mariana (Rede de Apoio)";
  const nomePcd = userData?.pcdVinculado || "Vanessa";

  const [historicoAlertas, setHistoricoAlertas] = useState([
    {
      id: 1,
      tipo: "URGENTE",
      titulo: "Desvio Proativo de Rota Ativado",
      desc: `Alagamento detectado a 300m de ${nomePcd}. O sistema recalculou uma rota segura sem degraus.`,
      hora: "Agora mesmo",
    },
    {
      id: 2,
      tipo: "ATENCAO",
      titulo: "Alerta Climático na Região",
      desc: "Chuva forte prevista para a região da Av. Paulista nos próximos 15 minutos.",
      hora: "Há 12 min",
    },
    {
      id: 3,
      tipo: "SEGURO",
      titulo: "Check-in Confirmado",
      desc: `${nomePcd} respondeu ao aviso preventivo e informou que está em local seguro.`,
      hora: "Há 35 min",
    },
  ]);

  function solicitarCheckIn() {
    const novoAviso = {
      id: Date.now(),
      tipo: "ATENCAO",
      titulo: "Solicitação de Check-in Enviada",
      desc: `Aguardando confirmação de ${nomePcd} (tempo limite: 3 minutos).`,
      hora: "Agora",
    };
    setHistoricoAlertas([novoAviso, ...historicoAlertas]);
    Alert.alert("✅ Check-in Solicitado", `O celular de ${nomePcd} recebeu um alerta vibratório/sonoro.`);
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🤝 Rede de Apoio</Text>
          <Text style={styles.subtitle}>Monitorando: {nomePcd}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>● ATENÇÃO</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ABA 1: MONITORAMENTO E MAPA */}
        {aba === "MONITORAR" && (
          <>
            {/* Mapa Vetorial de Aproximação */}
            <View style={styles.mapCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>📍 Localização em Tempo Real</Text>
                <Text style={styles.distanceTag}>1,4 km de você</Text>
              </View>

              <View style={styles.mapBox}>
                <Svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
                  <Rect x="0" y="0" width="400" height="180" fill="#13131A" />
                  <Rect x="25" y="20" width="100" height="55" rx="8" fill="#1C1C26" />
                  <Rect x="150" y="20" width="100" height="55" rx="8" fill="#1C1C26" />
                  <Rect x="275" y="20" width="100" height="55" rx="8" fill="#1C1C26" />
                  <Rect x="25" y="105" width="100" height="55" rx="8" fill="#1C1C26" />
                  <Rect x="150" y="105" width="100" height="55" rx="8" fill="#1C1C26" />
                  <Rect x="275" y="105" width="100" height="55" rx="8" fill="#1C1C26" />

                  <Line x1="0" y1="90" x2="400" y2="90" stroke="#252533" strokeWidth="14" />
                  <Line x1="138" y1="0" x2="138" y2="180" stroke="#252533" strokeWidth="12" />
                  <Line x1="262" y1="0" x2="262" y2="180" stroke="#252533" strokeWidth="12" />

                  {/* Linha ligando o Contato de Apoio ao PCD */}
                  <Path
                    d="M 320 135 L 262 135 L 262 90 L 138 90 L 138 50 L 85 50"
                    stroke="#00FF66"
                    strokeWidth="3.5"
                    strokeDasharray="6,4"
                    fill="none"
                  />
                  <Circle cx="200" cy="90" r="20" fill="rgba(255, 0, 85, 0.2)" stroke="#FF0055" strokeWidth="1.5" />
                </Svg>

                <View style={[styles.pin, { left: "21%", top: "28%", backgroundColor: "#00D4FF" }]}>
                  <Text style={styles.pinText}>♿</Text>
                </View>
                <View style={[styles.pin, { left: "80%", top: "75%", backgroundColor: "#00FF66" }]}>
                  <Text style={styles.pinText}>🤝</Text>
                </View>
              </View>
            </View>

            {/* Ficha de Telemetria do Usuário */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Status do Dispositivo ({nomePcd})</Text>
              <Text style={styles.infoLine}>🧭 Rota Ativa: Retorno à Residência (Sem degraus)</Text>
              <Text style={styles.infoLine}>🔋 Bateria: 78% • Sinal GPS: Forte</Text>
              <Text style={styles.infoLine}>🕒 Último Check-in: Há 2 minutos</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.halfBtn, { backgroundColor: "#00D4FF" }]}
                  onPress={() => Alert.alert("📞 Chamada", `Ligando para ${nomePcd}...`)}
                >
                  <Text style={styles.halfBtnDarkText}>📞 Ligar Agora</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.halfBtn, { backgroundColor: "#00FF66" }]}
                  onPress={solicitarCheckIn}
                >
                  <Text style={styles.halfBtnDarkText}>✅ Pedir Check-in</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.sosBtn}
                onPress={() =>
                  Alert.alert(
                    "🚨 RESGATE ACIONADO",
                    `Defesa Civil e Bombeiros (193) receberam as coordenadas exatas e a ficha de acessibilidade de ${nomePcd}!`
                  )
                }
              >
                <Text style={styles.sosText}>🚒 Acionar Resgate / Bombeiros (193)</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ABA 2: HISTÓRICO DE ALERTAS */}
        {aba === "ALERTAS" && (
          <>
            <Text style={styles.sectionTitle}>🔔 Histórico da Rede de Apoio ({historicoAlertas.length})</Text>
            {historicoAlertas.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.alertCard,
                  item.tipo === "URGENTE" && { borderLeftColor: "#FF0055" },
                  item.tipo === "ATENCAO" && { borderLeftColor: "#F59E0B" },
                  item.tipo === "SEGURO" && { borderLeftColor: "#00FF66" },
                ]}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.alertTag}>{item.tipo}</Text>
                  <Text style={styles.alertTime}>{item.hora}</Text>
                </View>
                <Text style={styles.alertTitle}>{item.titulo}</Text>
                <Text style={styles.alertDesc}>{item.desc}</Text>
              </View>
            ))}
          </>
        )}

        {/* ABA 3: PERFIL DO CONTATO */}
        {aba === "PERFIL" && (
          <View style={styles.card}>
            <View style={styles.profileCenter}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>{nomeContato.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.profileName}>{nomeContato}</Text>
              <Text style={styles.profileSub}>Contato de Emergência Prioritário</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLine}>♿ Usuário Vinculado: {nomePcd}</Text>
              <Text style={styles.infoLine}>📧 E-mail: {userData?.email || "apoio@urbanrisk.com"}</Text>
              <Text style={styles.infoLine}>📱 Telefone: {userData?.telefone || "(11) 99999-8888"}</Text>
            </View>

            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setAlertaSonoroCritico(!alertaSonoroCritico)}
            >
              <Text style={styles.toggleBtnText}>
                {alertaSonoroCritico
                  ? "🔊 Alerta Sonoro Crítico: ATIVADO"
                  : "🔇 Alerta Sonoro Crítico: DESATIVADO"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutFullBtn} onPress={onLogout}>
              <Text style={styles.logoutFullText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MENU INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("MONITORAR")}>
          <Text style={[styles.tabIcon, aba === "MONITORAR" && styles.tabActive]}>📍</Text>
          <Text style={[styles.tabText, aba === "MONITORAR" && styles.tabActive]}>Monitorar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("ALERTAS")}>
          <Text style={[styles.tabIcon, aba === "ALERTAS" && styles.tabActive]}>🔔</Text>
          <Text style={[styles.tabText, aba === "ALERTAS" && styles.tabActive]}>Alertas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("PERFIL")}>
          <Text style={[styles.tabIcon, aba === "PERFIL" && styles.tabActive]}>👤</Text>
          <Text style={[styles.tabText, aba === "PERFIL" && styles.tabActive]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0E" },
  header: {
    backgroundColor: "#141419",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
  },
  logo: { fontSize: 21, fontWeight: "bold", color: "#FFFFFF" },
  subtitle: { color: "#888899", fontSize: 12, marginTop: 4 },
  statusBadge: {
    backgroundColor: "#2A1F12",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  statusText: { color: "#FBBF24", fontSize: 10, fontWeight: "bold" },
  scrollContent: { padding: 16, paddingBottom: 24 },
  mapCard: {
    backgroundColor: "#141419",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#22222E",
    marginBottom: 16,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#FFFFFF" },
  distanceTag: { color: "#00FF66", fontSize: 11, fontWeight: "bold" },
  mapBox: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#252533",
  },
  pin: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  pinText: { fontSize: 13 },
  card: {
    backgroundColor: "#141419",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#22222E",
    marginBottom: 16,
  },
  infoLine: { color: "#CCCCDD", fontSize: 13, marginBottom: 8 },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  halfBtn: { flex: 1, padding: 13, borderRadius: 10, alignItems: "center" },
  halfBtnDarkText: { color: "#0B0B0E", fontWeight: "bold", fontSize: 12 },
  sosBtn: {
    backgroundColor: "#FF0055",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  sosText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  sectionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  alertCard: {
    backgroundColor: "#141419",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#00D4FF",
    marginBottom: 10,
  },
  alertTag: { color: "#00D4FF", fontSize: 10, fontWeight: "bold" },
  alertTime: { color: "#666677", fontSize: 10 },
  alertTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  alertDesc: { color: "#888899", fontSize: 12, lineHeight: 18 },
  profileCenter: { alignItems: "center", marginBottom: 16 },
  contactAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#122A1A",
    borderWidth: 2,
    borderColor: "#00FF66",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  contactAvatarText: { color: "#00FF66", fontSize: 28, fontWeight: "bold" },
  profileName: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  profileSub: { color: "#888899", fontSize: 12, marginTop: 4 },
  infoBox: { backgroundColor: "#1C1C26", padding: 14, borderRadius: 12, marginBottom: 14 },
  toggleBtn: {
    backgroundColor: "#1C1C26",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00FF66",
    marginBottom: 10,
  },
  toggleBtnText: { color: "#00FF66", fontWeight: "bold", fontSize: 12 },
  logoutFullBtn: {
    backgroundColor: "#2A121A",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF0055",
  },
  logoutFullText: { color: "#FF0055", fontWeight: "bold", fontSize: 13 },
  bottomBar: {
    height: 64,
    backgroundColor: "#141419",
    borderTopWidth: 1,
    borderTopColor: "#22222E",
    flexDirection: "row",
  },
  tabBtn: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabIcon: { fontSize: 18, color: "#666677" },
  tabText: { fontSize: 10, color: "#666677", marginTop: 3 },
  tabActive: { color: "#00FF66", fontWeight: "bold" },
});