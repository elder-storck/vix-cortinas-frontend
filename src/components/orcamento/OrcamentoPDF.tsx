import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Orcamento } from '@/types/orcamento'

/* ─── Paleta ─────────────────────────────────────────────────── */
const G    = '#6DC820'   // verde VIX
const DARK = '#1A1A1A'
const MED  = '#4B5563'
const MUTE = '#9CA3AF'
const BORDER = '#E5E7EB'
const BGSOFT = '#F9FAFB'
const BGGREEN = '#F2FAE8'

/* ─── Helpers ────────────────────────────────────────────────── */
const fmt  = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtN = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const addDays = (n: number) => new Date(Date.now() + n * 864e5).toLocaleDateString('pt-BR')

/* ─── Estilos ────────────────────────────────────────────────── */
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: DARK,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },

  /* barra verde topo */
  accentBar: { height: 5, backgroundColor: G },

  /* cabeçalho */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 40,
    paddingTop: 22,
    paddingBottom: 18,
  },
  logo: { width: 130, height: 44 },
  orcBlock: { alignItems: 'flex-end' },
  orcLabel: { fontSize: 7, color: MUTE, letterSpacing: 2 },
  orcNum: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: DARK, marginTop: 2 },
  orcMeta: { fontSize: 7.5, color: MED, marginTop: 4 },

  /* corpo */
  body: { paddingHorizontal: 40, paddingTop: 20, flex: 1 },

  /* rótulo de seção */
  sectionLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: G,
    letterSpacing: 2,
    marginBottom: 8,
  },

  /* cartão cliente */
  clientCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
    padding: 13,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 40,
  },
  clientField: { flex: 1 },
  clientFieldLabel: { fontSize: 6.5, color: MUTE, letterSpacing: 0.5, marginBottom: 3 },
  clientFieldValue: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: DARK },

  /* tabela */
  tableWrap: { marginBottom: 6 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: BGSOFT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  th: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: MUTE, letterSpacing: 0.8 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  tableRowAlt: { backgroundColor: BGSOFT },
  td:    { fontSize: 8.5, color: DARK },
  tdSub: { fontSize: 7, color: MED, marginTop: 2.5 },

  /* totais */
  totalsOuter: { paddingHorizontal: 40, marginBottom: 14 },
  dividerThin: { height: 0.5, backgroundColor: BORDER, marginBottom: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  totalLabel: { fontSize: 8.5, color: MED, width: 120, textAlign: 'right', marginRight: 20 },
  totalValue: { fontSize: 8.5, color: DARK, width: 100, textAlign: 'right' },
  grandBox: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: BGGREEN,
    borderRadius: 3,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  grandLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: MED, marginRight: 20 },
  grandValue: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: G },

  /* barra condições */
  condBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 40,
    paddingVertical: 12,
    gap: 0,
  },
  condField: { flex: 1 },
  condLabel: { fontSize: 6.5, color: MUTE, letterSpacing: 0.5, marginBottom: 3 },
  condValue: { fontSize: 8.5, color: DARK },

  /* observações */
  obsOuter: {
    paddingHorizontal: 40,
    marginBottom: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 12,
  },
  obsItem: { marginBottom: 8 },
  obsLabel: { fontSize: 6.5, color: MUTE, letterSpacing: 0.5, marginBottom: 2 },
  obsText: { fontSize: 8.5, color: MED, lineHeight: 1.6 },

  /* rodapé */
  footer: {
    borderTopWidth: 2,
    borderTopColor: G,
    paddingHorizontal: 40,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: { fontSize: 7, color: MUTE },
  footerBrand: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: MED },
})

/* ─── Componente ─────────────────────────────────────────────── */
interface Props { orcamento: Orcamento }

