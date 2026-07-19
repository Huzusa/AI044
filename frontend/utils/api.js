const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('inkscribe_token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  })
  
  const data = await res.json()
  return { res, data }
}

export async function getArticles(params = {}) {
  const query = new URLSearchParams(params).toString()
  const { data } = await apiRequest(`/articles?${query}`)
  return data
}

export async function getArticle(id) {
  const { data } = await apiRequest(`/articles/${id}`)
  return data
}

export async function createArticle(data) {
  const { res, data: result } = await apiRequest('/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return { res, result }
}

export async function updateArticle(id, data) {
  const { res, data: result } = await apiRequest(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return { res, result }
}

export async function deleteArticle(id) {
  const { res, data: result } = await apiRequest(`/articles/${id}`, {
    method: 'DELETE',
  })
  return { res, result }
}

export async function login(data) {
  const { res, data: result } = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return { res, result }
}

export async function register(data) {
  const { res, data: result } = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return { res, result }
}

export async function getCurrentUser() {
  const { data } = await apiRequest('/auth/me')
  return data
}

export async function generateOutline(keywords) {
  const { res, data } = await apiRequest('/ai/generate-outline', {
    method: 'POST',
    body: JSON.stringify({ keywords }),
  })
  return { res, data }
}

export async function findMaterials(topic) {
  const { res, data } = await apiRequest('/ai/find-materials', {
    method: 'POST',
    body: JSON.stringify({ topic }),
  })
  return { res, data }
}

export async function expressionRefs(meaning) {
  const { res, data } = await apiRequest('/ai/expression-refs', {
    method: 'POST',
    body: JSON.stringify({ meaning }),
  })
  return { res, data }
}

export async function deepQuestions(content, context = '') {
  const { res, data } = await apiRequest('/ai/deep-questions', {
    method: 'POST',
    body: JSON.stringify({ content, context }),
  })
  return { res, data }
}

export async function inspirationFragments(theme) {
  const { res, data } = await apiRequest('/ai/inspiration-fragments', {
    method: 'POST',
    body: JSON.stringify({ theme }),
  })
  return { res, data }
}

export async function analyzeArticle(title, content) {
  const { res, data } = await apiRequest('/ai/analyze-article', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  })
  return { res, data }
}

export async function generateTitles(title, content) {
  const { res, data } = await apiRequest('/ai/generate-titles', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  })
  return { res, data }
}

export async function polishSentence(sentence, context = '') {
  const { res, data } = await apiRequest('/ai/polish-sentence', {
    method: 'POST',
    body: JSON.stringify({ sentence, context }),
  })
  return { res, data }
}

export async function continueWriting(content, context = '') {
  const { res, data } = await apiRequest('/ai/continue-writing', {
    method: 'POST',
    body: JSON.stringify({ content, context }),
  })
  return { res, data }
}
