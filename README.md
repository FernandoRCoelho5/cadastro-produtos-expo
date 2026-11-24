# Cadastro de Produtos

App simples em React Native com Expo para cadastrar produtos (nome e preço) em um banco PostgreSQL no [Neon](https://neon.tech).

## Funcionalidades

- Cadastrar um produto com nome e preço
- Listar os produtos salvos
- Excluir um produto da lista

## Tecnologias

- [Expo](https://expo.dev) (React Native, JavaScript)
- [Neon](https://neon.tech) (PostgreSQL)
- [@neondatabase/serverless](https://github.com/neondatabase/serverless)

## Como rodar

1. Clone o repositório e instale as dependências:

   ```bash
   npm install
   ```

2. No Neon, crie a tabela:

   ```sql
   CREATE TABLE produtos (
     id SERIAL PRIMARY KEY,
     nome TEXT NOT NULL,
     preco NUMERIC(10,2) NOT NULL
   );
   ```

3. Copie o `.env.example` para `.env` e coloque a sua connection string do Neon:

   ```
   EXPO_PUBLIC_DATABASE_URL=postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require
   ```

4. Inicie o app e abra no Expo Go escaneando o QR code:

   ```bash
   npx expo start
   ```

## Observação

Este projeto é para fins de estudo. A connection string fica embutida no app, então não é indicado publicá-lo nas lojas dessa forma.
