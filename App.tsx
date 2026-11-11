import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";

type Evento = {
  id: number;
  titulo: string;
  descricao: string;
  tipo: "ALAGAMENTO" | "INCENDIO" | "QUEDA_DE_ARVORE";
  endereco: string;
  nivelPrioridade: "BAIXA" | "MEDIA" | "ALTA";
  status: "ABERTO" | "EM_ANDAMENTO" | "RESOLVIDO";
};

export default function App() {
  const [evento, setEvento] = useState<Evento>({
    id: 1,
    titulo: "Alagamento na região central",
    descricao: "Acúmulo de água próximo à avenida",
    tipo: "ALAGAMENTO",
    endereco: "Centro, São Paulo",
    nivelPrioridade: "ALTA",
    status: "ABERTO",
  });

  function atualizarStatus() {
    setEvento({
      ...evento,
      status: "EM_ANDAMENTO",
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>CitizenTech</Text>
      <Text style={styles.subtitulo}>Monitoramento de Eventos Urbanos</Text>

      <View style={styles.card}>
        <Text style={styles.destaque}>{evento.titulo}</Text>

        <Text>Descrição: {evento.descricao}</Text>
        <Text>Tipo: {evento.tipo}</Text>
        <Text>Endereço: {evento.endereco}</Text>
        <Text>Prioridade: {evento.nivelPrioridade}</Text>
        <Text>Status: {evento.status}</Text>

        {evento.status === "ABERTO" && (
          <Button
            title="Iniciar Atendimento"
            onPress={atualizarStatus}
          />
        )}

        {evento.status === "EM_ANDAMENTO" && (
          <Text style={styles.sucesso}>
            Evento em atendimento!
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    marginBottom: 20,
  },
  card: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 8,
    gap: 10,
  },
  destaque: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sucesso: {
    color: "green",
    fontWeight: "bold",
  },
});
