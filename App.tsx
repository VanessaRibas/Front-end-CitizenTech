import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { EventoRisco } from "./src/interfaces/evento";
import { listarEventos } from "./src/services/eventoService";

type Perfil = "VISUAL" | "CADEIRANTE";
type Tela = "INICIO" | "PERFIL";

export default function App() {
  const [tela, setTela] = useState<Tela>("INICIO");
  const [perfil, setPerfil] = useState<Perfil>("CADEIRANTE");
  const [destino, setDestino] = useState("");
  const [rotaAtualizada, setRotaAtualizada] = useState(false);

  // Estados de Integração e Resiliência (Backend Offline)
  const [eventos, setEventos] = useState<EventoRisco[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [conectado, setConectado] = useState<boolean>(true);

  // Função para buscar dados da API do Spring Boot
  async function carregarEventosDoBackend() {
    try {
      setCarregando(true);
      const dados = await listarEventos();
      setEventos(dados);
      setConectado(true);
    } catch (error) {
      setConectado(false);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEventosDoBackend();
  }, []);

  function buscarRota() {
    if (destino.trim().length > 0) {
      setRotaAtualizada(true);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#0B0B0E"
        barStyle="light-content"
      />

      {/* BARRA DE STATUS DE CONEXÃO */}
      <View
        style={[
          styles.connectionBar,
          { backgroundColor: conectado ? "#00FF66" : "#FF0055" },
        ]}
      >
        <Text style={styles.connectionText}>
          {conectado
            ? "● Backend Spring Boot: Conectado"
            : "⚠️ Servidor Offline — Modo de Contingência Ativo"}
        </Text>
        <TouchableOpacity onPress={carregarEventosDoBackend}>
          <Text style={styles.retryText}>Reconectar</Text>
        </TouchableOpacity>
      </View>

      {tela === "INICIO" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* CABEÇALHO */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>CitizenTech</Text>
              <Text style={styles.headerSubtitle}>
                Mobilidade inteligente para todos
              </Text>
            </View>

            <TouchableOpacity
              style={styles.avatar}
              onPress={() => setTela("PERFIL")}
            >
              <Text style={styles.avatarText}>V</Text>
            </TouchableOpacity>
          </View>

          {/* BOAS-VINDAS */}
          <View style={styles.welcome}>
            <Text style={styles.welcomeTitle}>
              Olá, Vanessa! 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Vamos encontrar um caminho mais seguro?
            </Text>
          </View>

          {/* BUSCA */}
          <View style={styles.searchCard}>
            <Text style={styles.cardTitle}>Para onde vamos?</Text>

            <View style={styles.locationRow}>
              <View style={styles.locationIndicator}>
                <View style={styles.originDot} />
                <View style={styles.locationLine} />
                <View style={styles.destinationDot} />
              </View>

              <View style={styles.locationInputs}>
                <Text style={styles.locationLabel}>ORIGEM</Text>
                <Text style={styles.locationValue}>
                  Minha localização atual
                </Text>

                <View style={styles.inputDivider} />

                <Text style={styles.locationLabel}>DESTINO</Text>
                <TextInput
                  value={destino}
                  onChangeText={setDestino}
                  placeholder="Digite seu destino (ex: Av. Paulista)"
                  placeholderTextColor="#666677"
                  style={styles.destinationInput}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={buscarRota}
            >
              <Text style={styles.searchButtonText}>
                Calcular Rota Adaptada  →
              </Text>
            </TouchableOpacity>

            {rotaAtualizada && (
              <Text style={styles.searchFeedback}>
                ✓ Rota calculada com base no seu perfil ativo!
              </Text>
            )}
          </View>

          {/* RESUMO */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Visão geral</Text>
            <Text style={styles.liveLabel}>
              {conectado ? "● DADOS DA API" : "● MODO OFFLINE"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {eventos.length < 10 ? `0${eventos.length}` : eventos.length}
              </Text>
              <Text style={styles.summaryLabel}>Eventos</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: "#FF0055" }]}>
                {eventos.filter(e => e.prioridade === "ALTA").length < 10
                  ? `0${eventos.filter(e => e.prioridade === "ALTA").length}`
                  : eventos.filter(e => e.prioridade === "ALTA").length}
              </Text>
              <Text style={styles.summaryLabel}>Alerta alto</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: "#00FF66" }]}>
                {eventos.filter(e => e.prioridade !== "ALTA").length < 10
                  ? `0${eventos.filter(e => e.prioridade !== "ALTA").length}`
                  : eventos.filter(e => e.prioridade !== "ALTA").length}
              </Text>
              <Text style={styles.summaryLabel}>Outros riscos</Text>
            </View>
          </View>

          {/* MAPA INTELIGENTE BASEADO NO PERFIL */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mapa de Rota Dinâmico</Text>
            <View style={styles.profileBadgeTag}>
              <Text style={styles.profileBadgeTagText}>
                {perfil === "CADEIRANTE" ? "♿ Modo Cadeirante" : "🦯 Modo Def. Visual"}
              </Text>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <View style={styles.map}>
              {/* Ruas e Blocos do Mapa */}
              <View style={[styles.mapBlock, { top: 15, left: 15 }]} />
              <View style={[styles.mapBlock, { top: 15, right: 15 }]} />
              <View style={[styles.mapBlock, { bottom: 15, left: 15 }]} />
              <View style={[styles.mapBlock, { bottom: 15, right: 15 }]} />

              <View style={[styles.mapStreet, styles.streetA]} />
              <View style={[styles.mapStreet, styles.streetB]} />
              <View style={[styles.mapStreet, styles.streetC]} />

              {/* ROTA DINÂMICA: Muda de cor e trajeto conforme o perfil salvo no estado */}
              {perfil === "CADEIRANTE" ? (
                <>
                  <View style={styles.routeCadeirantePart1} />
                  <View style={styles.routeCadeirantePart2} />
                </>
              ) : (
                <>
                  <View style={styles.routeVisualPart1} />
                  <View style={styles.routeVisualPart2} />
                </>
              )}

              {/* Ponto de Partida (A) */}
              <View style={styles.mapStart}>
                <Text style={styles.mapPointText}>A</Text>
              </View>

              {/* Ponto de Chegada (B) */}
              <View style={styles.mapEnd}>
                <Text style={styles.mapPointText}>B</Text>
              </View>

              {/* Alerta de Risco no Mapa */}
              <View style={styles.mapRiskBadge}>
                <Text style={{ fontSize: 14 }}>⚠️</Text>
              </View>

              <View style={styles.mapInfoLabel}>
                <Text style={styles.mapInfoLabelText}>
                  {perfil === "CADEIRANTE"
                    ? "✓ Rota otimizada sem escadas/lombadas"
                    : "✓ Rota com piso tátil e alertas sonoros"}
                </Text>
              </View>
            </View>

            <View style={styles.mapFooter}>
              <View style={styles.legend}>
                <View
                  style={[
                    styles.legendIndicator,
                    { backgroundColor: perfil === "CADEIRANTE" ? "#00FF66" : "#00D4FF" },
                  ]}
                />
                <Text style={styles.legendText}>
                  {perfil === "CADEIRANTE"
                    ? "Trajeto seguro para cadeiras de rodas"
                    : "Trajeto assistido para deficiência visual"}
                </Text>
              </View>
            </View>
          </View>

          {/* ALERTA PRINCIPAL */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alerta importante</Text>
            <Text style={styles.seeMore}>Ver todos</Text>
          </View>

          <View style={styles.alertCard}>
            <View style={styles.alertTop}>
              <View style={styles.alertIconBox}>
                <Text style={{ fontSize: 24 }}>🌧️</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>
                  Alagamento identificado
                </Text>
                <Text style={styles.alertAddress}>
                  Avenida Paulista, São Paulo
                </Text>
              </View>

              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>ALTO</Text>
              </View>
            </View>

            <Text style={styles.alertDescription}>
              Foi identificado um ponto de alagamento que pode
              comprometer a passagem de pedestres e cadeirantes.
            </Text>

            <View style={styles.alertInfo}>
              <Text style={styles.alertInfoText}>
                Origem: Sensor simulado
              </Text>
              <Text style={styles.alertInfoText}>
                Confiança: Alta
              </Text>
            </View>

            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setRotaAtualizada(true)}
            >
              <Text style={styles.alertButtonText}>
                {rotaAtualizada
                  ? "Rota alternativa sugerida ✓"
                  : "Ver rota alternativa →"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* EVENTOS DINÂMICOS DA API */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Eventos cadastrados</Text>
            {carregando ? (
              <ActivityIndicator size="small" color="#FF0055" />
            ) : (
              <Text style={styles.eventCount}>{eventos.length} registros</Text>
            )}
          </View>

          {eventos.map((evento) => (
            <View key={evento.id} style={styles.eventCard}>
              <View style={styles.eventIcon}>
                <Text style={{ fontSize: 23 }}>{evento.tipo || "⚠️"}</Text>
              </View>

              <View style={styles.eventContent}>
                <View style={styles.eventTitleRow}>
                  <Text style={styles.eventTitle}>
                    {evento.titulo}
                  </Text>

                  <View
                    style={[
                      styles.eventPriority,
                      { backgroundColor: evento.cor || "#2A121A" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.eventPriorityText,
                        { color: evento.corTexto || "#FF0055" },
                      ]}
                    >
                      {evento.prioridade}
                    </Text>
                  </View>
                </View>

                <Text style={styles.eventDescription}>
                  {evento.descricao}
                </Text>

                <Text style={styles.eventAddress}>
                  📍 {evento.endereco}
                </Text>

                <Text style={styles.eventTime}>
                  Origem: {evento.origem} • Confiança: {evento.confianca}
                </Text>
              </View>
            </View>
          ))}

          <Text style={styles.footer}>
            CitizenTech • Mobilidade para todos
          </Text>
        </ScrollView>
      ) : (
        /* TELA DE PERFIL */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileHeader}>
            <Text style={styles.profileHeaderTitle}>Meu perfil</Text>
            <Text style={styles.profileHeaderSubtitle}>
              Suas informações e preferências de acessibilidade
            </Text>

            <View style={styles.largeAvatar}>
              <Text style={styles.largeAvatarText}>V</Text>
            </View>

            <Text style={styles.profileName}>Vanessa</Text>
            <Text style={styles.profileEmail}>
              Usuária CitizenTech
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>
              Perfil de acessibilidade
            </Text>

            <Text style={styles.profileDescription}>
              Escolha o perfil abaixo. O aplicativo adaptará instantaneamente
              o mapa e as rotas recomendadas para você.
            </Text>

            <TouchableOpacity
              style={[
                styles.accessibilityCard,
                perfil === "VISUAL" && styles.accessibilitySelected,
              ]}
              onPress={() => setPerfil("VISUAL")}
            >
              <Text style={styles.accessibilityEmoji}>🦯</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.accessibilityTitle}>
                  Deficiência visual
                </Text>
                <Text style={styles.accessibilitySubtitle}>
                  Orientação por áudio e travessias sinalizadas.
                </Text>
              </View>
              <Text style={styles.check}>
                {perfil === "VISUAL" ? "●" : "○"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.accessibilityCard,
                perfil === "CADEIRANTE" && styles.accessibilitySelected,
              ]}
              onPress={() => setPerfil("CADEIRANTE")}
            >
              <Text style={styles.accessibilityEmoji}>♿</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.accessibilityTitle}>
                  Mobilidade reduzida
                </Text>
                <Text style={styles.accessibilitySubtitle}>
                  Rampas, calçadas acessíveis e sem escadas.
                </Text>
              </View>
              <Text style={styles.check}>
                {perfil === "CADEIRANTE" ? "●" : "○"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>
              Meus endereços
            </Text>

            <View style={styles.addressCard}>
              <Text style={styles.addressIcon}>🏠</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTitle}>Minha casa</Text>
                <Text style={styles.addressSubtitle}>
                  Endereço cadastrado
                </Text>
              </View>
              <Text style={styles.addressArrow}>›</Text>
            </View>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>
              Sobre o aplicativo
            </Text>

            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>CitizenTech</Text>
              <Text style={styles.aboutText}>
                Plataforma de monitoramento de riscos urbanos e
                mobilidade acessível desenvolvida para a Global Solution.
              </Text>
              <Text style={styles.version}>Versão 1.0 • Protótipo Integrado</Text>
            </View>
          </View>

          <Text style={styles.footer}>
            CitizenTech • Mobilidade para todos
          </Text>
        </ScrollView>
      )}

      {/* MENU INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setTela("INICIO")}
        >
          <Text
            style={[
              styles.tabIcon,
              tela === "INICIO" && styles.activeTab,
            ]}
          >
            ⌂
          </Text>
          <Text
            style={[
              styles.tabText,
              tela === "INICIO" && styles.activeTab,
            ]}
          >
            Início
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setTela("PERFIL")}
        >
          <Text
            style={[
              styles.tabIcon,
              tela === "PERFIL" && styles.activeTab,
            ]}
          >
            ◉
          </Text>
          <Text
            style={[
              styles.tabText,
              tela === "PERFIL" && styles.activeTab,
            ]}
          >
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0E",
  },
  connectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  connectionText: {
    color: "#0B0B0E",
    fontSize: 10,
    fontWeight: "bold",
  },
  retryText: {
    color: "#0B0B0E",
    fontSize: 10,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: "#141419",
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
  },
  logo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: "#888899",
    fontSize: 12,
    marginTop: 5,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 25,
    backgroundColor: "#2A121A",
    borderWidth: 1,
    borderColor: "#FF0055",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 19,
    color: "#FF0055",
    fontWeight: "bold",
  },
  welcome: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
  },
  welcomeTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#888899",
    marginTop: 5,
  },
  searchCard: {
    marginHorizontal: 16,
    backgroundColor: "#141419",
    padding: 17,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
  },
  locationIndicator: {
    width: 20,
    alignItems: "center",
    paddingTop: 6,
  },
  originDot: {
    width: 11,
    height: 11,
    borderRadius: 8,
    backgroundColor: "#00FF66",
  },
  locationLine: {
    width: 2,
    height: 37,
    backgroundColor: "#333344",
  },
  destinationDot: {
    width: 11,
    height: 11,
    borderRadius: 2,
    backgroundColor: "#FF0055",
  },
  locationInputs: {
    flex: 1,
    marginLeft: 10,
  },
  locationLabel: {
    color: "#777788",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  locationValue: {
    fontSize: 13,
    color: "#CCCCDD",
    marginTop: 4,
    marginBottom: 7,
  },
  inputDivider: {
    height: 1,
    backgroundColor: "#22222E",
    marginBottom: 7,
  },
  destinationInput: {
    fontSize: 13,
    color: "#FFFFFF",
    paddingVertical: 4,
  },
  searchButton: {
    backgroundColor: "#FF0055",
    borderRadius: 11,
    padding: 14,
    alignItems: "center",
    marginTop: 15,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  searchFeedback: {
    color: "#00FF66",
    fontSize: 11,
    marginTop: 10,
  },
  sectionHeader: {
    marginHorizontal: 18,
    marginTop: 25,
    marginBottom: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  liveLabel: {
    color: "#00FF66",
    fontSize: 9,
    fontWeight: "bold",
  },
  seeMore: {
    color: "#FF0055",
    fontSize: 12,
    fontWeight: "600",
  },
  profileBadgeTag: {
    backgroundColor: "#1C1C26",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333344",
  },
  profileBadgeTagText: {
    color: "#00FF66",
    fontSize: 10,
    fontWeight: "bold",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#141419",
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22222E",
  },
  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
  },
  summaryLabel: {
    color: "#777788",
    fontSize: 10,
    marginTop: 5,
  },
  mapContainer: {
    marginHorizontal: 16,
    backgroundColor: "#141419",
    borderRadius: 16,
    padding: 9,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  map: {
    height: 220,
    backgroundColor: "#191922",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  mapBlock: {
    position: "absolute",
    width: 80,
    height: 60,
    backgroundColor: "#22222E",
    borderRadius: 8,
  },
  mapStreet: {
    position: "absolute",
    backgroundColor: "#2E2E3E",
  },
  streetA: {
    height: 18,
    width: "120%",
    top: 65,
    left: -15,
    transform: [{ rotate: "22deg" }],
  },
  streetB: {
    height: 18,
    width: "120%",
    top: 140,
    left: -15,
    transform: [{ rotate: "-15deg" }],
  },
  streetC: {
    width: 18,
    height: "120%",
    left: "40%",
    top: -15,
  },
  // Rota Cadeirante (Verde Neon - Caminho plano sem escadas)
  routeCadeirantePart1: {
    position: "absolute",
    height: 6,
    width: 140,
    backgroundColor: "#00FF66",
    top: 110,
    left: 30,
    transform: [{ rotate: "-20deg" }],
    borderRadius: 5,
  },
  routeCadeirantePart2: {
    position: "absolute",
    height: 6,
    width: 100,
    backgroundColor: "#00FF66",
    top: 75,
    left: 150,
    transform: [{ rotate: "25deg" }],
    borderRadius: 5,
  },
  // Rota Deficiente Visual (Ciano - Caminho com piso tátil e alerta sonoro)
  routeVisualPart1: {
    position: "absolute",
    height: 6,
    width: 130,
    backgroundColor: "#00D4FF",
    top: 145,
    left: 40,
    transform: [{ rotate: "12deg" }],
    borderRadius: 5,
  },
  routeVisualPart2: {
    position: "absolute",
    height: 6,
    width: 110,
    backgroundColor: "#00D4FF",
    top: 55,
    left: 130,
    transform: [{ rotate: "-22deg" }],
    borderRadius: 5,
  },
  mapStart: {
    position: "absolute",
    left: 25,
    bottom: 40,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF0055",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  mapEnd: {
    position: "absolute",
    right: 25,
    top: 35,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00FF66",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  mapPointText: {
    color: "#0B0B0E",
    fontWeight: "bold",
    fontSize: 12,
  },
  mapRiskBadge: {
    position: "absolute",
    right: 95,
    bottom: 25,
    backgroundColor: "#2A121A",
    borderRadius: 15,
    padding: 6,
    borderWidth: 1,
    borderColor: "#FF0055",
  },
  mapInfoLabel: {
    position: "absolute",
    left: 10,
    top: 10,
    backgroundColor: "rgba(11, 11, 14, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333344",
  },
  mapInfoLabelText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  mapFooter: {
    padding: 10,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: "#888899",
  },
  alertCard: {
    marginHorizontal: 16,
    backgroundColor: "#141419",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FF005555",
  },
  alertTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertIconBox: {
    width: 45,
    height: 45,
    backgroundColor: "#2A121A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  alertAddress: {
    color: "#888899",
    fontSize: 10,
    marginTop: 5,
  },
  priorityBadge: {
    backgroundColor: "#2A121A",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FF0055",
  },
  priorityText: {
    color: "#FF0055",
    fontSize: 9,
    fontWeight: "bold",
  },
  alertDescription: {
    color: "#AAACC0",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 14,
  },
  alertInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#22222E",
  },
  alertInfoText: {
    color: "#777788",
    fontSize: 10,
  },
  alertButton: {
    backgroundColor: "#FF0055",
    borderRadius: 9,
    padding: 13,
    marginTop: 14,
    alignItems: "center",
  },
  alertButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  eventCount: {
    color: "#888899",
    fontSize: 11,
  },
  eventCard: {
    backgroundColor: "#141419",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 13,
    padding: 13,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  eventIcon: {
    width: 43,
    height: 43,
    borderRadius: 11,
    backgroundColor: "#1C1C26",
    justifyContent: "center",
    alignItems: "center",
  },
  eventContent: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
  },
  eventTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    flex: 1,
  },
  eventPriority: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  eventPriorityText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  eventDescription: {
    color: "#AAACC0",
    fontSize: 11,
    marginTop: 6,
  },
  eventAddress: {
    color: "#888899",
    fontSize: 10,
    marginTop: 7,
  },
  eventTime: {
    color: "#666677",
    fontSize: 9,
    marginTop: 5,
  },
  profileHeader: {
    backgroundColor: "#141419",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
  },
  profileHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  profileHeaderSubtitle: {
    color: "#888899",
    fontSize: 12,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: "#2A121A",
    borderWidth: 2,
    borderColor: "#FF0055",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  largeAvatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF0055",
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 12,
  },
  profileEmail: {
    color: "#888899",
    fontSize: 12,
    marginTop: 4,
  },
  profileSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  profileDescription: {
    color: "#888899",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 13,
  },
  accessibilityCard: {
    backgroundColor: "#141419",
    borderRadius: 13,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#22222E",
  },
  accessibilitySelected: {
    backgroundColor: "#1F141C",
    borderColor: "#FF0055",
  },
  accessibilityEmoji: {
    fontSize: 28,
  },
  accessibilityTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  accessibilitySubtitle: {
    color: "#888899",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  check: {
    color: "#FF0055",
    fontSize: 20,
  },
  addressCard: {
    backgroundColor: "#141419",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  addressIcon: {
    fontSize: 23,
  },
  addressTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  addressSubtitle: {
    color: "#888899",
    fontSize: 11,
    marginTop: 5,
  },
  addressArrow: {
    fontSize: 24,
    color: "#FF0055",
  },
  aboutCard: {
    backgroundColor: "#141419",
    borderRadius: 13,
    padding: 16,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  aboutTitle: {
    color: "#FF0055",
    fontSize: 15,
    fontWeight: "bold",
  },
  aboutText: {
    color: "#AAACC0",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  version: {
    color: "#666677",
    fontSize: 10,
    marginTop: 13,
  },
  footer: {
    textAlign: "center",
    color: "#666677",
    fontSize: 10,
    marginTop: 25,
    marginBottom: 15,
  },
  bottomBar: {
    height: 65,
    backgroundColor: "#141419",
    borderTopWidth: 1,
    borderTopColor: "#22222E",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    color: "#666677",
    fontSize: 22,
  },
  tabText: {
    color: "#666677",
    fontSize: 10,
    marginTop: 3,
  },
  activeTab: {
    color: "#FF0055",
    fontWeight: "bold",
  },
});