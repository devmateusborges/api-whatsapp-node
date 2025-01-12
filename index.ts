// Autoria Mateus Borges
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import express, { Request, Response } from 'express';
import axios from 'axios';
import qrcode from 'qrcode-terminal';

const app = express();
app.use(express.json());

// Criação do cliente
const client = new Client({
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Adicionar estas linhas
    }
  });
  

let urlWebhookProducao: string = "http://localhost:5678/webhook/whats";
let urlWebhookTeste: string = "http://localhost:5678/webhook-test/whats";
let testehabilitarTeste: Boolean = true;


// Evento para geração do QR Code
client.on('qr', (qr: string) => {
    console.log('Escaneie o QR Code abaixo com o WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento quando o cliente estiver pronto
client.on('ready', () => {
    console.log('WhatsApp conectado!');
});

// Evento de recebimento de mensagem
client.on('message', async (msg: Message) => {
    console.log(`Mensagem recebida de ${msg.from}: ${msg.body}`);

    // Extrair apenas o número do remetente (remover o sufixo "@c.us")
    const senderNumber = msg.from.split('@')[0];

    // Envia a mensagem recebida para o webhook com o número apenas
    try {
        await axios.post(testehabilitarTeste ? urlWebhookTeste : urlWebhookProducao, {
            edite: msg.edit,
            deviceType : msg.deviceType,
            from: senderNumber,
            body: msg.body, 
            timestamp: msg.timestamp,
        });
        console.log('Mensagem enviada ao webhook com sucesso!');
        console.log('web')
    } catch (error) {
        console.error('Erro ao enviar a mensagem para o webhook:', error);
    }
});


// Endpoint para enviar mensagens
app.post('/send-message', async (req: Request, res: Response) => {
    const { number, message }: { number: string; message: string } = req.body;

    try {
        await client.sendMessage(`${number}@c.us`, message);
        res.status(200).json({ status: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar a mensagem', details: error });
    }
});


app.post('/config', async (req: Request, res: Response) => {
    const { webhookProducao, webhookTeste, habilitarTeste }: {  webhookProducao: string, webhookTeste: string, habilitarTeste: boolean } = req.body;

    try {
        
        urlWebhookProducao = webhookProducao;
        urlWebhookTeste = webhookTeste;
        testehabilitarTeste = habilitarTeste;
        
        res.status(200).json({ status: 'Gravando webhook com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar a mensagem', details: error });
    }
});

// Inicia o servidor Express
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});

// Inicializa o cliente com erro de captura
client.initialize().catch((error) => {
    console.error('Erro ao inicializar o cliente do WhatsApp:', error);
});

