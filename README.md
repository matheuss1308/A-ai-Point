Açaí Point — Projeto pronto para VS Code
=======================================

Arquivos incluídos:
- index.html
- styles.css
- script.js
- admin.html
- admin.css
- admin.js
- menu.json
- assets/placeholder-acai.png (placeholder)

Como abrir no VS Code:
1. Baixe e extraia este pacote.
2. Abra a pasta no VS Code (File > Open Folder).
3. Instale a extensão 'Live Server' e clique em 'Go Live' para ver o site em http://127.0.0.1:5500
4. Admin: abra admin.html manualmente (ex: http://127.0.0.1:5500/admin.html). O painel admin usa localStorage para salvar menu e pedidos (não há backend).
5. Para mudar o número do WhatsApp, edite a constante WHATSAPP_PHONE em script.js (já está com o número que você forneceu).

Como funciona (resumo):
- Cliente escolhe sabor, tamanho, calda, até 6 ingredientes grátis e complementos premium pagos.
- Ao enviar pedido, ele abre o WhatsApp com a mensagem pronta e o pedido é registrado no localStorage (key: acai_orders_v1).
- No painel admin você pode adicionar/excluir/editar tamanhos e complementos premium, visualizar pedidos e fechar o dia. O gráfico mostra vendas dos últimos 7 dias (dados do localStorage).

Deploy grátis sugerido:
- GitHub Pages: criar repo e fazer push dos arquivos.
- Replit: criar novo Repl (HTML/CSS/JS) e enviar os arquivos.
- Vercel/Netlify: conectar ao repo do GitHub (ambas tem plano grátis).
