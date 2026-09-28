const OSS_MODELS = 'https://dl.lain42.top/models/hf';
const RUNTIME_URL = 'https://dl.lain42.top/wasm/transformers-js/3.8.1/transformers.bundle.mjs';
const WASM_BASE = 'https://dl.lain42.top/wasm/transformers-js/3.8.1/';
const MODEL_IDS = new Set([
  'onnx-community/whisper-tiny',
  'Xenova/multilingual-e5-small',
  'onnx-community/multilingual-MiniLMv2-L6-mnli-xnli-ONNX',
]);
const byId = (id) => document.getElementById(id);
const mib = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
const status = (message, kind = '') => {
  const node = byId('model-state');
  node.textContent = message;
  node.className = `badge${kind ? ` ${kind}` : ''}`;
};

let catalog;
let activePipe;
let activeModelId;
let busy = false;

if (navigator.storage?.estimate) {
  navigator.storage.estimate().then(({ quota = 0, usage = 0 }) => {
    const free = Math.max(0, quota - usage);
    byId('storage-state').textContent = free
      ? `浏览器可用空间约 ${Math.floor(free / 1024 / 1024)} MiB`
      : '浏览器存储空间未知';
  }).catch(() => { byId('storage-state').textContent = '浏览器存储空间未知'; });
}

function taskFor(id) {
  if (id.includes('whisper-tiny')) return 'asr';
  if (id.includes('multilingual-e5-small')) return 'search';
  return 'classify';
}

function currentModel() {
  return catalog?.models.find((model) => model.id === byId('model-select').value);
}

function showTask(id) {
  for (const name of ['asr', 'search', 'classify']) byId(`task-${name}`).hidden = name !== id;
}

function renderCatalog() {
  const select = byId('model-select');
  select.replaceChildren();
  for (const model of catalog.models) {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = `${model.label} · ${mib(model.downloadBytes)}`;
    select.append(option);
  }
  select.disabled = false;
  select.value = catalog.models[0].id;
  select.dispatchEvent(new Event('change'));
  const updated = new Date(catalog.updatedAt);
  byId('catalog-state').textContent = `模型目录更新于 ${Number.isNaN(+updated) ? catalog.updatedAt : updated.toLocaleString()}；浏览器可用空间和设备内存会影响加载。`;
  byId('source-list').replaceChildren();
  const list = document.createElement('ul');
  for (const model of catalog.models) {
    const row = document.createElement('li');
    const link = document.createElement('a');
    link.href = model.sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = model.id;
    row.append(link, document.createTextNode(` · ${model.license} · revision ${model.revision.slice(0, 7)} · ${mib(model.downloadBytes)}`));
    list.append(row);
  }
  byId('source-list').append(list);
}

async function fetchCatalog() {
  try {
    const response = await fetch(`${OSS_MODELS}/catalog.json`, { cache: 'no-store', mode: 'cors' });
    if (!response.ok) throw new Error(`模型目录 HTTP ${response.status}`);
    const data = await response.json();
    if (data.schemaVersion !== 1 || !Array.isArray(data.models) || !data.runtime || data.runtime.version !== '3.8.1') {
      throw new Error('OSS 模型目录版本不兼容');
    }
    data.models = data.models.filter((model) => MODEL_IDS.has(model.id) && /^[0-9a-f]{40}$/.test(model.revision) && Number.isFinite(model.downloadBytes));
    if (!data.models.length) throw new Error('目录里没有可用的模型');
    catalog = data;
    renderCatalog();
    byId('model-title').textContent = '选择一个实际任务';
    status('模型目录可用', 'ready');
    for (const button of document.querySelectorAll('.run-task')) button.disabled = false;
  } catch (error) {
    status('目录读取失败', 'error');
    byId('model-title').textContent = '暂时无法读取模型目录';
    byId('model-details').textContent = '检查网络，或稍后重试。模型与目录从 dl.lain42.top 的 OSS 直接读取。';
    byId('progress-label').textContent = error.message;
  }
}

