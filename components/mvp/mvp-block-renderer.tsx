"use client";

import React from "react";
import {
  MvpBlock,
  HeroBlockContent,
  FeaturesBlockContent,
  PricingBlockContent,
  TestimonialsBlockContent,
  CtaBlockContent,
  DashboardBlockContent,
  FormBlockContent,
  DataTableBlockContent,
  StatsBlockContent,
  CustomBlockContent,
} from "@/types/mvp";
import {
  BarChart3,
  TrendingUp,
  Code,
  CheckCircle,
  Zap,
  Shield,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MvpBlockRendererProps {
  block: MvpBlock;
  isSelected: boolean;
  isEditing: boolean;
}

function getBlockData<T>(block: MvpBlock): T {
  return (block.data || block.content || {}) as T;
}

const FEATURE_ICONS = [Zap, Shield, Target, CheckCircle];

const MvpBlockRenderer: React.FC<MvpBlockRendererProps> = ({ block }) => {
  const renderHero = () => {
    const d = getBlockData<HeroBlockContent>(block);
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center text-white p-12 rounded-lg">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-center leading-tight max-w-3xl">
          {d.title || "Hero Title"}
        </h1>
        <p className="text-lg lg:text-xl mb-8 text-center text-blue-100 max-w-2xl">
          {d.subtitle || "Your subtitle here"}
        </p>
        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
          {d.ctaText || "Commencer"}
        </Button>
      </div>
    );
  };

  const renderFeatures = () => {
    const d = getBlockData<FeaturesBlockContent>(block);
    const items = d.items || [];
    return (
      <div className="h-full w-full p-8 bg-white rounded-lg">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">
          {d.title || "Fonctionnalités"}
        </h2>
        {d.description && (
          <p className="text-gray-500 text-center mb-8 max-w-2xl mx-auto">{d.description}</p>
        )}
        <div className={`grid gap-6 ${items.length <= 2 ? 'grid-cols-2' : items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {items.map((feature, idx) => {
            const Icon = FEATURE_ICONS[idx % FEATURE_ICONS.length];
            return (
              <div key={idx} className="p-6 border border-gray-100 rounded-xl bg-gradient-to-b from-gray-50 to-white hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPricing = () => {
    const d = getBlockData<PricingBlockContent>(block);
    const plans = d.plans || [];
    return (
      <div className="h-full w-full p-8 bg-gray-50 rounded-lg">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
          {d.title || "Tarification"}
        </h2>
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, idx) => {
            const isPopular = idx === 1;
            return (
              <div
                key={idx}
                className={`rounded-xl p-6 flex flex-col ${
                  isPopular
                    ? "bg-blue-600 text-white ring-2 ring-blue-600 shadow-lg scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                {isPopular && (
                  <span className="text-xs font-semibold bg-blue-500 text-white px-3 py-1 rounded-full self-start mb-4">
                    Populaire
                  </span>
                )}
                <h3 className={`font-bold text-lg mb-1 ${isPopular ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className={`text-3xl font-bold mb-4 ${isPopular ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </div>
                {plan.description && (
                  <p className={`text-sm mb-4 ${isPopular ? "text-blue-100" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                )}
                <ul className="space-y-2 text-sm flex-1 mb-6">
                  {(plan.features || []).map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 ${isPopular ? "text-blue-100" : "text-gray-600"}`}>
                      <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isPopular ? "text-blue-200" : "text-green-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    isPopular
                      ? "bg-white text-blue-600 hover:bg-gray-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Choisir
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTestimonials = () => {
    const d = getBlockData<TestimonialsBlockContent>(block);
    const testimonials = d.testimonials || [
      { author: "Client satisfait", content: "Excellent produit !", role: "CEO" },
    ];
    return (
      <div className="h-full w-full p-8 bg-white rounded-lg">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
          {d.title || "Témoignages"}
        </h2>
        <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-700 italic mb-4 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
              <div>
                <p className="font-semibold text-gray-900">{t.author}</p>
                {t.role && <p className="text-sm text-gray-500">{t.role}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCta = () => {
    const d = getBlockData<CtaBlockContent>(block);
    return (
      <div className="h-full w-full bg-gradient-to-r from-purple-600 to-pink-600 flex flex-col items-center justify-center text-white p-12 rounded-lg">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-center max-w-2xl">
          {d.title || "Prêt à commencer ?"}
        </h2>
        <p className="mb-8 text-lg text-purple-100 text-center max-w-xl">
          {d.description || "Rejoignez-nous dès aujourd'hui"}
        </p>
        <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8">
          {d.ctaText || "Démarrer"}
        </Button>
      </div>
    );
  };

  const renderDashboard = () => {
    const d = getBlockData<DashboardBlockContent>(block);
    const widgets = d.widgets || [
      { id: "1", type: "metric", title: "Utilisateurs", metric: "1,234" },
      { id: "2", type: "metric", title: "Revenus", metric: "€45.2K" },
      { id: "3", type: "metric", title: "Croissance", metric: "+23%" },
      { id: "4", type: "metric", title: "Actifs", metric: "892" },
    ];
    return (
      <div className="h-full w-full p-8 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{d.title || "Dashboard"}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {widgets.map((w, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-gray-500 text-sm mb-1">{w.title}</p>
              <p className="text-2xl font-bold text-blue-600">{w.metric}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-gray-100 rounded-xl p-8 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <BarChart3 className="mx-auto mb-2 h-10 w-10" />
            <p className="text-sm">Graphique interactif</p>
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    const d = getBlockData<FormBlockContent>(block);
    const fields = d.fields || [
      { id: "1", label: "Nom", type: "text" as const, placeholder: "Votre nom" },
      { id: "2", label: "Email", type: "email" as const, placeholder: "votre@email.com" },
      { id: "3", label: "Message", type: "textarea" as const, placeholder: "Votre message" },
    ];
    return (
      <div className="h-full w-full p-8 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">{d.title || "Contact"}</h2>
        {d.description && <p className="text-gray-500 mb-6">{d.description}</p>}
        <div className="space-y-4 max-w-md">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder={field.placeholder}
                  rows={3}
                  readOnly
                />
              ) : (
                <input
                  type={field.type}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder={field.placeholder}
                  readOnly
                />
              )}
            </div>
          ))}
          <Button className="w-full">{d.submitButtonText || "Envoyer"}</Button>
        </div>
      </div>
    );
  };

  const renderDataTable = () => {
    const d = getBlockData<DataTableBlockContent>(block);
    const columns = d.columns || [
      { id: "1", label: "Nom", type: "string" as const },
      { id: "2", label: "Statut", type: "string" as const },
      { id: "3", label: "Date", type: "date" as const },
    ];
    const rows = d.rows || [
      { "1": "Exemple A", "2": "Actif", "3": "28/02/2025" },
      { "1": "Exemple B", "2": "En attente", "3": "27/02/2025" },
      { "1": "Exemple C", "2": "Terminé", "3": "26/02/2025" },
    ];
    return (
      <div className="h-full w-full p-8 bg-white rounded-lg overflow-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{d.title || "Données"}</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th key={col.id} className="text-left py-3 px-4 font-semibold text-gray-600 border-b">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  {columns.map((col) => (
                    <td key={col.id} className="py-3 px-4 text-gray-700">
                      {String((row as Record<string, unknown>)[col.id] || (row as Record<string, unknown>)[col.label] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    const d = getBlockData<StatsBlockContent>(block);
    const stats = d.stats || [
      { label: "Utilisateurs", value: "1,234", change: "+12%" },
      { label: "Revenus", value: "€45.2K", change: "+23%" },
      { label: "Croissance", value: "+45%", change: "+8%" },
      { label: "Satisfaction", value: "98%", change: "+3%" },
    ];
    return (
      <div className="h-full w-full p-8 bg-gradient-to-br from-gray-50 to-white rounded-lg">
        {d.title && <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">{d.title}</h2>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              {stat.change && (
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> {stat.change}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustom = () => {
    const d = getBlockData<CustomBlockContent>(block);
    return (
      <div className="h-full w-full p-8 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Code className="mx-auto mb-3 h-8 w-8" />
          <p className="text-sm font-medium">Contenu personnalisé</p>
          {d.content && <p className="text-xs mt-2 max-w-md">{d.content}</p>}
        </div>
      </div>
    );
  };

  const renderers: Record<MvpBlock["type"], () => React.ReactNode> = {
    hero: renderHero,
    features: renderFeatures,
    pricing: renderPricing,
    testimonials: renderTestimonials,
    cta: renderCta,
    dashboard: renderDashboard,
    form: renderForm,
    "data-table": renderDataTable,
    stats: renderStats,
    custom: renderCustom,
  };

  return (
    <div className="h-full w-full">
      {renderers[block.type]?.() || renderCustom()}
    </div>
  );
};

export default MvpBlockRenderer;
