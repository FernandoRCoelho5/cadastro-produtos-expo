import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// Aceita "24,90" ou "24.90" (até 8 dígitos inteiros e 2 decimais, como NUMERIC(10,2)).
function converterPreco(texto) {
  const valor = texto.trim();
  if (!/^\d{1,8}([.,]\d{1,2})?$/.test(valor)) {
    return null;
  }
  return valor.replace(',', '.');
}

// O NUMERIC vem do banco como texto, ex.: "24.90".
function formatarPreco(preco) {
  const [inteiro, decimal] = Number(preco).toFixed(2).split('.');
  const inteiroComPontos = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${inteiroComPontos},${decimal}`;
}

export default function App() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState('');

  async function carregarProdutos() {
    if (!sql) {
      setErro('Defina EXPO_PUBLIC_DATABASE_URL no arquivo .env.');
      return;
    }
    try {
      const linhas = await sql`SELECT id, nome, preco FROM produtos ORDER BY id DESC`;
      setProdutos(linhas);
      setErro('');
    } catch (e) {
      setErro('Erro ao carregar produtos: ' + e.message);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function salvar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro('Informe o nome do produto.');
      return;
    }
    const precoConvertido = converterPreco(preco);
    if (precoConvertido === null) {
      setErro('Informe um preço válido, ex.: 24,90');
      return;
    }
    if (!sql) {
      setErro('Defina EXPO_PUBLIC_DATABASE_URL no arquivo .env.');
      return;
    }
    try {
      await sql`INSERT INTO produtos (nome, preco) VALUES (${nomeLimpo}, ${precoConvertido})`;
      setNome('');
      setPreco('');
      await carregarProdutos();
    } catch (e) {
      setErro('Erro ao salvar produto: ' + e.message);
    }
  }

  async function excluir(id) {
    try {
      await sql`DELETE FROM produtos WHERE id = ${id}`;
      await carregarProdutos();
    } catch (e) {
      setErro('Erro ao excluir produto: ' + e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Produtos</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Preço"
        value={preco}
        onChangeText={setPreco}
        keyboardType="decimal-pad"
      />
      <Pressable style={styles.botaoSalvar} onPress={salvar}>
        <Text style={styles.textoBotao}>Salvar</Text>
      </Pressable>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <FlatList
        data={produtos}
        keyExtractor={(item) => String(item.id)}
        style={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum produto cadastrado.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemPreco}>{formatarPreco(item.preco)}</Text>
            </View>
            <Pressable
              style={styles.botaoExcluir}
              onPress={() => excluir(item.id)}
            >
              <Text style={styles.textoBotao}>Excluir</Text>
            </Pressable>
          </View>
        )}
      />

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  botaoSalvar: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  erro: {
    color: '#dc2626',
    marginTop: 10,
  },
  lista: {
    marginTop: 20,
  },
  vazio: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    color: '#222',
  },
  itemPreco: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  botaoExcluir: {
    backgroundColor: '#dc2626',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
