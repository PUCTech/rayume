## Rayume
<img width="1200" height="400" alt="v0Artboard 6 copy@2x (2)" src="https://github.com/user-attachments/assets/f4e4519a-f396-4f0e-a03c-02e58d3fa346" />

### Qual o problema que vocês querem resolver?

A dificuldade de estudantes e profissionais da área de tecnologia em apresentar suas experiências, projetos e competências em currículos claros e profissionais. Além disso, habilidades interpessoais (soft skills), como comunicação, colaboração e liderança, podem ficar pouco evidentes quando o currículo se limita a listar conhecimentos técnicos.

### Qual a solução de vocês?

O Rayume utilizará inteligência artificial para criar currículos organizados e alinhados ao objetivo profissional do usuário. Gerados em LaTeX, os documentos terão formatação profissional e personalizável, valorizando tanto as competências técnicas (hard skills) quanto as habilidades interpessoais (soft skills), com base em experiências e projetos.

A plataforma também contará com uma galeria de templates com busca e pré-visualização, exibindo os modelos já preenchidos com os dados do usuário para facilitar a comparação e a escolha.

### Que outras soluções existem e por que a de vocês é melhor ou diferente?

As soluções atuais forçam o profissional de tecnologia a escolher entre praticidade e qualidade técnica. Ferramentas visuais como Canva e Word dificultam a leitura por sistemas de triagem (ATS) e exigem redação manual; plataformas em LaTeX como o Overleaf entregam qualidade impecável, mas exigem conhecimento de código e não ajudam no conteúdo; e IAs genéricas (ChatGPT) criam textos despadronizados que ainda precisam ser formatados do zero.

O Rayume se diferencia por unir a qualidade tipográfica do LaTeX (sem necessidade de programar) a uma IA especializada na área de TI, capaz de extrair tanto hard skills quanto soft skills a partir de projetos reais. Além disso, nossa pré-visualização dinâmica aplica os dados do próprio usuário em toda a galeria de templates simultaneamente, eliminando o retrabalho na hora de testar e comparar diferentes formatos.

### Qual o escopo da solução de vocês?

Para garantir uma entrega focada e de alta qualidade, o escopo inicial (MVP) do Rayume está delimitado da seguinte forma:

- O que está dentro do escopo: Plataforma web responsiva e extensão de navegador complementar; cadastro e estruturação de perfil técnico (Currículo Mestre); módulo de IA generativa parametrizado para redação e adaptação de currículos de TI (foco em hard e soft skills); galeria com busca e pré-visualização dinâmica preenchida com os dados do usuário; e compilação transparente em LaTeX com exportação em PDF pronto para filtros ATS.
- Limites do escopo (O que o Rayume não é no momento): A plataforma não atuará como portal de vagas, rede social profissional ou sistema de recrutamento para empresas. O foco é 100% voltado ao candidato e à excelência na construção, personalização e apresentação do seu currículo.

### Quais as features?

- Autenticação ágil para devs: Login integrado via GitHub, Google e e-mail.
- Currículo Mestre (Master Resume) assistido por IA: Cadastro centralizado de experiências, formação e projetos, onde a IA auxilia a extrair e redigir tanto hard skills quanto soft skills.
- Personalização inteligente por vaga (via Extensão e Web): Funcionalidade que captura a descrição da vaga aberta no navegador e gera uma versão do currículo adaptada especificamente para aquela oportunidade a partir do Currículo Mestre do usuário.
- Galeria de templates LaTeX com Live Preview: Sistema de busca e visualização dinâmica dos modelos já renderizados com as informações reais do candidato.
- Exportação em PDF (Padrão ATS): Compilação transparente do código LaTeX em segundo plano, gerando um PDF limpo, padronizado e otimizado para sistemas de triagem.

### Como vocês vão incorporar IA via API na solução?

A integração com LLMs via API (utilizando saídas estruturadas / Structured Outputs) atuará em três frentes principais:

- Refinamento de experiências e extração de Hard e Soft Skills: Ao cadastrar um projeto ou experiência bruta, a IA processa o relato do usuário para reescrevê-lo com foco em impacto e resultados, evidenciando competências técnicas e interpessoais (liderança, comunicação, resolução de problemas) que costumam passar despercebidas.
- Currículo personalizado por vaga (Tailoring): A partir dos atributos e keywords de uma vaga específica (capturados via extensão ou inseridos na plataforma), a IA cruza os requisitos com o "Currículo Mestre" da pessoa, selecionando os projetos mais relevantes e ajustando o resumo e os termos técnicos para maximizar a aderência à vaga.
- Mapeamento automático para múltiplos templates LaTeX: Como diferentes templates possuem seções e limites de espaço distintos, a IA adapta e sintetiza as informações do usuário em estruturas padronizadas (JSON), permitindo que o motor do sistema preencha e compile diferentes layouts de LaTeX automaticamente sem quebrar a formatação.

### O que pode ou vai ficar para o futuro?

- ATS interno (Resume Scoring): Sistema para pontuar e ranquear a compatibilidade do currículo frente a uma vaga antes do envio.
- Modelo SaaS e precificação: Planos de assinatura para cobrir o custo de processamento de usuários com alto volume de candidaturas (heavy job hunting).
- Scraper e alertas de vagas (Job Alerts): Monitoramento e coleta ativa de oportunidades alinhadas ao perfil técnico do usuário.
- Aplicação automática em vagas (Auto-apply): Preenchimento automatizado de formulários de candidatura em plataformas de recrutamento.
- Classificador preditivo de sucesso: Modelo analítico (teórico) treinado com base no histórico de currículos que converteram em entrevistas reais para otimizar futuras gerações.

### Como vocês garantem que vão entregar esse projeto dentro de 2 meses?

Escolhemos esse tema pela alta escalabilidade e pela clara lacuna de mercado (market gap), já que faltam ferramentas eficientes voltadas à jornada de candidatura (job hunting) em tecnologia. Embora seja um desafio técnico relevante, garantimos a entrega, por meio de divisão de tarefas, comunicação assíncrona, seguimento rígido ao cronograma estipulado pelos docs. 

#### - Raul Kolaric, Lorenzo Cunha, Thierry Nadjarian.
