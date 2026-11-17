import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { UserRole } from "./LoginScreen";
import { criarUsuario } from "../services/usuarioService"; // Ajuste o caminho se necessário

interface RegisterScreenProps {
  role: UserRole;
  onCompleteRegister: (role: UserRole, userData: any) => void;
  onBack: () => void;
}

export function RegisterScreen({ role, onCompleteRegister, onBack }: RegisterScreenProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Campos PCD
  const [deficiencia, setDeficiencia] = useState<"CADEIRANTE" | "VISUAL">("CADEIRANTE");
  const [enderecoCasa, setEnderecoCasa] = useState("");
  const [novoLocalNome, setNovoLocalNome] = useState("");
  const [novoLocalEnd, setNovoLocalEnd] = useState("");
  const [locaisSeguros, setLocaisSeguros] = useState<{ nome: string; endereco: string }[]>([]);

  // Campos Contato
  const [pcdVinculado, setPcdVinculado] = useState("");

  // Campos Admin
  const [matricula, setMatricula] = useState("");
  const [orgao, setOrgao] = useState("Defesa Civil");

  // Estado de carregamento da requisição
  const [carregando, setCarregando] = useState(false);

  function adicionarLocalSeguro() {
    if (novoLocalNome.trim() && novoLocalEnd.trim()) {
      setLocaisSeguros([...locaisSeguros, { nome: novoLocalNome, endereco: novoLocalEnd }]);
      setNovoLocalNome("");
      setNovoLocalEnd("");
    } else {
      Alert.alert("Atenção", "Preencha o nome e o endereço do local.");
    }
  }

  async function handleSubmit() {
    if (!nome.trim() || !email.trim()) {
      Alert.alert("Campos obrigatórios", "Por favor, informe seu nome e e-mail.");
      return;
    }

    // Mapeia o role para o tipoPerfil esperado pelo backend ("pcd", "contato", "admin")
    const tipoPerfilMapeado = role.toLowerCase();

    const payload = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senhaHash: "123456", // Senha padrão inicial para novos cadastros
      tipoPerfil: tipoPerfilMapeado,
      telefone,
      deficiencia,
      enderecoCasa,
      locaisSeguros,
      pcdVinculado,
      matricula,
      orgao,
    };

    try {
      setCarregando(true);
      
      // Chamada para salvar no banco de dados através do seu service
      await criarUsuario(payload);

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso no banco de dados!");
      onCompleteRegister(role, payload);
    } catch (error) {
      console.error("Erro ao salvar cadastro:", error);
      Alert.alert("Erro", "Não foi possível salvar o usuário no servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity onPress={onBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Voltar para seleção de perfil</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {role === "PCD" && "Cadastro Usuário PCD"}
          {role === "CONTATO" && "Cadastro Rede de Apoio"}
          {role === "ADMIN" && "Cadastro Agente Operacional"}
        </Text>

        {/* Dados Gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Dados Pessoais</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            placeholderTextColor="#666677"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#666677"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone / WhatsApp"
            placeholderTextColor="#666677"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
          />
        </View>

        {/* Específico PCD */}
        {role === "PCD" && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Perfil de Acessibilidade & Residência</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.chip, deficiencia === "CADEIRANTE" && styles.chipActive]}
                  onPress={() => setDeficiencia("CADEIRANTE")}
                >
                  <Text style={styles.chipText}>♿ Mobilidade Reduzida</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, deficiencia === "VISUAL" && styles.chipActive]}
                  onPress={() => setDeficiencia("VISUAL")}
                >
                  <Text style={styles.chipText}>🦯 Deficiência Visual</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Endereço Residencial (Casa)"
                placeholderTextColor="#666677"
                value={enderecoCasa}
                onChangeText={setEnderecoCasa}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Locais Seguros de Apoio</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome (ex: Casa da Mãe, Farmácia)"
                placeholderTextColor="#666677"
                value={novoLocalNome}
                onChangeText={setNovoLocalNome}
              />
              <TextInput
                style={styles.input}
                placeholder="Endereço do local"
                placeholderTextColor="#666677"
                value={novoLocalEnd}
                onChangeText={setNovoLocalEnd}
              />
              <TouchableOpacity style={styles.addBtn} onPress={adicionarLocalSeguro}>
                <Text style={styles.addBtnText}>+ Cadastrar Mais Locais</Text>
              </TouchableOpacity>

              {locaisSeguros.map((loc, idx) => (
                <View key={idx} style={styles.savedItem}>
                  <Text style={styles.savedItemText}>
                    📍 <Text style={{ fontWeight: "bold" }}>{loc.nome}:</Text> {loc.endereco}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Específico Rede de Apoio */}
        {role === "CONTATO" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Vínculo de Acompanhamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Usuário PCD acompanhado"
              placeholderTextColor="#666677"
              value={pcdVinculado}
              onChangeText={setPcdVinculado}
            />
          </View>
        )}

        {/* Específico Agente */}
        {role === "ADMIN" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Identificação Institucional</Text>
            <TextInput
              style={styles.input}
              placeholder="Matrícula / Funcional (ex: DC-8849)"
              placeholderTextColor="#666677"
              value={matricula}
              onChangeText={setMatricula}
            />
            <TextInput
              style={styles.input}
              placeholder="Órgão (Defesa Civil / Bombeiros)"
              placeholderTextColor="#666677"
              value={orgao}
              onChangeText={setOrgao}
            />
          </View>
        )}

        <TouchableOpacity 
          style={[styles.submitBtn, carregando && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={carregando}
        >
          <Text style={styles.submitBtnText}>
            {carregando ? "Salvando no Banco..." : "Finalizar Cadastro →"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0B0B0E",
    alignItems: "center",
    padding: 20,
  },
  wrapper: {
    width: "100%",
    maxWidth: 480,
  },
  backLink: {
    marginBottom: 16,
  },
  backLinkText: {
    color: "#00D4FF",
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#141419",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22222E",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#00FF66",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#1C1C26",
    borderWidth: 1,
    borderColor: "#2E2E3E",
    borderRadius: 10,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 13,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#1C1C26",
    borderWidth: 1,
    borderColor: "#2E2E3E",
    alignItems: "center",
  },
  chipActive: {
    borderColor: "#FF0055",
    backgroundColor: "#2A121A",
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  addBtn: {
    backgroundColor: "#252533",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  addBtnText: {
    color: "#00D4FF",
    fontWeight: "bold",
    fontSize: 12,
  },
  savedItem: {
    backgroundColor: "#191922",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#00FF66",
  },
  savedItemText: {
    color: "#CCCCDD",
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: "#FF0055",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 30,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});