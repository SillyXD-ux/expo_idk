import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Form from "./components/Form/Form";
import Header from "./components/Header/Header";
import ListaItens, { DATA } from "./components/ListaItens/ListaItens";
import { colors } from "./components/colors";
import { ProdutoItem } from "./interfaces/ProdutoItem";

const STORAGE_KEY = "@lista-compras-produtos";

export default function App() {
  const [produtos, setProdutos] = useState<ProdutoItem[]>(DATA);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const listaSalva = await AsyncStorage.getItem(STORAGE_KEY);

        if (listaSalva) {
          setProdutos(JSON.parse(listaSalva) as ProdutoItem[]);
          return;
        }

        setProdutos(DATA);
      } catch (error) {
        console.warn("Erro ao carregar produtos:", error);
        setProdutos(DATA);
      } finally {
        setCarregado(true);
      }
    }

    carregarProdutos();
  }, []);

  useEffect(() => {
    if (!carregado) {
      return;
    }

    async function salvarProdutos() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
      } catch (error) {
        console.warn("Erro ao salvar produtos:", error);
      }
    }

    salvarProdutos();
  }, [carregado, produtos]);

  function adicionarProduto(nome: string) {
    const texto = nome.trim();

    if (!texto) {
      return;
    }

    const novoProduto: ProdutoItem = {
      id: Date.now().toString(),
      nome: texto,
      comprado: false,
    };

    setProdutos((produtosAtuais) => [novoProduto, ...produtosAtuais]);
  }

  function alternarProdutoComprado(id: string) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((produto) =>
        produto.id === id ? { ...produto, comprado: !produto.comprado } : produto,
      ),
    );
  }

  function removerProduto(id: string) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.filter((produto) => produto.id !== id),
    );
  }

  function limparProdutosPorAba(aba: "presentes" | "comprados") {
    const deveRemover = aba === "presentes" ? false : true;

    setProdutos((produtosAtuais) =>
      produtosAtuais.filter((produto) => produto.comprado !== deveRemover),
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <Header />
        <Form onAdicionar={adicionarProduto} />
        <ListaItens
          produtos={produtos}
          onAlternarComprado={alternarProdutoComprado}
          onRemoverProduto={removerProduto}
          onLimparProdutos={limparProdutosPorAba}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
