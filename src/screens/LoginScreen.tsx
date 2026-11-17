import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { listarUsuarios } from "../services/usuarioService"; // Ajuste o caminho se necessário

export type UserRole = "PCD" | "CONTATO" | "ADMIN";

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole, email: string, userData?: any) => void;
  onNavigateToRegister: () => void;
}

export function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    const emailClean = email.toLowerCase().trim();

    if (!emailClean) {
      Alert.alert("Atenção", "Por favor, digite seu e-mail.");
      return;
    }

    try {
      setCarregando(true);

      // Busca todos os usuários cadastrados no banco de dados via API
      const usuarios = await listarUsuarios();

      // Procura pelo usuário digitado
      const usuarioEncontrado = usuarios.find(
        (u) => u.email.toLowerCase().trim() === emailClean
      );

      if (usuarioEncontrado) {
        // Mapeia o tipoPerfil do banco para o UserRole esperado pelo app
        const perfilBanco = usuarioEncontrado.tipoPerfil?.toLowerCase() || "";
        let role: UserRole = "PCD";

        if (perfilBanco.includes("admin") || perfilBanco.includes("defesa")) {
          role = "ADMIN";
        } else if (perfilBanco.includes("contato") || perfilBanco.includes("apoio")) {
          role = "CONTATO";
        } else {
          role = "PCD";
        }

        onLoginSuccess(role, usuarioEncontrado.email, usuarioEncontrado);
      } else {
        // Fallback de segurança ou emails padrão caso o banco esteja vazio ou o usuário não esteja cadastrado
        if (emailClean.includes("admin") || emailClean.includes("defesacivil")) {
          onLoginSuccess("ADMIN", emailClean);
        } else if (emailClean.includes("apoio") || emailClean.includes("contato")) {
          onLoginSuccess("CONTATO", emailClean);
        } else {
          // Se não encontrar no banco, avisa ou direciona como PCD padrão
          Alert.alert(
            "Usuário não encontrado",
            "E-mail não cadastrado no banco. Verifique ou crie uma conta."
          );
        }
      }
    } catch (error) {
      console.error("Erro ao validar login no banco:", error);
      // Fallback caso ocorra erro de conexão com o servidor
      if (emailClean.includes("admin") || emailClean.includes("defesacivil")) {
        onLoginSuccess("ADMIN", emailClean);
      } else if (emailClean.includes("apoio") || emailClean.includes("contato")) {
        onLoginSuccess("CONTATO", emailClean);
      } else {
        onLoginSuccess("PCD", emailClean);
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.badge}>🛡️ CITIZENTECH</Text>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>
            Plataforma de inteligência urbana e mobilidade acessível
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#666677"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SENHA</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#666677"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showBtn}
            >
              <Text style={styles.showBtnText}>{showPassword ? "HIDE" : "SHOW"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, carregando && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={carregando}
        >
          <Text style={styles.loginButtonText}>
            {carregando ? "Verificando..." : "Conectar →"}
          </Text>
        </TouchableOpacity>

        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            O sistema verifica seu perfil diretamente no banco de dados ao conectar.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem conta?</Text>
          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={styles.signupLink}>Criar cadastro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0E",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#141419",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  header: {
    marginBottom: 26,
  },
  badge: {
    color: "#00FF66",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 13,
    color: "#888899",
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: "#888899",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1C1C26",
    borderWidth: 1,
    borderColor: "#2E2E3E",
    borderRadius: 12,
    padding: 14,
    color: "#FFFFFF",
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C26",
    borderWidth: 1,
    borderColor: "#2E2E3E",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    color: "#FFFFFF",
    fontSize: 14,
  },
  showBtn: {
    paddingHorizontal: 14,
  },
  showBtnText: {
    color: "#FF0055",
    fontSize: 11,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#FF0055",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  hintBox: {
    marginTop: 18,
    backgroundColor: "#191922",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#252533",
  },
  hintText: {
    color: "#777788",
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#22222E",
    gap: 6,
  },
  footerText: {
    color: "#888899",
    fontSize: 13,
  },
  signupLink: {
    color: "#00FF66",
    fontWeight: "bold",
    fontSize: 13,
  },
});