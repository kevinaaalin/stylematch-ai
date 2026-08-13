import { Toaster } from "@/components/ui/toaster"
import { pagesConfig } from './pages.config'
import { HashRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import BusinessAccessGate from './components/auth/BusinessAccessGate';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;
const businessOnlyPages = new Set(["FloorPlanVisualizer", "AIGenerate", "ReferenceCanvas"]);

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
          <MainPage />
        </LayoutWrapper>
      } />
      <Route path="/FreeCanvas" element={<LegacyFreeCanvasRedirect />} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              {businessOnlyPages.has(path) ? <BusinessAccessGate><Page /></BusinessAccessGate> : <Page />}
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
