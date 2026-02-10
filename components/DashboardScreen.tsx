import React from 'react';
import { FileText, Briefcase, FileCheck, CalendarClock, AlertOctagon, CheckSquare, Search, HardHat, Globe, DollarSign as DollarIcon, BoxSelect } from 'lucide-react';
import { AnalysisResult, DocItem, CitationItem } from '../types';

interface DashboardScreenProps {
  data: AnalysisResult | null;
  onReset: () => void;
}

const CitationTag = ({ text }: { text: string }) => (
  <span className="inline-flex items-baseline gap-1 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-mono ml-2 break-all" title={`Fonte: ${text}`}>
    <Search size={10} className="translate-y-[1px] flex-shrink-0" /> {text}
  </span>
);

const GoNoGoItem = ({ label, item }: { label: string, item: CitationItem }) => {
  let color = "border-slate-200 bg-white";
  let textColor = "text-slate-600";
  
  if (item.status === 'critical') {
    color = "border-red-200 bg-red-50";
    textColor = "text-red-700";
  } else if (item.status === 'warning') {
    color = "border-amber-200 bg-amber-50";
    textColor = "text-amber-800";
  } else if (item.status === 'info') {
    color = "border-blue-200 bg-blue-50";
    textColor = "text-blue-700";
  }

  return (
    <div className={`p-4 rounded-lg border ${color} shadow-sm flex flex-col h-full`}>
      <span className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-80 ${textColor}`}>{label}</span>
      <p className="text-sm font-medium mb-2 flex-grow break-words">{item.descricao}</p>
      <div className="mt-auto pt-2 border-t border-black/5">
        <span className="text-[10px] font-mono opacity-70 flex items-center gap-1 break-all">
          <Search size={10} className="flex-shrink-0" /> {item.citation}
        </span>
      </div>
    </div>
  );
};

const DocSection = ({ title, items, icon: Icon }: { title: string, items: DocItem[], icon: any }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
      <Icon size={16} className="text-blue-600 flex-shrink-0" />
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide truncate">{title}</h3>
      <span className="ml-auto bg-white text-slate-500 text-xs px-2 py-0.5 rounded-full border border-slate-200 font-mono flex-shrink-0">
        {items.length}
      </span>
    </div>
    <div className="p-4 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-200">
      <ul className="space-y-3">
        {items.length > 0 ? items.map((doc, i) => (
          <li key={i} className="text-sm text-slate-700 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
            <div className="flex justify-between items-start gap-2">
               <span className="flex-grow break-words">{doc.requisito}</span>
            </div>
            <div className="mt-1 text-right">
                <span className="inline-block text-[10px] text-blue-400 font-mono bg-slate-50 px-1 rounded break-all">Ref: {doc.citation}</span>
            </div>
          </li>
        )) : (
          <li className="text-xs text-slate-400 italic">Nenhum requisito específico encontrado.</li>
        )}
      </ul>
    </div>
  </div>
);

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ data, onReset }) => {
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Bar */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg flex-shrink-0">
               <CheckSquare size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Análise de Habilitação</h1>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl">
            Relatório auditado com foco em fidelidade de dados e especificações técnicas.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[200px]">
            <div className="text-right w-full">
                <div className="text-xs text-slate-400 font-bold uppercase">Edital / Processo</div>
                <div className="font-mono text-lg font-bold text-slate-800 break-all leading-tight">{data.metadata.numero}</div>
            </div>
            <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
            Realizar nova análise
            </button>
        </div>
      </header>

      {/* Metadata & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Objeto da Licitação</h3>
            <p className="text-slate-800 font-medium leading-relaxed break-words">{data.metadata.objeto}</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                   <span className="text-xs text-slate-400 block mb-1">Órgão Licitante</span>
                   <span className="flex items-start gap-1.5 font-semibold text-slate-700">
                     <Briefcase size={14} className="mt-0.5 flex-shrink-0"/> 
                     <span className="break-words">{data.metadata.orgao}</span>
                   </span>
                </div>
                <div>
                   <span className="text-xs text-slate-400 block mb-1">Abertura / Disputa</span>
                   <span className="flex items-start gap-1.5 font-semibold text-slate-700">
                     <CalendarClock size={14} className="mt-0.5 flex-shrink-0"/> 
                     <span className="break-words">
                        {data.metadata.data_abertura} 
                        {data.metadata.horario_abertura ? ` às ${data.metadata.horario_abertura}` : ''}
                     </span>
                   </span>
                </div>
                <div>
                   <span className="text-xs text-slate-400 block mb-1">Portal / Local</span>
                   <span className="flex items-start gap-1.5 font-semibold text-slate-700">
                     <Globe size={14} className="mt-0.5 flex-shrink-0"/> 
                     <span className="break-words">{data.metadata.portal || "Não identificado"}</span>
                   </span>
                </div>
                 <div className="sm:col-span-2 md:col-span-1">
                   <span className="text-xs text-slate-400 block mb-1">Valor Estimado</span>
                   <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                     <DollarIcon size={14} className="flex-shrink-0"/> 
                     <span className="break-words">{data.metadata.valor_estimado || "Sigiloso / Não consta"}</span>
                   </span>
                </div>
            </div>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-center">
             <h3 className="text-blue-800 font-bold text-sm uppercase mb-3">Prazos e Condições</h3>
             <div className="space-y-4">
                <div>
                    <span className="text-xs text-blue-600 block mb-0.5">Prazo de Entrega/Execução</span>
                    <div className="font-semibold text-slate-800 text-sm flex flex-wrap justify-between items-center gap-2">
                        <span className="break-words">{data.regras.prazo_entrega?.value || "Não identificado"}</span>
                        {data.regras.prazo_entrega?.citation && <CitationTag text={data.regras.prazo_entrega.citation} />}
                    </div>
                </div>
                <div>
                    <span className="text-xs text-blue-600 block mb-0.5">Vigência Contratual</span>
                    <div className="font-semibold text-slate-800 text-sm flex flex-wrap justify-between items-center gap-2">
                        <span className="break-words">{data.regras.vigencia?.value || "Não identificado"}</span>
                        {data.regras.vigencia?.citation && <CitationTag text={data.regras.vigencia.citation} />}
                    </div>
                </div>
                 <div className="pt-2 border-t border-blue-200/50">
                    <span className="text-xs text-blue-600 block mb-0.5">Condição dos Equipamentos</span>
                    <div className="font-semibold text-slate-800 text-sm flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-start gap-1">
                            <BoxSelect size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{data.regras.condicao_equipamentos?.value || "Não especificado"}</span>
                        </div>
                        {data.regras.condicao_equipamentos?.citation && <CitationTag text={data.regras.condicao_equipamentos.citation} />}
                    </div>
                </div>
             </div>
        </div>
      </div>

      {/* Critical Analysis (Go/No-Go) */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertOctagon className="text-orange-500 flex-shrink-0" size={20} />
            Pontos Críticos de Habilitação
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <GoNoGoItem label="Garantia de Proposta" item={data.go_no_go.garantia_proposta} />
             <GoNoGoItem label="Patrimônio Líquido" item={data.go_no_go.patrimonio_liquido} />
             <GoNoGoItem label="Visita Técnica" item={data.go_no_go.visita_tecnica} />
             <GoNoGoItem label="Amostra / POC" item={data.go_no_go.amostra} />
        </div>
      </section>

      {/* Detailed Habilitation Docs */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileCheck className="text-blue-600 flex-shrink-0" size={20} />
            Checklist de Documentação & Equipe
        </h2>
        
        {/* Main Habilitation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start mb-6">
            <DocSection title="Habilitação Jurídica" items={data.habilitacao.juridica} icon={FileText} />
            <DocSection title="Fiscal e Trabalhista" items={data.habilitacao.fiscal_trabalhista} icon={FileText} />
            <DocSection title="Qualif. Econômica" items={data.habilitacao.qualificacao_economica} icon={DollarSign} />
        </div>

        {/* Technical & Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
             <DocSection title="Qualificação Técnica (Atestados)" items={data.habilitacao.qualificacao_tecnica} icon={Briefcase} />
             <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full ring-1 ring-blue-100">
                <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                    <HardHat size={16} className="text-blue-600 flex-shrink-0" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Equipe Técnica Exigida</h3>
                    <span className="ml-auto bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-200 font-mono flex-shrink-0">
                        {data.habilitacao.equipe_tecnica.length}
                    </span>
                </div>
                <div className="p-4">
                     {data.habilitacao.equipe_tecnica.length > 0 ? (
                        <ul className="space-y-3">
                            {data.habilitacao.equipe_tecnica.map((doc, i) => (
                                <li key={i} className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="font-semibold text-slate-800 mb-1 break-words">{doc.requisito}</div>
                                    <div className="text-right">
                                        <span className="inline-block text-[10px] text-blue-500 font-mono bg-blue-50 px-2 py-1 rounded break-all">Ref: {doc.citation}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="text-sm text-slate-500 italic p-2 text-center">Nenhuma exigência específica de equipe identificada (Engenheiros, Técnicos, etc).</p>
                     )}
                </div>
             </div>
        </div>
      </section>

      {/* Technical Specs (TR) */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="text-slate-600 flex-shrink-0" size={20} />
                Especificações Técnicas (Item a Item)
            </h2>
            <p className="text-xs text-slate-500 mt-1">Conferência fiel às especificações do Termo de Referência.</p>
        </div>
        <div className="overflow-x-auto pb-2">
            <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3 font-bold w-16 text-center whitespace-nowrap">Item</th>
                        <th className="px-6 py-3 font-bold min-w-[200px]">Descrição Completa e Especificações</th>
                        <th className="px-6 py-3 font-bold w-24 text-center whitespace-nowrap">Unid.</th>
                        <th className="px-6 py-3 font-bold w-24 text-center whitespace-nowrap">Qtd.</th>
                        <th className="px-6 py-3 font-bold w-32 text-right whitespace-nowrap">Fonte</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.itens.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-center font-bold text-slate-900 align-top">{item.id}</td>
                            <td className="px-6 py-4 align-top">
                                <div className="font-bold text-slate-800 mb-3 text-base break-words">{item.nome}</div>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <ul className="space-y-2">
                                        {item.specs.map((spec, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-slate-700 text-sm leading-relaxed break-words">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                                                {spec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-500 align-top">{item.unidade || "-"}</td>
                            <td className="px-6 py-4 text-center font-mono font-medium text-slate-700 align-top">{item.quantidade}</td>
                            <td className="px-6 py-4 text-right align-top">
                                <span className="inline-block text-[10px] text-blue-500 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-100 break-words max-w-[120px] text-left">
                                    {item.citation}
                                </span>
                            </td>
                        </tr>
                    ))}
                     {data.itens.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                Não foram encontrados itens detalhados. Verifique se o Termo de Referência foi anexado corretamente.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </section>

    </div>
  );
};

// Simple Icon component for the DocSection
function DollarSign({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    )
}