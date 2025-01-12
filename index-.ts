import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import express, { Request, Response } from 'express';
import axios from 'axios';
import qrcode from 'qrcode-terminal';
import EventEmitter from 'events';
import qrImage from 'qr-image';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'view')));

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let urlWebhookProducao: string = "http://localhost:5678/webhook/whats";
let urlWebhookTeste: string = "http://localhost:5678/webhook-test/whats";
let testehabilitarTeste: Boolean = true;

const qrEventEmitter = new EventEmitter();

// Função para gerar QR Code com cor
const generateColorQr = (qr: string) => {
    const qrSvg = qrImage.imageSync(qr, { 
        type: 'svg'
    });
    return `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;
};

client.on('qr', (qr: string) => {
    console.log('Gerando QR Code...');
    const coloredQr = generateColorQr(qr);
    qrcode.generate(qr, { small: true });
    qrEventEmitter.emit('qr', coloredQr); // Enviar QR Code colorido para o frontend
});

// Evento quando o cliente estiver pronto
client.on('ready', () => {
    console.log('WhatsApp conectado!');
    qrEventEmitter.emit('status', 'Conectado'); // Emitir status de conexão
});

// Evento de recebimento de mensagem
client.on('message', async (msg: Message) => {
    console.log(`Mensagem recebida de ${msg.from}: ${msg.body}`);

    const senderNumber = msg.from.split('@')[0];

    try {
        await axios.post(testehabilitarTeste ? urlWebhookTeste : urlWebhookProducao, {
            edite: msg.edit,
            deviceType : msg.deviceType,
            from: senderNumber,
            body: msg.body, 
            timestamp: msg.timestamp,
        });
        console.log('Mensagem enviada ao webhook com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar a mensagem para o webhook:', error);
    }
});

app.get('/qr-code-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const onQrCode = (qrCode: string) => {
        res.write(`data: ${qrCode}\n\n`);
    };

    qrEventEmitter.on('qr', onQrCode);

    req.on('close', () => {
        qrEventEmitter.removeListener('qr', onQrCode);
    });
});

// Enviar status de conexão
app.get('/connection-status', (req, res) => {
    qrEventEmitter.on('status', (status: string) => {
        res.json({ status });
    });
});


app.post('/config', async (req: Request, res: Response) => {
    const { webhookProducao, webhookTeste, habilitarTeste }: {  webhookProducao: string, webhookTeste: string, habilitarTeste: boolean } = req.body;

    try {
        
        urlWebhookProducao = webhookProducao;
        urlWebhookTeste = webhookTeste;
        testehabilitarTeste = habilitarTeste;
        
        res.status(200).json({ status: 'Gravando webhook com sucesso!' ,urlWebhookProducao,urlWebhookTeste,testehabilitarTeste });
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
