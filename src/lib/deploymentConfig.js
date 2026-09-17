const loopback = host => ['127.0.0.1', 'localhost', '[::1]'].includes(host);
export function resolveDeployment({pageOrigin, apiOrigin = ''}) {
  const page = new URL(pageOrigin);
  const local = loopback(page.hostname);
  const target = new URL(apiOrigin || (local ? 'http://127.0.0.1:4180' : page.origin));
  if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password || target.search || target.hash || target.pathname !== '/') throw new Error('API 設定必須是無帳密、路徑或查詢參數的 HTTP(S) origin。');
  if (!local && (target.protocol !== 'https:' || loopback(target.hostname))) throw new Error('公開網站的 API 必須使用非本機 HTTPS 位址。');
  return {apiOrigin: target.origin, localCredentialsAllowed: local && loopback(target.hostname)};
}
const deployment = resolveDeployment({pageOrigin: globalThis.location?.origin || 'http://127.0.0.1', apiOrigin: import.meta.env?.VITE_ISAFE_API_ORIGIN || ''});
export const API_ORIGIN = deployment.apiOrigin;
export function localDevelopmentToken() {
  if (!deployment.localCredentialsAllowed) throw new Error('此 API 功能尚未配置正式登入，已阻擋開發身分送往公開服務；請由管理員完成伺服器端身分整合。');
  return 'local-dev-headquarter';
}
