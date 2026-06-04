import AdBanner from '@/components/AdBanner'
import ContactForm from '@/components/ContactForm'
import { Bike, Users, BookOpen, Wrench, Heart, Mail } from 'lucide-react'

export const metadata = {
  title: 'Sobre — Virago 250 Peças',
  description:
    'Conheça o projeto Virago 250 Peças, um banco de dados colaborativo de peças compatíveis para Yamaha Virago 250. Fale conosco.',
}

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Ad top */}
      <div className="mb-8 flex justify-center">
        <AdBanner slot="top" />
      </div>

      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-orange-500">
          <Bike className="h-3.5 w-3.5" />
          Sobre o Projeto
        </div>
        <h1 className="font-display mb-4 text-4xl font-bold uppercase leading-tight tracking-wide text-zinc-900 dark:text-white md:text-5xl">
          Virago 250 <span className="text-orange-500">Peças</span>
        </h1>
        <p className="mx-auto max-w-xl text-zinc-600 dark:text-zinc-400">
          Um banco de dados colaborativo criado pela e para a comunidade de donos da Yamaha Virago 250 no Brasil.
        </p>
      </div>

      {/* Sobre o projeto */}
      <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-display mb-6 flex items-center gap-2 text-xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          <Heart className="h-5 w-5 text-orange-500" />
          Por que criamos isso?
        </h2>
        <div className="space-y-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>
            Quem é dono de uma{' '}
            <strong className="text-zinc-900 dark:text-white">Yamaha Virago 250</strong> sabe bem o
            desafio: encontrar peças de reposição originais é difícil, caro e muitas vezes impossível.
            A moto saiu de linha, as concessionárias não têm estoque e cada mecânico tem seu próprio
            &ldquo;segredo&rdquo; de quais peças funcionam.
          </p>
          <p>
            Esse site nasceu da necessidade real de centralizar esse conhecimento. Aqui você encontra
            quais peças de outras motos ou de reposição universal são compatíveis com a Virago 250,
            com nível de compatibilidade detalhado, instruções de adaptação e links diretos para
            compra.
          </p>
          <p>
            O banco de dados é{' '}
            <strong className="text-zinc-900 dark:text-white">colaborativo</strong>: qualquer pessoa
            pode sugerir uma peça compatível que descobriu. Cada contribuição passa por revisão antes
            de ser publicada, garantindo a qualidade das informações.
          </p>
        </div>
      </section>

      {/* Níveis de compatibilidade */}
      <section className="mb-8">
        <h2 className="font-display mb-6 text-xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Níveis de Compatibilidade
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-500/10 p-2.5">
              <Wrench className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="font-display mb-1.5 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
              Encaixe Perfeito
            </h3>
            <p className="text-xs leading-relaxed text-zinc-500">
              Peças que substituem a original sem nenhuma adaptação necessária. Instala e usa.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="mb-3 inline-flex rounded-xl bg-amber-500/10 p-2.5">
              <BookOpen className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="font-display mb-1.5 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
              Adaptação Simples
            </h3>
            <p className="text-xs leading-relaxed text-zinc-500">
              Peças que funcionam com pequenas modificações, descritas em detalhes no cadastro.
            </p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="mb-3 inline-flex rounded-xl bg-red-500/10 p-2.5">
              <Users className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="font-display mb-1.5 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
              Adaptação Complexa
            </h3>
            <p className="text-xs leading-relaxed text-zinc-500">
              Peças viáveis mas que exigem mais trabalho. Documentadas com detalhes pela comunidade.
            </p>
          </div>
        </div>
      </section>

      {/* Ad inline entre seções */}
      <div className="mb-8 flex justify-center">
        <AdBanner slot="inline" />
      </div>

      {/* Formulário de contato */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-display mb-2 flex items-center gap-2 text-xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          <Mail className="h-5 w-5 text-orange-500" />
          Fale Conosco
        </h2>
        <p className="mb-6 text-sm text-zinc-500">
          Dúvidas, sugestões ou interesse em anunciar no site? Preencha o formulário abaixo.
        </p>
        <ContactForm />
      </section>

      {/* Sidebar ad (mobile: bottom, desktop: inline na página) */}
      <div className="mt-8 flex justify-center lg:hidden">
        <AdBanner slot="sidebar" />
      </div>
    </div>
  )
}
