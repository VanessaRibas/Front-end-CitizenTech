
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";

type Perfil = "VISUAL" | "CADEIRANTE";
type Tela = "INICIO" | "PERFIL";

const eventos = [
  {
    id: 1,
    titulo: "Alagamento",
    descricao: "Acúmulo de água na Avenida Paulista.",
    endereco: "Avenida Paulista, São Paulo",
    prioridade: "ALTA",
    tipo: "🌧️",
    horario: "Há 5 minutos",
    cor: "#FCE8E5",
    corTexto: "#D9534F",
  },
  {
    id: 2,
    titulo: "Queda de árvore",
    descricao: "Árvore bloqueando parte da calçada.",
    endereco: "Rua Vergueiro, São Paulo",
    prioridade: "MÉDIA",
    tipo: "🌳",
    horario: "Há 20 minutos",
    cor: "#FFF2DB",
    corTexto: "#C58A26",
  },
  {
    id: 3,
    titulo: "Interrupção de serviço",
    descricao: "Interrupção temporária de energia.",
    endereco: "Vila Mariana, São Paulo",
    prioridade: "BAIXA",
    tipo: "⚡",
    horario: "Há 40 minutos",
    cor: "#E8F0FC",
    corTexto: "#3977C5",
  },
];

export default function App() {
  const [tela, setTela] = useState<Tela>("INICIO");
  const [perfil, setPerfil] = useState<Perfil>("CADEIRANTE");
  const [destino, setDestino] = useState("");
  const [rotaAtualizada, setRotaAtualizada] = useState(false);

  function buscarRota() {
    if (destino.trim().length > 0) {
      setRotaAtualizada(true);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#102B46"
        barStyle="light-content"
      />

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
                  Minha localização
                </Text>

                <View style={styles.inputDivider} />

                <Text style={styles.locationLabel}>DESTINO</Text>
                <TextInput
                  value={destino}
                  onChangeText={setDestino}
                  placeholder="Digite seu destino"
                  placeholderTextColor="#91A0AE"
                  style={styles.destinationInput}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={buscarRota}
            >
              <Text style={styles.searchButtonText}>
                Encontrar rota  →
              </Text>
            </TouchableOpacity>

            {rotaAtualizada && (
              <Text style={styles.searchFeedback}>
                ✓ Destino informado! Rota demonstrativa disponível abaixo.
              </Text>
            )}
          </View>

          {/* RESUMO */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Visão geral</Text>
            <Text style={styles.liveLabel}>● DADOS SIMULADOS</Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>03</Text>
              <Text style={styles.summaryLabel}>Eventos</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: "#D9534F" }]}>
                01
              </Text>
              <Text style={styles.summaryLabel}>Alerta alto</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: "#168C70" }]}>
                02
              </Text>
              <Text style={styles.summaryLabel}>Outros riscos</Text>
            </View>
          </View>

          {/* MAPA */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mapa de riscos</Text>
            <Text style={styles.seeMore}>São Paulo</Text>
          </View>

          <View style={styles.mapContainer}>
            <View style={styles.map}>
              {/* QUADRAS */}
              <View style={[styles.mapBlock, { top: 15, left: 15 }]} />
              <View style={[styles.mapBlock, { top: 15, right: 15 }]} />
              <View style={[styles.mapBlock, { bottom: 15, left: 15 }]} />
              <View style={[styles.mapBlock, { bottom: 15, right: 15 }]} />
              <View style={[styles.mapBlock, { top: 115, left: 110 }]} />

              {/* RUAS */}
              <View style={[styles.mapStreet, styles.streetA]} />
              <View style={[styles.mapStreet, styles.streetB]} />
              <View style={[styles.mapStreet, styles.streetC]} />
              <View style={[styles.mapStreet, styles.streetD]} />

              {/* ROTA */}
              <View style={styles.routeOne} />
              <View style={styles.routeTwo} />

              {/* PONTOS */}
              <View style={styles.mapStart}>
                <Text style={styles.mapPointText}>A</Text>
              </View>

              <View style={styles.mapEnd}>
                <Text style={styles.mapPointText}>B</Text>
              </View>

              <View style={styles.mapRisk}>
                <Text style={{ fontSize: 18 }}>⚠</Text>
              </View>

              <View style={styles.mapRiskTwo}>
                <Text style={{ fontSize: 17 }}>🌧</Text>
              </View>

              <View style={styles.mapLabel}>
                <Text style={styles.mapLabelText}>
                  Área de risco
                </Text>
              </View>
            </View>

            <View style={styles.mapFooter}>
              <View style={styles.legend}>
                <View style={styles.legendGreen} />
                <Text style={styles.legendText}>Rota sugerida</Text>
              </View>

              <View style={styles.legend}>
                <View style={styles.legendRed} />
                <Text style={styles.legendText}>Risco urbano</Text>
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

          {/* EVENTOS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Eventos cadastrados</Text>
            <Text style={styles.eventCount}>03 registros</Text>
          </View>

          {eventos.map((evento) => (
            <View key={evento.id} style={styles.eventCard}>
              <View style={styles.eventIcon}>
                <Text style={{ fontSize: 23 }}>{evento.tipo}</Text>
              </View>

              <View style={styles.eventContent}>
                <View style={styles.eventTitleRow}>
                  <Text style={styles.eventTitle}>
                    {evento.titulo}
                  </Text>

                  <View
                    style={[
                      styles.eventPriority,
                      { backgroundColor: evento.cor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.eventPriorityText,
                        { color: evento.corTexto },
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
                  {evento.horario}
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
              Escolha o perfil que será considerado na recomendação
              das suas rotas.
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
                  Endereço ainda não cadastrado
                </Text>
              </View>
              <Text style={styles.addressArrow}>›</Text>
            </View>

            <View style={styles.addressCard}>
              <Text style={styles.addressIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTitle}>Local frequente</Text>
                <Text style={styles.addressSubtitle}>
                  Adicione um local de preferência
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
                mobilidade acessível. Desenvolvida para ajudar
                pessoas a encontrar caminhos mais seguros.
              </Text>
              <Text style={styles.version}>Versão 1.0 • Protótipo</Text>
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
    backgroundColor: "#F3F7FB",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  header: {
    backgroundColor: "#102B46",
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  headerSubtitle: {
    color: "#B9D4E8",
    fontSize: 12,
    marginTop: 5,
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 25,
    backgroundColor: "#D9F2EA",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 19,
    color: "#176B61",
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
    color: "#102B46",
  },

  welcomeSubtitle: {
    fontSize: 13,
    color: "#728397",
    marginTop: 5,
  },

  searchCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 17,
    elevation: 3,
    shadowColor: "#102B46",
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#102B46",
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
    backgroundColor: "#168C70",
  },

  locationLine: {
    width: 2,
    height: 37,
    backgroundColor: "#D1DBE5",
  },

  destinationDot: {
    width: 11,
    height: 11,
    borderRadius: 2,
    backgroundColor: "#3977C5",
  },

  locationInputs: {
    flex: 1,
    marginLeft: 10,
  },

  locationLabel: {
    color: "#94A2AF",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  locationValue: {
    fontSize: 13,
    color: "#314B63",
    marginTop: 4,
    marginBottom: 7,
  },

  inputDivider: {
    height: 1,
    backgroundColor: "#EDF1F5",
    marginBottom: 7,
  },

  destinationInput: {
    fontSize: 13,
    color: "#102B46",
    paddingVertical: 4,
  },

  searchButton: {
    backgroundColor: "#1769AA",
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
    color: "#168C70",
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
    color: "#102B46",
    fontSize: 17,
    fontWeight: "bold",
  },

  liveLabel: {
    color: "#168C70",
    fontSize: 9,
    fontWeight: "bold",
  },

  seeMore: {
    color: "#1769AA",
    fontSize: 12,
    fontWeight: "600",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
    elevation: 2,
  },

  summaryNumber: {
    color: "#1769AA",
    fontSize: 23,
    fontWeight: "bold",
  },

  summaryLabel: {
    color: "#8190A0",
    fontSize: 10,
    marginTop: 5,
  },

  mapContainer: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 9,
    elevation: 2,
  },

  map: {
    height: 220,
    backgroundColor: "#E5EFE8",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },

  mapBlock: {
    position: "absolute",
    width: 75,
    height: 55,
    backgroundColor: "#CFE0D2",
    borderRadius: 8,
  },

  mapStreet: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
  },

  streetA: {
    height: 15,
    width: "120%",
    top: 65,
    left: -15,
    transform: [{ rotate: "24deg" }],
  },

  streetB: {
    height: 15,
    width: "120%",
    top: 145,
    left: -15,
    transform: [{ rotate: "-18deg" }],
  },

  streetC: {
    width: 15,
    height: "120%",
    left: "33%",
    top: -15,
  },

  streetD: {
    width: 15,
    height: "120%",
    right: "27%",
    top: -15,
  },

  routeOne: {
    position: "absolute",
    height: 5,
    width: 135,
    backgroundColor: "#168C70",
    top: 119,
    left: 35,
    transform: [{ rotate: "-25deg" }],
    borderRadius: 5,
  },

  routeTwo: {
    position: "absolute",
    height: 5,
    width: 90,
    backgroundColor: "#168C70",
    top: 85,
    left: 145,
    transform: [{ rotate: "30deg" }],
    borderRadius: 5,
  },

  mapStart: {
    position: "absolute",
    left: 30,
    bottom: 45,
    width: 28,
    height: 28,
    borderRadius: 18,
    backgroundColor: "#1769AA",
    justifyContent: "center",
    alignItems: "center",
  },

  mapEnd: {
    position: "absolute",
    right: 30,
    top: 42,
    width: 28,
    height: 28,
    borderRadius: 18,
    backgroundColor: "#168C70",
    justifyContent: "center",
    alignItems: "center",
  },

  mapPointText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 11,
  },

  mapRisk: {
    position: "absolute",
    right: 105,
    bottom: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 5,
  },

  mapRiskTwo: {
    position: "absolute",
    right: 60,
    bottom: 85,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 5,
  },

  mapLabel: {
    position: "absolute",
    right: 12,
    bottom: 10,
    backgroundColor: "#FFFFFF",
    padding: 5,
    borderRadius: 5,
  },

  mapLabelText: {
    color: "#D9534F",
    fontSize: 9,
    fontWeight: "bold",
  },

  mapFooter: {
    flexDirection: "row",
    gap: 20,
    padding: 10,
  },

  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendGreen: {
    width: 9,
    height: 9,
    borderRadius: 8,
    backgroundColor: "#168C70",
  },

  legendRed: {
    width: 9,
    height: 9,
    borderRadius: 8,
    backgroundColor: "#D9534F",
  },

  legendText: {
    fontSize: 10,
    color: "#728397",
  },

  alertCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F3DDD6",
  },

  alertTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  alertIconBox: {
    width: 45,
    height: 45,
    backgroundColor: "#FFF0EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  alertTitle: {
    color: "#102B46",
    fontSize: 13,
    fontWeight: "bold",
  },

  alertAddress: {
    color: "#8794A1",
    fontSize: 10,
    marginTop: 5,
  },

  priorityBadge: {
    backgroundColor: "#FCE8E5",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
  },

  priorityText: {
    color: "#D9534F",
    fontSize: 9,
    fontWeight: "bold",
  },

  alertDescription: {
    color: "#657789",
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
    borderTopColor: "#EDF1F5",
  },

  alertInfoText: {
    color: "#8493A0",
    fontSize: 10,
  },

  alertButton: {
    backgroundColor: "#102B46",
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
    color: "#8794A1",
    fontSize: 11,
  },

  eventCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 13,
    padding: 13,
    flexDirection: "row",
    gap: 12,
    elevation: 1,
  },

  eventIcon: {
    width: 43,
    height: 43,
    borderRadius: 11,
    backgroundColor: "#F0F5FA",
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
    color: "#102B46",
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
    color: "#657789",
    fontSize: 11,
    marginTop: 6,
  },

  eventAddress: {
    color: "#8794A1",
    fontSize: 10,
    marginTop: 7,
  },

  eventTime: {
    color: "#A0AAB5",
    fontSize: 9,
    marginTop: 5,
  },

  profileHeader: {
    backgroundColor: "#102B46",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: "center",
  },

  profileHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },

  profileHeaderSubtitle: {
    color: "#B9D4E8",
    fontSize: 12,
    alignSelf: "flex-start",
    marginTop: 5,
  },

  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: "#D9F2EA",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  largeAvatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#176B61",
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 12,
  },

  profileEmail: {
    color: "#B9D4E8",
    fontSize: 12,
    marginTop: 4,
  },

  profileSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },

  profileDescription: {
    color: "#728397",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 13,
  },

  accessibilityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#E5ECF2",
  },

  accessibilitySelected: {
    backgroundColor: "#EAF4FC",
    borderColor: "#1769AA",
  },

  accessibilityEmoji: {
    fontSize: 28,
  },

  accessibilityTitle: {
    color: "#102B46",
    fontWeight: "bold",
    fontSize: 13,
  },

  accessibilitySubtitle: {
    color: "#728397",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  check: {
    color: "#1769AA",
    fontSize: 20,
  },

  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  addressIcon: {
    fontSize: 23,
  },

  addressTitle: {
    color: "#102B46",
    fontWeight: "bold",
    fontSize: 13,
  },

  addressSubtitle: {
    color: "#8794A1",
    fontSize: 11,
    marginTop: 5,
  },

  addressArrow: {
    fontSize: 24,
    color: "#1769AA",
  },

  aboutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 16,
  },

  aboutTitle: {
    color: "#1769AA",
    fontSize: 15,
    fontWeight: "bold",
  },

  aboutText: {
    color: "#657789",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },

  version: {
    color: "#A0AAB5",
    fontSize: 10,
    marginTop: 13,
  },

  footer: {
    textAlign: "center",
    color: "#A0AAB5",
    fontSize: 10,
    marginTop: 25,
    marginBottom: 15,
  },

  bottomBar: {
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8EDF2",
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
    color: "#A0AAB5",
    fontSize: 22,
  },

  tabText: {
    color: "#A0AAB5",
    fontSize: 10,
    marginTop: 3,
  },

  activeTab: {
    color: "#1769AA",
    fontWeight: "bold",
  },
});
