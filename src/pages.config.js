/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import { lazy } from 'react';
const Home = lazy(() => import('./pages/Home'));
const StyleTest = lazy(() => import('./pages/StyleTest'));
const Requirements = lazy(() => import('./pages/Requirements'));
const Cases = lazy(() => import('./pages/Cases'));
const IsafeProjects = lazy(() => import('./pages/IsafeProjects'));
const IsafeDirectIntake = lazy(() => import('./pages/IsafeDirectIntake'));
const AIProposal = lazy(() => import('./pages/AIProposal'));
const AIGenerate = lazy(() => import('./pages/AIGenerate'));
const ReferenceCanvas = lazy(() => import('./pages/ReferenceCanvas'));
const MyProjects = lazy(() => import('./pages/MyProjects'));
const PricingPlans = lazy(() => import('./pages/PricingPlans'));
const ProposalReport = lazy(() => import('./pages/ProposalReport'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Workspace = lazy(() => import('./pages/Workspace'));
const FloorPlanVisualizer = lazy(() => import('./pages/FloorPlanVisualizer'));
const Knowledge = lazy(() => import('./pages/Knowledge'));
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "StyleTest": StyleTest,
    "Requirements": Requirements,
    "Cases": Cases,
    "IsafeProjects": IsafeProjects,
    "IsafeDirectIntake": IsafeDirectIntake,
    "AIProposal": AIProposal,
    "AIGenerate": AIGenerate,
    "ReferenceCanvas": ReferenceCanvas,
    "MyProjects": MyProjects,
    "PricingPlans": PricingPlans,
    "ProposalReport": ProposalReport,
    "ProjectDetail": ProjectDetail,
    "Workspace": Workspace,
    "FloorPlanVisualizer": FloorPlanVisualizer,
    "Knowledge": Knowledge,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