function renderProgress(info) {
  const progress = byId('model-progress');
  const label = byId('progress-label');
  progress.hidden = false;
  if (info.status === 'progress' && Number.isFinite(info.progress)) {
    progress.value = Math.max(0, Math.min(100, info.progress));
    const file = String(info.file || '').split('/').pop();
    label.textContent = `${file ? `${file} · ` : ''}${progress.value.toFixed(1)}%`;
  } else if (info.status === 'done') {
    progress.value = 100;
    label.textContent = `${String(info.file || '模型文件').split('/').pop()} 已缓存`;
  } else if (info.status === 'initiate') {
    progress.value = 0;
    label.textContent = `正在从 OSS 读取 ${String(info.file || '模型文件').split('/').pop()}…`;
  }
}

async function ensurePipeline(model) {
  if (activePipe && activeModelId === model.id) return activePipe;
  if (activePipe) {
    status('释放上一个模型…');
    try { await activePipe.model?.dispose?.(); } catch { /* GC remains the fallback. */ }
    activePipe = undefined;
    activeModelId = undefined;
  }
  status('正在启动 WASM…');
  byId('progress-label').textContent = '模型首次使用时会从 OSS 下载并缓存，约 ' + mib(model.downloadBytes) + '。';
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  const { env, pipeline } = await import(RUNTIME_URL);
  env.remoteHost = OSS_MODELS;
  env.remotePathTemplate = '{model}/resolve/{revision}/{file}';
  env.useBrowserCache = true;
  env.allowLocalModels = false;
  env.backends.onnx.wasm.wasmPaths = WASM_BASE;
  env.backends.onnx.wasm.numThreads = 1;
  env.backends.onnx.wasm.proxy = false;
  activePipe = await pipeline(model.task, model.id, {
    revision: model.revision,
    dtype: 'q8',
    device: 'wasm',
    progress_callback: renderProgress,
  });
  activeModelId = model.id;
  status('WASM 模型已就绪', 'ready');
  byId('model-progress').value = 100;
  byId('progress-label').textContent = `模型已在本机加载；本页输入不会离开设备。`;
  return activePipe;
}

async function withModel(button, action, resultNode) {
  if (busy) return;
  const model = currentModel();
  if (!model) return;
  busy = true;
  button.disabled = true;
  for (const other of document.querySelectorAll('.run-task')) other.disabled = true;
  resultNode.textContent = '准备在本机运行…';
  const started = performance.now();
  try {
    status('本机准备中…');
    const pipe = await ensurePipeline(model);
    status('本机推理中…');
    const result = await action(pipe);
    resultNode.replaceChildren();
    if (typeof result === 'string') resultNode.textContent = result;
    else resultNode.append(result);
    status('本机任务完成', 'ready');
    byId('progress-label').textContent = `本机推理完成 · ${(performance.now() - started) / 1000 | 0} 秒`;
  } catch (error) {
    console.error(error);
    status('本机任务失败', 'error');
    resultNode.textContent = error?.message || '模型运行失败。请检查设备内存和 OSS 连接后重试。';
    byId('progress-label').textContent = '未发送输入内容；可以切换小模型或刷新页面后重试。';
  } finally {
    busy = false;
    for (const other of document.querySelectorAll('.run-task')) other.disabled = false;
  }
}

function toMono16k(buffer) {
  const targetRate = 16000;
  const outputLength = Math.ceil(buffer.length * targetRate / buffer.sampleRate);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const sourcePosition = i * buffer.sampleRate / targetRate;
    const before = Math.min(buffer.length - 1, Math.floor(sourcePosition));
    const after = Math.min(buffer.length - 1, before + 1);
    const mix = sourcePosition - before;
    let sample = 0;
    for (const channel of channels) sample += channel[before] * (1 - mix) + channel[after] * mix;
    output[i] = sample / channels.length;
  }
  return output;
}

