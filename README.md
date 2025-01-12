
## **Endpoints da API**

### **1. Enviar Mensagem**

#### **Descrição**

Este endpoint permite enviar uma mensagem para um número de WhatsApp.

#### **URL**

plaintext

Copiar código

`POST /send-message` 

#### **Exemplo de Requisição**

bash

Copiar código

`curl -X POST http://localhost:3000/send-message \
     -H "Content-Type: application/json" \
     -d '{
           "number": "5511999999999",
           "message": "Olá, isso é um teste!"
         }'` 

#### **Corpo da Requisição**

Campo

Tipo

Descrição

`number`

string

Número de telefone com código do país. Ex: `5511999999999` para o Brasil.

`message`

string

Mensagem de texto a ser enviada.

#### **Resposta de Sucesso**

json

Copiar código

`{
  "status": "Mensagem enviada com sucesso!"
}` 

#### **Resposta de Erro**

json

Copiar código

`{
  "error": "Erro ao enviar a mensagem",
  "details": "<DETALHES_DO_ERRO>"
}` 

----------

## **Eventos de Mensagem Recebida**

Quando a API recebe uma mensagem, ela exibe no terminal o número de quem enviou a mensagem e o conteúdo dela.

### **Exemplo de Saída no Terminal**

plaintext

Copiar código

`Mensagem recebida de 5511999999999: Olá, isso é um teste!` 

----------

## **Erros Comuns**

### **1. QR Code expirado**

Se o QR Code expirar antes de ser escaneado, reinicie a aplicação para gerar um novo QR Code.

### **2. Número de telefone inválido**

Certifique-se de que o número informado no campo `number` inclua o código do país (por exemplo, `55` para o Brasil).

----------

## **Licença** 📄

Este projeto está licenciado sob a MIT License.


## Iniciar aplicação 

npx ts-node index.ts


## Docker 🐋

docker build -t api-whatsapp-node .

## Docker Iniciar aplicação

docker run -p 3000:3000 api-whatsapp-node

## Configuração de webHook  ✅
# http://host.docker.internal:5678

