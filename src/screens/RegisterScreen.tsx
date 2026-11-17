import React, { useState, useEffect } from "react";
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
import { criarUsuario, listarUsuarios } from "../services/usuarioService";
import { criarLocalSeguro } from "../services/locaisSegurosService";
import { criarContatoEmergencia } from "../services/contatoEmergenciaService"; // Importando o service de contato de emergência

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
  const [locaisSeguros, setLocaisSeguros] = useState<{ nomeLocal: string; endereco: string }[]>([]);

  // Campos Contato (Rede de Apoio)
  const [pcdVinculado, setPcdVinculado] = useState("");
  const [usuariosCadastrados, setUsuariosCadastrados] = useState<any[]>([]);

  // Campos Admin
  const [matricula, setMatricula] = useState("");
  const [orgao, setOrgao] = useState("Defesa Civil");

  // Estado de carregamento da requisição
  const [carregando, setCarregando] = useState(false);

  // Carrega a lista de usuários ao montar a tela para validar o PCD vinculado se for Contato
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const lista = await listarUsuarios();
        setUsuariosCadastrados(lista || []);
      } catch (error) {
        console.error("Erro ao carregar lista de usuários:", error);
      }
    }
    carregarUsuarios();
  }, []);

  function adicionarLocalSeguro() {
    if (novoLocalNome.trim() && novoLocalEnd.trim()) {
      setLocaisSeguros([
        ...locaisSeguros,
        { nomeLocal: novoLocalNome.trim(), endereco: novoLocalEnd.trim() }
      ]);
      setNovoLocalNome("");
      setNovoLocalEnd("");
    } else {
      Alert.alert("Atenção", "Preencha o nome e o endereço do local seguro.");
    }
  }

  async function handleSubmit() {
    if (!nome.trim() || !email.trim()) {
      Alert.alert("Campos obrigatórios", "Por favor, informe seu nome e e-mail.");
      return;
    }

    let pcdEncontradoId = null;

    // Se o perfil for CONTATO (Rede de Apoio), valida se o PCD digitado existe no banco
    if (role === "CONTATO") {
      if (!pcdVinculado.trim()) {
        Alert.alert("Campo obrigatório", "Informe o nome do usuário PCD que você acompanha.");
        return;
      }

      // Procura na lista de usuários cadastrados um usuário com o nome informado e tipo "pcd"
      const pcdMatch = usuariosCadastrados.find(
        (u) => 
          u.nome?.trim().toLowerCase() === pcdVinculado.trim().toLowerCase() && 
          (u.tipoPerfil === "pcd" || u.tipoPerfil === "PCD")
      );

      if (!pcdMatch) {
        Alert.alert(
          "PCD não encontrado", 
          `O usuário PCD "${pcdVinculado}" não está cadastrado no sistema. Verifique o nome exato.`
        );
        return;
      }

      pcdEncontradoId = pcdMatch.id;
    }

    const tipoPerfilMapeado = role.toLowerCase();

    const payloadUsuario = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senhaHash: "123456",
      tipoPerfil: tipoPerfilMapeado,
      telefone,
      deficiencia,
      enderecoCasa,
      pcdVinculado,
      matricula,
      orgao,
    };

    try {
      setCarregando(true);
      
      // 1. Cria o usuário principal (seja PCD ou Contato) e obtém o ID gerado
      const usuarioCriado = await criarUsuario(payloadUsuario);
      const usuarioIdGerado = usuarioCriado?.id;

      if (!usuarioIdGerado) {
        throw new Error("O servidor não retornou o ID do usuário cadastrado.");
      }

      // 2. Se for PCD, cadastra os locais seguros vinculados
      if (role === "PCD" && locaisSeguros.length > 0) {
        for (const local of locaisSeguros) {
          const payloadLocalSeguro = {
            pcd_id: usuarioIdGerado,
            nomeLocal: local.nomeLocal,
            endereco: local.endereco,
          };
          await criarLocalSeguro(payloadLocalSeguro);
        }
      }

      // 3. Se for CONTATO, cria o registro na tabela contato_emergencia relacionando apoio e PCD
      if (role === "CONTATO" && pcdEncontradoId) {
        const payloadContatoEmergencia = {
          usuario_id: usuarioIdGerado, // ID do usuário de apoio recém-criado
          pcd_id: pcdEncontradoId,     // ID do PCD validado no banco
          telefone: telefone || "(11) 99999-9999",
        };
        await criarContatoEmergencia(payloadContatoEmergencia);
      }

      Alert.alert("Sucesso", "Cadastro e vínculos realizados com sucesso no banco!");
      onCompleteRegister(role, { ...payloadUsuario, id: usuarioIdGerado });
    } catch (error) {
      console.error("Erro ao salvar cadastro:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados no servidor. Verifique a conexão.");
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
                <Text style={styles.addBtnText}>+ Adicionar à Lista</Text>
              </TouchableOpacity>

              {locaisSeguros.map((loc, idx) => (
                <View key={idx} style={styles.savedItem}>
                  <Text style={styles.savedItemText}>
                    📍 <Text style={{ fontWeight: "bold" }}>{loc.nomeLocal}:</Text> {loc.endereco}
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
              placeholder="Nome exato do Usuário PCD cadastrado"
              placeholderTextColor="#666677"
              value={pcdVinculado}
              onChangeText={setPcdVinculado}
            />
            <Text style={{ color: "#888899", fontSize: 10, marginTop: 4 }}>
              * O usuário PCD informado precisa já possuir cadastro prévio no sistema.
            </Text>
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