byId('model-select').addEventListener('change', () => {
  if (!catalog) return;
  const model = currentModel();
  if (!model) return;
  const size = mib(model.downloadBytes);
  byId('model-title').textContent = model.label;
  byId('model-details').textContent = `${model.description} · ${size} 首次下载 · ${model.license} · revision ${model.revision.slice(0, 7)}`;
  showTask(taskFor(model.id));
  for (const output of ['asr-result', 'search-result', 'classify-result']) byId(output).textContent = '';
  byId('model-progress').hidden = true;
  byId('progress-label').textContent = '';
});

document.querySelector('[data-action="asr"]').addEventListener('click', (event) => {
  const file = byId('audio-file').files?.[0];
  const output = byId('asr-result');
  const button = event.currentTarget;
  if (!file) { output.textContent = '先选择一个音频文件。'; return; }
  if (file.size > 25 * 1024 * 1024) { output.textContent = '文件超过 25 MiB。请先裁短或压缩音频。'; return; }
  withModel(button, async (pipe) => {
    const audioContext = new AudioContext();
    try {
      const decoded = await audioContext.decodeAudioData(await file.arrayBuffer());
      if (decoded.duration > 90) throw new Error('音频超过 90 秒。请先裁短文件，避免手机内存和 CPU 压力过高。');
      const pcm = toMono16k(decoded);
      const transcript = await pipe(pcm, { sampling_rate: 16000, chunk_length_s: 30, stride_length_s: 5 });
      return transcript.text || '没有识别到语音。';
    } finally { await audioContext.close(); }
  }, output);
});

document.querySelector('[data-action="search"]').addEventListener('click', (event) => {
  const query = byId('search-query').value.trim();
  const passages = byId('search-passages').value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const output = byId('search-result');
  const button = event.currentTarget;
  if (!query || !passages.length) { output.textContent = '请填写搜索问题和至少一条笔记。'; return; }
  if (passages.length > 30) { output.textContent = '最多支持 30 条笔记，请分批检索。'; return; }
  withModel(button, async (pipe) => {
    const inputs = [`query: ${query}`, ...passages.map((text) => `passage: ${text}`)];
    const tensor = await pipe(inputs, { pooling: 'mean', normalize: true });
    const vectors = tensor.tolist();
    const queryVector = vectors[0];
    const ranking = passages.map((text, index) => ({ text, score: vectors[index + 1].reduce((sum, value, dim) => sum + value * queryVector[dim], 0) }));
    ranking.sort((a, b) => b.score - a.score);
    const list = document.createElement('ol');
    for (const item of ranking.slice(0, 8)) {
      const row = document.createElement('li');
      row.append(document.createTextNode(item.text + ' '));
      const score = document.createElement('span');
      score.className = 'score';
      score.textContent = `${(item.score * 100).toFixed(1)}%`;
      row.append(score);
      list.append(row);
    }
    return list;
  }, output);
});

document.querySelector('[data-action="classify"]').addEventListener('click', (event) => {
  const text = byId('classify-text').value.trim();
  const labels = byId('classify-labels').value.split(/[\r\n,，]+/).map((label) => label.trim()).filter(Boolean);
  const output = byId('classify-result');
  const button = event.currentTarget;
  if (!text || labels.length < 2) { output.textContent = '请填入文本和至少两个候选标签。'; return; }
  if (labels.length > 12) { output.textContent = '最多支持 12 个标签。'; return; }
  withModel(button, async (pipe) => {
    const prediction = await pipe(text, labels, { multi_label: false, hypothesis_template: '这段内容属于{}。' });
    const list = document.createElement('ol');
    prediction.labels.slice(0, 8).forEach((label, index) => {
      const row = document.createElement('li');
      row.append(document.createTextNode(`${label} `));
      const score = document.createElement('span');
      score.className = 'score';
      score.textContent = `${(prediction.scores[index] * 100).toFixed(1)}%`;
      row.append(score);
      list.append(row);
    });
    return list;
  }, output);
});

fetchCatalog();
