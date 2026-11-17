# Segurança

Site estático sem backend, formulário, login ou dados de visitantes armazenados
pelo projeto. Os riscos relevantes são a cadeia de build e publicação, a
integridade dos arquivos servidos e a privacidade da medição de visitas.

## Como relatar um problema

Envie um e-mail para o endereço de contato publicado no site
(`mailto:` no rodapé) com a descrição, a URL afetada e os passos para reproduzir.
Não abra issue pública para uma vulnerabilidade ainda não corrigida.

## Publicação (GitHub Actions e Pages)

- `permissions: {}` no topo dos dois workflows; cada job declara só o necessário.
  O check de PR e o build do deploy têm `contents: read`; apenas o job de deploy
  recebe `pages: write` e `id-token: write`.
- O check de PR usa o evento `pull_request` (não `pull_request_target`): código de
  um fork roda sem secrets e com token somente leitura. O deploy só roda na `main`.
- Checkout com `persist-credentials: false`. Actions fixadas por SHA completo.
- Hugo baixado da release oficial e verificado por SHA-256 fixado em
  `.github/hugo-toolchain.json` antes da extração, sem `sudo` nem scripts do pacote.
- Dependências npm instaladas com `npm ci --ignore-scripts` a partir do lockfile;
  são ferramentas de build e não chegam ao navegador.
- `verify-build.py` rejeita links simbólicos/físicos, caminhos ocultos ou privados
  (`.git`, `.env`, `node_modules`, `design`, configs), chaves, backups e source maps,
  e grava um manifesto SHA-256. O deploy compara o tar do Pages com esse manifesto.
- Proteções administrativas (ruleset da `main`, check obrigatório, alertas do
  Dependabot) ficam nas configurações do GitHub e não são alteradas por código.

## Frontend

- Todo HTML é gerado no build a partir de conteúdo do próprio autor. Os scripts
  não inserem dados vindos da URL no DOM; `#fragmentos` são decodificados por
  `assets/js/shared/fragment.js`, que ignora valores malformados.
- CSS e JS próprios usam fingerprint e Subresource Integrity.
- Links que abrem nova aba usam `rel="noopener noreferrer"` (verificado pela
  auditoria estática).
- A tag do Google é carregada só após consentimento, com `referrerPolicy:
  no-referrer`. Detalhes no README, seção "Privacidade e analytics".

## Limites conhecidos

- O GitHub Pages não permite cabeçalhos HTTP próprios, então não há cabeçalho
  Content-Security-Policy. Uma CSP por `<meta>` exigiria hashes para o script e os
  estilos inline e liberar os domínios do Google Analytics; isso precisa de teste
  com a medição real antes de ser adotado.
- A verificação por digest detecta bytes diferentes dos aprovados, mas não prova
  que uma release upstream já comprometida seja segura. Revise a release antes de
  atualizar um digest.