export function OrcamentoPDF({ orcamento }: Props) {
  const { cliente, numero, itensM2, itensML, instalacao, desconto, observacoes } = orcamento

  const subtotal = [...itensM2, ...itensML].reduce((acc, i) => acc + i.valorTotal, 0)
  const total    = subtotal + instalacao - desconto
  const hoje     = new Date().toLocaleDateString('pt-BR')
  const validade = addDays(15)

  const logoSrc = `${window.location.origin}/VIX_logo.png`
  const hasObs  = !!(observacoes.prazo || observacoes.condicoes_instalacao || observacoes.geral)

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Barra verde topo ── */}
        <View style={s.accentBar} />

        {/* ── Cabeçalho: logo + número ── */}
        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <View style={s.orcBlock}>
            <Text style={s.orcLabel}>ORÇAMENTO</Text>
            <Text style={s.orcNum}>{numero ?? 'RASCUNHO'}</Text>
            <Text style={s.orcMeta}>Emitido em {hoje}</Text>
          </View>
        </View>

        {/* ── Corpo ── */}
        <View style={s.body}>

          {/* Cliente */}
          <Text style={s.sectionLabel}>DADOS DO CLIENTE</Text>
          <View style={s.clientCard}>
            <View style={s.clientField}>
              <Text style={s.clientFieldLabel}>NOME</Text>
              <Text style={s.clientFieldValue}>{cliente?.nome ?? '—'}</Text>
            </View>
            <View style={s.clientField}>
              <Text style={s.clientFieldLabel}>TELEFONE / WHATSAPP</Text>
              <Text style={s.clientFieldValue}>{cliente?.telefone || '—'}</Text>
            </View>
          </View>

          {/* Tabela de itens */}
          <Text style={s.sectionLabel}>PRODUTOS E SERVIÇOS</Text>
          <View style={s.tableWrap}>
            {/* Cabeçalho */}
            <View style={s.tableHead}>
              <Text style={[s.th, { flex: 1 }]}>PRODUTO / DESCRIÇÃO</Text>
              <Text style={[s.th, { width: 78 }]}>MEDIDAS</Text>
              <Text style={[s.th, { width: 28, textAlign: 'center' }]}>QTD</Text>
              <Text style={[s.th, { width: 88, textAlign: 'right' }]}>TOTAL</Text>
            </View>

            {/* Itens M² */}
            {itensM2.map((item, idx) => (
              <View key={item.id} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.td}>{item.tipo} — {item.tecido ?? ''}</Text>
                  {item.cor ? <Text style={s.tdSub}>{item.cor}</Text> : null}
                </View>
                <View style={{ width: 78 }}>
                  <Text style={[s.td, { fontFamily: 'Helvetica-Bold' }]}>
                    {fmtN(item.areaTotal)} m²
                  </Text>
                </View>
                <Text style={[s.td, { width: 28, textAlign: 'center' }]}>{item.quantidade}</Text>
                <Text style={[s.td, { width: 88, textAlign: 'right', fontFamily: 'Helvetica-Bold', color: G }]}>
                  {fmt(item.valorTotal)}
                </Text>
              </View>
            ))}

            {/* Itens ML */}
            {itensML.map((item, idx) => {
              const altIdx = itensM2.length + idx
              return (
                <View key={item.id} style={[s.tableRow, altIdx % 2 === 1 ? s.tableRowAlt : {}]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.td}>
                      {item.tipoTecido}{item.cor ? ` — ${item.cor}` : ''}
                    </Text>
                    <Text style={s.tdSub}>
                      {item.tipoCortina}
                      {item.possuiBlackout
                        ? ` · Blackout: ${item.tipoTecidoBlackout}${item.corBlackout ? ` (${item.corBlackout})` : ''}`
                        : ''}
                    </Text>
                  </View>
                  <View style={{ width: 78 }}>
                    <Text style={[s.td, { fontFamily: 'Helvetica-Bold' }]}>
                      {fmtN(item.largura)} m lin.
                    </Text>
                  </View>
                  <Text style={[s.td, { width: 28, textAlign: 'center' }]}>{item.quantidade}</Text>
                  <Text style={[s.td, { width: 88, textAlign: 'right', fontFamily: 'Helvetica-Bold', color: G }]}>
                    {fmt(item.valorTotal)}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* ── Resumo financeiro ── */}
        <View style={s.totalsOuter}>
          <View style={s.dividerThin} />
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmt(subtotal)}</Text>
          </View>
          {instalacao > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Instalação</Text>
              <Text style={s.totalValue}>{fmt(instalacao)}</Text>
            </View>
          )}
          {desconto > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Desconto</Text>
              <Text style={[s.totalValue, { color: '#DC2626' }]}>− {fmt(desconto)}</Text>
            </View>
          )}
          <View style={s.grandBox}>
            <Text style={s.grandLabel}>TOTAL</Text>
            <Text style={s.grandValue}>{fmt(total)}</Text>
          </View>
        </View>

        {/* ── Condições ── */}
        <View style={s.condBar}>
          <View style={s.condField}>
            <Text style={s.condLabel}>DATA DE EMISSÃO</Text>
            <Text style={s.condValue}>{hoje}</Text>
          </View>
          <View style={s.condField}>
            <Text style={s.condLabel}>VÁLIDO ATÉ</Text>
            <Text style={s.condValue}>{validade}</Text>
          </View>
          <View style={s.condField}>
            <Text style={s.condLabel}>FORMA DE PAGAMENTO</Text>
            <Text style={s.condValue}>A combinar</Text>
          </View>
        </View>

        {/* ── Observações ── */}
        {hasObs && (
          <View style={s.obsOuter}>
            <Text style={[s.sectionLabel, { marginBottom: 10 }]}>OBSERVAÇÕES E CONDIÇÕES</Text>
            {observacoes.prazo && (
              <View style={s.obsItem}>
                <Text style={s.obsLabel}>PRAZO DE ENTREGA</Text>
                <Text style={s.obsText}>{observacoes.prazo}</Text>
              </View>
            )}
            {observacoes.condicoes_instalacao && (
              <View style={s.obsItem}>
                <Text style={s.obsLabel}>CONDIÇÕES DE INSTALAÇÃO</Text>
                <Text style={s.obsText}>{observacoes.condicoes_instalacao}</Text>
              </View>
            )}
            {observacoes.geral && (
              <View style={s.obsItem}>
                <Text style={s.obsLabel}>OBSERVAÇÕES GERAIS</Text>
                <Text style={s.obsText}>{observacoes.geral}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Rodapé ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Rua Julia Lacourt Penna, 794 — Jardim Camburi, Vitória-ES
          </Text>
          <Text style={s.footerText}>(27) 99827-5274  ·  WhatsApp</Text>
          <Text style={s.footerBrand}>Vix Cortinas & Persianas</Text>
        </View>

      </Page>
    </Document>
  )
}
