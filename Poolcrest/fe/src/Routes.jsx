import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";

// Pages
import Homepage from "pages/homepage";
import ServicesOverview from "pages/services";
// import MaintenancePlans from "pages/maintenance-plans"; // disabled: route commented out
import AboutPoolcrest from "pages/about-poolcrest";
import EmergencyRepairs from "pages/emergency-repairs";
// import GetQuoteBookService from "pages/get-quote-book-service"; // disabled: route commented out

// Auth Pages
import Login from "pages/auth/Login";
import Register from "pages/auth/Register";
import ForgotPassword from "pages/auth/ForgotPassword";
import Profile from "pages/auth/Profile";

// Quote Pages
import CreateQuote from "pages/quotes/components/CreateQuote";
import QuotesList from "pages/quotes/components/QuotesList";
import QuotesLayout from "pages/quotes";
import QuoteDetail from "pages/quotes/components/QuoteDetail";

// Property Pages
import CreateProperty from "pages/properties/components/CreateProperty";
import PropertiesList from "pages/properties/components/PropertiesList";
import PropertyDetail from "pages/properties/components/PropertyDetail";
import PropertiesLayout from "pages/properties";

// Management Pages
import ManagementHome from "pages/management";
import AdminLayout from "pages/management/admin/AdminLayout";
import AdminServices from "pages/management/admin/AdminServices";
import ServiceView from "pages/management/admin/ServiceView";
import ServiceEdit from "pages/management/admin/ServiceEdit";
import AdminPromotions from "pages/management/admin/AdminPromotions";
import AdminUsers from "pages/management/admin/AdminUsers";
import AdminUserDetail from "pages/management/admin/AdminUserDetail";
import AdminQuotes from "pages/management/admin/AdminQuotes"; // disabled: admin quotes routes removed
import AdminQuoteDetail from "pages/management/admin/AdminQuoteDetail";
// import AdminProperties from "pages/management/admin/AdminProperties"; // disabled: admin properties routes removed

// 404 Page
import NotFound from "pages/NotFound";


import VerifyEmail from "pages/auth/VerifyEmail";
import Billing from "pages/billing/Billing";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/services" element={<ServicesOverview />} />

          {/* Disabled route: maintenance plans */}
          {/** <Route path="/maintenance-plans" element={<MaintenancePlans />} /> **/}
          
          <Route path="/about-poolcrest" element={<AboutPoolcrest />} />
          <Route path="/emergency-repairs" element={<EmergencyRepairs />} />
          
          {/* Disabled route: get-quote-book-service */}
          {/**
            <Route
              path="/get-quote-book-service"
              element={<GetQuoteBookService />}
            />
          **/}
          
          <Route
            path="/request-quote"
            element={<CreateQuote allowGuest />}
          />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />

          {/* Authentication Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/auth/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Billing */}
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />

          {/* Quote Routes (Protected, Nested with Layout) */}
          <Route
            path="/quotes"
            element={
              <ProtectedRoute>
                <QuotesLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<QuotesList />} />
            <Route path="create" element={<CreateQuote />} />
            <Route path=":id" element={<QuoteDetail />} />
          </Route>

          {/* Management admin (staff-only under /management-*) */}
          <Route
            path="/"
            element={
              <ProtectedRoute roles={["admin", "manager", "owner"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="management-services" element={<AdminServices />} />
            <Route path="management-services/:id" element={<ServiceView />} />
            <Route
              path="management-services/:id/edit"
              element={<ServiceEdit />}
            />
            <Route path="management-promotions" element={<AdminPromotions />} />
            <Route path="management-users" element={<AdminUsers />} />
            <Route path="management-users/:id" element={<AdminUserDetail />} />
            
            {/* Disabled admin routes for security hardening: global quotes/properties */}
            <Route path="management-quotes" element={<AdminQuotes />} />
            <Route path="management-quotes/:id" element={<AdminQuoteDetail />} />
            {/** <Route path="management-properties" element={<AdminProperties />} /> **/}
          </Route>

          {/* Properties (Protected, Nested with Layout) */}
          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <PropertiesLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PropertiesList />} />
            <Route path="create" element={<CreateProperty />} />
            <Route path=":id" element={<PropertyDetail />} />
          </Route>

          {/* Management */}
          <Route
            path="/management"
            element={
              <ProtectedRoute roles={["admin", "manager", "owner"]}>
                <ManagementHome />
              </ProtectedRoute>
            }
          />
          
          {/* Backward-compatible route */}
          <Route
            path="/create-quote"
            element={
              <ProtectedRoute>
                <QuotesLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CreateQuote />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
