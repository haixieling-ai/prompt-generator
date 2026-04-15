"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type PromptForm = {
  productType: string;
  style: string;
  scene: string;
  cameraAngle: string;
  lighting: string;
  material: string;
  composition: string;
  props: string;
  constraints: string;
};

type PromptHistory = {
  id: string;
  createdAt: string;
  form: PromptForm;
  zhPrompt: string;
  enPrompt: string;
};

const STORAGE_KEY = "prompt-generator-history";

const defaultForm: PromptForm = {
  productType: "",
  style: "",
  scene: "",
  cameraAngle: "",
  lighting: "",
  material: "",
  composition: "",
  props: "",
  constraints: "",
};

const fields: Array<{ key: keyof PromptForm; label: string; placeholder: string }> = [
  { key: "productType", label: "产品类型", placeholder: "例如：香水瓶、耳机、手表" },
  { key: "style", label: "风格", placeholder: "例如：极简、未来感、商业大片" },
  { key: "scene", label: "场景", placeholder: "例如：岩石台面、晨雾森林、展厅" },
  { key: "cameraAngle", label: "镜头角度", placeholder: "例如：俯拍、低机位、45度侧拍" },
  { key: "lighting", label: "光线", placeholder: "例如：柔光箱主光 + 边缘轮廓光" },
  { key: "material", label: "材质", placeholder: "例如：玻璃、金属拉丝、丝绸" },
  { key: "composition", label: "构图", placeholder: "例如：居中构图、留白、三分法" },
  { key: "props", label: "摆件", placeholder: "例如：绿植、石块、水滴、亚克力块" },
  { key: "constraints", label: "约束条件", placeholder: "例如：不要人物、不要logo、避免过曝" },
];

function buildPrompts(form: PromptForm) {
  const zhPrompt = `请生成一张${form.style || "高质感"}产品视觉图，主体是${form.productType || "产品"}，场景在${form.scene || "简洁背景"}，采用${form.cameraAngle || "专业商业拍摄角度"}，光线为${form.lighting || "电影级布光"}，突出${form.material || "真实材质细节"}，构图使用${form.composition || "平衡构图"}，搭配${form.props || "少量氛围摆件"}。要求：${form.constraints || "画面干净、细节清晰、质感高级"}。`;

  const enPrompt = `Create a ${form.style || "premium"} product visual. Main subject: ${form.productType || "product"}. Scene: ${form.scene || "clean minimal background"}. Camera angle: ${form.cameraAngle || "professional commercial shot"}. Lighting: ${form.lighting || "cinematic lighting"}. Emphasize material details: ${form.material || "realistic textures"}. Composition: ${form.composition || "balanced composition"}. Props: ${form.props || "subtle atmosphere props"}. Constraints: ${form.constraints || "clean frame, crisp details, high-end look"}.`;

  return { zhPrompt, enPrompt };
}

export default function Home() {
  const [form, setForm] = useState<PromptForm>(defaultForm);
  const [zhPrompt, setZhPrompt] = useState("");
  const [enPrompt, setEnPrompt] = useState("");
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [copyState, setCopyState] = useState<"zh" | "en" | "">("");

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as PromptHistory[];
      if (Array.isArray(parsed)) {
        setHistory(parsed.slice(0, 8));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const canGenerate = useMemo(
    () => Object.values(form).some((value) => value.trim().length > 0),
    [form],
  );

  const updateField = (key: keyof PromptForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveHistory = (item: PromptHistory) => {
    setHistory((prev) => {
      const next = [item, ...prev].slice(0, 8);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompts = buildPrompts(form);
    setZhPrompt(prompts.zhPrompt);
    setEnPrompt(prompts.enPrompt);

    saveHistory({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      form,
      ...prompts,
    });
  };

  const copyText = async (text: string, type: "zh" | "en") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(type);
      setTimeout(() => setCopyState(""), 1200);
    } catch {
      setCopyState("");
    }
  };

  const restoreHistory = (item: PromptHistory) => {
    setForm(item.form);
    setZhPrompt(item.zhPrompt);
    setEnPrompt(item.enPrompt);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
      <header className="mb-8 space-y-3">
        <p className="text-sm tracking-[0.2em] text-slate-400">PROMPT GENERATOR</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">产品视觉提示词生成器</h1>
        <p className="max-w-3xl text-slate-300">
          输入创意参数，快速生成高质量中英文提示词，支持一键复制与本地历史记录。
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={handleGenerate} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className="space-y-2">
                <span className="text-sm font-medium text-slate-200">{field.label}</span>
                <input
                  value={form[field.key]}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 outline-none ring-sky-400 transition placeholder:text-slate-500 focus:ring-2"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={!canGenerate}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              生成提示词
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(defaultForm);
                setZhPrompt("");
                setEnPrompt("");
              }}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              清空
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">中文提示词</h2>
              <button
                type="button"
                disabled={!zhPrompt}
                onClick={() => copyText(zhPrompt, "zh")}
                className="rounded-lg border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copyState === "zh" ? "已复制" : "复制"}
              </button>
            </div>
            <p className="min-h-24 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {zhPrompt || "生成后将在这里显示中文提示词。"}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">English Prompt</h2>
              <button
                type="button"
                disabled={!enPrompt}
                onClick={() => copyText(enPrompt, "en")}
                className="rounded-lg border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copyState === "en" ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="min-h-24 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {enPrompt || "The generated English prompt will appear here."}
            </p>
          </article>
        </aside>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">本地历史记录</h2>
          <button
            type="button"
            onClick={() => {
              setHistory([]);
              localStorage.removeItem(STORAGE_KEY);
            }}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
          >
            清空历史
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-slate-400">暂无历史记录，生成后会自动保存在当前浏览器。</p>
        ) : (
          <ul className="space-y-3">
            {history.map((item) => (
              <li key={item.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="line-clamp-1 text-sm text-slate-200">{item.zhPrompt}</p>
                  <button
                    type="button"
                    onClick={() => restoreHistory(item)}
                    className="shrink-0 rounded-lg border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    恢复
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
