import { Toaster } from "@/components/ui/toaster"
import { pagesConfig } from './pages.config'
import { Suspense } from 'react';
import { HashRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import BusinessAccessGate from './components/auth/BusinessAccessGate';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;
const businessOnlyPages = new Set(["FloorPlanVisualizer", "AIGenerate", "ReferenceCanvas"]);
const PageLoading = () => <div className="grid min-h-[55vh] place-items-center text-sm text-stone-500">頁面載入中...</div>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const LegacyFreeCanvasRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/ReferenceCanvas${location.search}`} replace />;
};

const LocalApp = () => {
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <Suspense fallback={<PageLoading />}><MainPage /></Suspense>
        </LayoutWrapper>
      } />
      <Route path="/FreeCanvas" element={<LegacyFreeCanvasRedirect />} />
      <Route path="/StyleTestz/*" element={<Navigate to="/StyleTest" replace />} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Suspense fallback={<PageLoading />}>{businessOnlyPages.has(path) ? <BusinessAccessGate><Page /></BusinessAccessGate> : <Page />}</Suspense>
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <Router>
      <LocalApp />
      <Toaster />
    </Router>
  )
}

export default App
